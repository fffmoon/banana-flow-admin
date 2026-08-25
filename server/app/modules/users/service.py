from datetime import datetime

from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.core.i18n import i18n
from app.modules.auth.security import get_password_hash, verify_password
from app.modules.roles.models import SysRoleEntity
from app.utils.handler_permission import has_permission
from app.utils.pagination import paginate

from .models import SysUserEntity
from .repository import UserRepository
from .schemas import (
    UserAdminUpdate,
    UserCreate,
    UserFilter,
    UserPasswordUpdate,
    UserProfileUpdate,
)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    def check_data_scope(self, current_user: SysUserEntity, target_user: SysUserEntity):
        """权限层级校验"""
        if current_user.id == target_user.id:
            return
        if target_user.is_super_admin:
            raise HTTPException(
                status_code=403,
                detail=i18n.t("user.error.operation_super_admin_forbidden"),
            )
        if not has_permission(current_user.role_level, target_user.role_level):
            raise HTTPException(
                status_code=403, detail=i18n.t("user.error.insufficient_permission")
            )

    async def get_users_list(self, filters: UserFilter, page_params):
        """异步查询列表"""
        stmt = self.repo.get_multi_stmt(filters)
        return await paginate(self.db, stmt, page_params)

    async def create_user(
        self, user_in: UserCreate, current_user: SysUserEntity
    ) -> SysUserEntity:
        # 直接调用 repo 实例的方法
        return await self.repo.create(user_in)

    async def update_user(
        self, user_id: int, user_in: UserAdminUpdate, current_user: SysUserEntity
    ) -> SysUserEntity:
        # 1. 异步获取目标用户
        user = await self.repo.get(user_id)
        if not user:
            raise HTTPException(
                status_code=404, detail=i18n.t("user.error.user_not_found")
            )

        self.check_data_scope(current_user, user)

        # 2. 角色变更校验
        if user_in.role_ids is not None:
            roles_res = await self.db.execute(select(SysRoleEntity))
            all_roles = roles_res.scalars().all()
            role_level_map = {r.id: r.role_level for r in all_roles}

            for r_id in user_in.role_ids:
                target_level = role_level_map.get(r_id, 999)
                if not has_permission(current_user.role_level, target_level):
                    raise HTTPException(
                        status_code=400,
                        detail=i18n.t("user.error.cannot_assign_higher_role"),
                    )

        if current_user.id == user_id and user_in.is_active is False:
            raise HTTPException(
                status_code=400, detail=i18n.t("user.error.cannot_disable_self")
            )

        return await self.repo.update(user_id, user_in)

    # 更新个人资料
    async def update_me(
        self, user_id: int, user_in: UserProfileUpdate, current_user: SysUserEntity
    ) -> SysUserEntity:
        # 准备更新数据
        update_data = user_in.model_dump(exclude_unset=True)
        if not update_data:
            # 如果没有传任何值，直接返回当前用户
            return await self.repo.get(user_id)

        # 唯一性校验
        check_email = update_data.get("email")
        check_phone = update_data.get("mobile_phone")

        if check_email or check_phone:
            # 查询是否存在冲突的用户
            exist_user = await self.repo.get_by_email_or_phone(
                email=check_email, phone=check_phone
            )
            if exist_user and exist_user.id != user_id:
                if check_email and exist_user.email == check_email:
                    raise HTTPException(
                        status_code=400, detail=i18n.t("user.error.email_taken")
                    )
                if check_phone and exist_user.mobile_phone == check_phone:
                    raise HTTPException(
                        status_code=400, detail=i18n.t("user.error.phone_taken")
                    )

        # 执行更新
        return await self.repo.update_fields(user_id, update_data)

    async def delete_user(self, user_id: int, current_user: SysUserEntity):
        user = await self.repo.get(user_id)
        if not user:
            raise HTTPException(
                status_code=404, detail=i18n.t("user.error.user_not_found")
            )
        if user.is_system:
            raise HTTPException(
                status_code=400, detail=i18n.t("user.error.system_user_forbidden")
            )

        self.check_data_scope(current_user, user)
        if user.id == current_user.id:
            raise HTTPException(
                status_code=400, detail=i18n.t("user.error.cannot_delete_self")
            )

        user.is_deleted = True
        user.deleted_at = datetime.now()
        await self.db.commit()
        return True

    async def change_password(self, user_id: int, password_in: UserPasswordUpdate):
        """
        修改个人密码
        1. 验证旧密码是否正确
        2. 更新为新密码
        """
        # 1. 获取当前用户信息（包含密码哈希）
        user = await self.repo.get(user_id)
        if not user:
            raise HTTPException(
                status_code=404, detail=i18n.t("user.error.user_not_found")
            )

        # 2. 验证旧密码
        if not verify_password(password_in.old_password, user.password_hash):
            raise HTTPException(
                status_code=400, detail=i18n.t("user.error.old_password_incorrect")
            )

        # 3. 生成新密码哈希
        new_hash = get_password_hash(password_in.new_password)

        # 4. 更新数据库
        await self.repo.update_fields(user_id, {"password_hash": new_hash})

        return True


def user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)
