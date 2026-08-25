from typing import List

from fastapi import Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db
from app.core.i18n import i18n
from app.modules.permissions.service import PermissionService, permission_service
from app.modules.users.models import SysUserEntity
from app.utils.handler_permission import has_permission

from .models import SysRoleEntity, sys_user_role
from .repository import RoleRepository
from .schemas import (
    RoleCreate,
    RoleUpdate,
    RoleWithEditResponse,
)


class SysRoleService:
    def __init__(self, db: AsyncSession, permission_service: PermissionService):
        self.db = db
        self.permission_service = permission_service
        # 注入 Repository 实例
        self.repo = RoleRepository(db)

    async def get_role_list(
        self, current_user: SysUserEntity
    ) -> List[RoleWithEditResponse]:
        """获取所有角色"""
        roles = await self.repo.get_all()
        result = []
        for role in roles:
            can_edit = has_permission(current_user.role_level, role.role_level)
            role_resp = RoleWithEditResponse.model_validate(role)
            # 由于在 get_all 中使用了 selectinload，这里可以直接访问 permissions
            role_resp.menu_ids = [menu.id for menu in role.permissions]
            role_resp.can_edit = can_edit
            result.append(role_resp)
        return result

    async def create_role(
        self, role_in: RoleCreate, current_user: SysUserEntity
    ) -> SysRoleEntity:
        if await self.repo.get_by_code(role_in.role_code):
            raise HTTPException(
                status_code=400, detail=i18n.t("role.error.code_exists")
            )

        if await self.repo.get_by_name(role_in.role_name):
            raise HTTPException(
                status_code=400, detail=i18n.t("role.error.name_exists")
            )

        if not has_permission(current_user.role_level, role_in.role_level):
            raise HTTPException(
                status_code=403, detail=i18n.t("role.error.cannot_create_higher_role")
            )

        return await self.repo.create(role_in)

    async def update_role(
        self, role_id: int, role_in: RoleUpdate, current_user: SysUserEntity
    ) -> SysRoleEntity:
        role = await self.repo.get(role_id)
        if not role:
            raise HTTPException(
                status_code=404, detail=i18n.t("role.error.role_not_found")
            )

        if role.role_level == 0 and not current_user.is_super_admin:
            raise HTTPException(
                status_code=400, detail=i18n.t("role.error.cannot_modify_super_admin")
            )

        if role_in.role_code and role_in.role_code != role.role_code:
            if await self.repo.get_by_code(role_in.role_code):
                raise HTTPException(
                    status_code=400, detail=i18n.t("role.error.code_exists")
                )

        if (
            role_in.role_level is not None
            and not has_permission(current_user.role_level, role_in.role_level)
            and not current_user.is_super_admin
        ):
            raise HTTPException(
                status_code=403,
                detail=i18n.t("role.error.permission_level_insufficient"),
            )

        return await self.repo.update(role, role_in)

    async def delete_role(self, role_id: int, current_user: SysUserEntity):
        role = await self.repo.get(role_id)
        if not role:
            raise HTTPException(
                status_code=404, detail=i18n.t("role.error.role_not_found")
            )
        if role.is_deleted:
            return True

        if role.is_system or role.role_code == "super_admin":
            raise HTTPException(
                status_code=400, detail=i18n.t("role.error.system_role_forbidden")
            )

        # 异步检查是否有用户关联
        user_count_stmt = (
            select(func.count(SysUserEntity.id))
            .join(sys_user_role, SysUserEntity.id == sys_user_role.c.user_id)
            .where(sys_user_role.c.role_id == role_id)
        )
        user_count_res = await self.db.execute(user_count_stmt)
        if user_count_res.scalar() > 0:
            raise HTTPException(
                status_code=400, detail=i18n.t("role.error.role_has_users")
            )

        return await self.repo.soft_delete(role)

    async def update_role_menus(
        self, role_id: int, menu_ids: List[int], current_user: SysUserEntity
    ):
        result = await self.db.execute(
            select(SysRoleEntity)
            .options(selectinload(SysRoleEntity.permissions))
            .where(SysRoleEntity.id == role_id)
        )
        role = result.scalar_one_or_none()

        if not role:
            raise HTTPException(
                status_code=404, detail=i18n.t("role.error.role_not_found")
            )

        if (
            not has_permission(current_user.role_level, role.role_level)
            and not current_user.is_super_admin
        ):
            raise HTTPException(
                status_code=403, detail=i18n.t("role.error.permission_denied")
            )

        await self.repo.update_role_menus(role, menu_ids)
        await self.permission_service.clear_all_user_cache()


def role_service(
    db: AsyncSession = Depends(get_db),
    permission_service: PermissionService = Depends(permission_service),
) -> SysRoleService:
    return SysRoleService(db, permission_service)
