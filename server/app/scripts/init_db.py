import asyncio
import os
import shutil
import sys
from pathlib import Path

from loguru import logger
from sqlalchemy import func, select, text

sys.path.append(os.getcwd())

from data import INIT_MENUS, INIT_ROLES, INIT_USERS

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.modules.auth.security import get_password_hash
from app.modules.permissions.models import PermissionsEntity
from app.modules.roles.models import SysRoleEntity
from app.modules.users.models import SysUserEntity

logger.remove()
logger.add(sys.stderr, level="INFO")


def init_seed_images():
    """同步种子图片到静态资源上传目录"""
    logger.info("--- 0. 开始检查和同步测试图片 ---")

    SCRIPT_DIR = Path(__file__).resolve().parent
    PROJECT_ROOT = SCRIPT_DIR.parent.parent

    SEED_IMAGES_DIR = SCRIPT_DIR / "seed_data" / "images"
    UPLOAD_DIR = PROJECT_ROOT / "static" / "uploads" / "seed"

    # 如果没有种子文件夹，给出提示并跳过
    if not SEED_IMAGES_DIR.exists():
        logger.warning(f"种子图片目录不存在，跳过同步: {SEED_IMAGES_DIR}")
        return

    # 确保目标 uploads 目录存在
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    copied_count = 0
    # 遍历源目录下的所有图片
    for img_path in SEED_IMAGES_DIR.iterdir():
        if img_path.is_file():
            dest_path = UPLOAD_DIR / img_path.name
            # 判断目标目录是否已经存在该图片
            if not dest_path.exists():
                shutil.copy2(img_path, dest_path)
                logger.info(f"已复制图片: {img_path.name}")
                copied_count += 1

    if copied_count > 0:
        logger.success(f"成功同步了 {copied_count} 张测试图片！")
    else:
        logger.info("图片检查完成，无新图片需要同步。")


async def init_roles(session):
    """初始化角色"""
    logger.info("--- 2. 开始检查角色数据 ---")
    for role_data in INIT_ROLES:
        r_code = role_data["roleCode"]

        result = await session.execute(
            select(SysRoleEntity).where(SysRoleEntity.role_code == r_code)
        )
        exists = result.scalar_one_or_none()

        if not exists:
            new_role = SysRoleEntity(
                role_name=role_data["roleName"],
                role_code=role_data["roleCode"],
                status=role_data.get("status", True),
                sort=role_data.get("sort", 0),
                is_system=role_data.get("isSystem", False),
                role_level=role_data.get("roleLevel", 10),
            )

            # 建立关联关系
            menu_ids = role_data.get("menu_ids", [])
            if menu_ids:
                menus_result = await session.execute(
                    select(PermissionsEntity).where(PermissionsEntity.id.in_(menu_ids))
                )
                permissions = menus_result.scalars().all()
                new_role.permissions = list(permissions)

            session.add(new_role)
            logger.info(f"新增角色: {role_data['roleName']} ({r_code})")
        else:
            logger.info(f"跳过已存在角色: {r_code}")

    await session.commit()


async def init_users(session):
    """初始化用户"""
    logger.info("--- 2. 开始检查用户数据 ---")
    for user_data in INIT_USERS:
        username = user_data["username"]

        result = await session.execute(
            select(SysUserEntity).where(SysUserEntity.username == username)
        )
        exists_user = result.scalar_one_or_none()

        if not exists_user:
            target_role_codes = [r["roleCode"] for r in user_data.get("roles", [])]
            roles_result = await session.execute(
                select(SysRoleEntity).where(
                    SysRoleEntity.role_code.in_(target_role_codes)
                )
            )
            roles_db = roles_result.scalars().all()

            if not roles_db and target_role_codes:
                logger.warning(
                    f"警告: 用户 {username} 需要的角色 {target_role_codes} 在数据库中未找到，将创建无角色用户。"
                )

            new_user = SysUserEntity(
                username=username,
                nickname=user_data["nickname"],
                email=user_data["email"],
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                is_active=user_data.get("isActive", True),
                avatar=user_data.get("avatar"),
                gender=user_data.get("gender", 0),
                mobile_phone=user_data.get("mobilePhone"),
                is_system=True,
            )

            new_user.roles = list(roles_db)
            session.add(new_user)
            logger.info(f"新增用户: {username}")
        else:
            logger.info(f"跳过已存在用户: {username}")

    await session.commit()


async def init_menus(session):
    """初始化菜单 (权限表)"""
    logger.info("--- 1. 开始检查菜单/权限数据 ---")

    result = await session.execute(select(func.count()).select_from(PermissionsEntity))
    count = result.scalar()

    if count > 0:
        logger.warning("菜单表已有数据，跳过初始化。")
        return

    logger.info("菜单表为空，开始写入初始化数据...")

    async def create_menu_recursive(menus_list, parent_id=0):
        for menu_item in menus_list:
            children = menu_item.get("children", [])

            # 添加 id 取值逻辑
            new_menu = PermissionsEntity(
                id=menu_item.get("id"),
                parent_id=parent_id,
                title=menu_item["title"],
                name=menu_item.get("name", ""),
                code=menu_item.get("code"),
                type=menu_item.get("type", 1),
                path=menu_item.get("path", ""),
                component_path=menu_item.get("componentPath", ""),
                icon=menu_item.get("icon"),
                redirect=menu_item.get("redirect"),
                sort=menu_item.get("sort", 0),
                keep_alive=menu_item.get("keepAlive", True),
                is_custom_name=menu_item.get("isCustomName", False),
                hide_in_menu=menu_item.get("hideInMenu", False),
                hide_breadcrumb=menu_item.get("hideBreadcrumb", False),
                active_menu=menu_item.get("activeMenu"),
                is_login=menu_item.get("isLogin", False),
                link=menu_item.get("link"),
                permanent=menu_item.get("permanent", False),
                single_menu=menu_item.get("singleMenu", False),
                auth=menu_item.get("auth"),
                auths=menu_item.get("auths"),
                query=menu_item.get("query"),
            )

            session.add(new_menu)
            await session.flush()

            if children:
                await create_menu_recursive(children, parent_id=new_menu.id)

    try:
        await create_menu_recursive(INIT_MENUS, parent_id=0)
        await session.commit()

        # 兼容处理：尝试修复 PostgreSQL 显式插入 ID 后自增序列不同步的问题
        try:
            dialect = session.bind.dialect.name
            if dialect == "postgresql":
                await session.execute(
                    text(
                        "SELECT setval('sys_permissions_id_seq', (SELECT MAX(id) FROM sys_permissions));"
                    )
                )
                await session.commit()
        except Exception:
            pass

        logger.success("菜单数据初始化完成")
    except Exception as e:
        logger.error(f"菜单初始化失败，正在回滚: {e}")
        await session.rollback()
        raise e


async def main():
    logger.info(f"🚀 开始初始化数据脚本 - {settings.APP_NAME}")

    # === 优先执行文件操作 ===
    try:
        init_seed_images()
    except Exception as e:
        # 文件拷贝失败不要阻断数据库的初始化
        logger.error(f"图片同步发生异常: {e}")

    # === 执行数据库初始化逻辑 ===
    async with AsyncSessionLocal() as session:
        try:
            await init_menus(session)
            await init_roles(session)
            await init_users(session)

            logger.success("✅ 所有初始化数据处理完毕！")
        except Exception as e:
            logger.error(f"❌ 初始化脚本执行发生严重错误: {e}")
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
