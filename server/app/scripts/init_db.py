import asyncio
import os
import sys

from loguru import logger
from sqlalchemy import func, select

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


async def init_roles(session):
    """初始化角色"""
    logger.info("--- 1. 开始检查角色数据 ---")
    for role_data in INIT_ROLES:
        r_code = role_data["roleCode"]

        # 检查是否存在
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

        # 检查用户是否存在
        result = await session.execute(
            select(SysUserEntity).where(SysUserEntity.username == username)
        )
        exists_user = result.scalar_one_or_none()

        if not exists_user:
            # 1. 查找该用户需要的角色对象
            # JSON结构: roles: [{"roleCode": "admin"}]
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

            # 2. 创建用户对象
            # 注意：JSON 里的 mobilePhone -> mobile_phone, isActive -> is_active
            new_user = SysUserEntity(
                username=username,
                nickname=user_data["nickname"],
                email=user_data["email"],
                # 修正: password -> password_hash
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                is_active=user_data.get("isActive", True),
                avatar=user_data.get("avatar"),
                gender=user_data.get("gender", 0),
                mobile_phone=user_data.get("mobilePhone"),
                is_system=True,  # 初始化脚本创建的通常认为是系统用户，可选
            )

            # 3. 关联角色 (Many-to-Many)
            # SQLAlchemy 会自动处理中间表 sys_user_role 的插入
            new_user.roles = list(roles_db)

            session.add(new_user)
            logger.info(f"新增用户: {username}")
        else:
            logger.info(f"跳过已存在用户: {username}")

    await session.commit()


async def init_menus(session):
    """初始化菜单 (权限表)"""
    logger.info("--- 3. 开始检查菜单/权限数据 ---")

    # 1. 检查路由表是否有数据
    result = await session.execute(select(func.count()).select_from(PermissionsEntity))
    count = result.scalar()

    if count > 0:
        logger.warning("菜单表已有数据，跳过初始化。")
        return

    logger.info("菜单表为空，开始写入初始化数据...")

    # 递归插入函数
    async def create_menu_recursive(menus_list, parent_id=0):
        for menu_item in menus_list:
            # 提取 children，不写入当前行
            children = menu_item.get("children", [])

            # 构建模型对象 (字段映射: JSON CamelCase -> Model snake_case)
            new_menu = PermissionsEntity(
                parent_id=parent_id,
                title=menu_item["title"],
                name=menu_item["name"],
                code=menu_item.get("code"),
                type=menu_item.get("type", 1),  # 默认为菜单
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

            # 递归处理子菜单
            if children:
                await create_menu_recursive(children, parent_id=new_menu.id)

    # 开始插入
    try:
        await create_menu_recursive(INIT_MENUS, parent_id=0)
        await session.commit()
        logger.success("菜单数据初始化完成")
    except Exception as e:
        logger.error(f"菜单初始化失败，正在回滚: {e}")
        await session.rollback()
        raise e


async def main():
    logger.info(f"🚀 开始初始化数据脚本 - {settings.APP_NAME}")

    async with AsyncSessionLocal() as session:
        try:
            await init_roles(session)
            await init_users(session)
            await init_menus(session)

            logger.success("✅ 所有初始化数据处理完毕！")
        except Exception as e:
            logger.error(f"❌ 初始化脚本执行发生严重错误: {e}")
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
