from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from .schemas import PermissionCreate, PermissionUpdate
from fastapi import HTTPException
from .models import PermissionsEntity
from datetime import datetime
from app.modules.users.models import SysUserEntity
from app.modules.roles.models import sys_user_role, sys_role_permission, SysRoleEntity


class PermissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, id: int) -> Optional[PermissionsEntity]:
        result = await self.db.execute(
            select(PermissionsEntity).where(PermissionsEntity.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(self, code: str) -> Optional[PermissionsEntity]:
        result = await self.db.execute(
            select(PermissionsEntity).where(PermissionsEntity.code == code)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[PermissionsEntity]:
        result = await self.db.execute(
            select(PermissionsEntity).where(PermissionsEntity.name == name)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> List[PermissionsEntity]:
        result = await self.db.execute(
            select(PermissionsEntity).order_by(PermissionsEntity.sort.asc())
        )
        return result.scalars().all()

    async def create(self, obj_in: PermissionCreate) -> PermissionsEntity:
        if obj_in.type == 1:
            if not obj_in.name:
                raise HTTPException(status_code=400, detail="路由名称不能为空")
            if await self.get_by_name(obj_in.name):
                raise HTTPException(status_code=400, detail="路由名称已存在")
        elif obj_in.type == 2:
            if not obj_in.code:
                raise HTTPException(status_code=400, detail="权限标识不能为空")
            if await self.get_by_code(obj_in.code):
                raise HTTPException(status_code=400, detail="权限标识已存在")

        db_obj = PermissionsEntity(**obj_in.model_dump())
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def update(self, perm_id: int, obj_in: PermissionUpdate) -> PermissionsEntity:
        db_obj = await self.get(perm_id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="权限不存在")

        update_data = obj_in.model_dump(exclude_unset=True)
        new_type = update_data.get("type", db_obj.type)
        new_name = update_data.get("name", db_obj.name)
        new_code = update_data.get("code", db_obj.code)

        if new_type == 1:
            if not new_name:
                raise HTTPException(status_code=400, detail="路由名称不能为空")
            exist = await self.get_by_name(new_name)
            if exist and exist.id != perm_id:
                raise HTTPException(status_code=400, detail="路由名称已存在")
        elif new_type == 2:
            if not new_code:
                raise HTTPException(status_code=400, detail="权限标识不能为空")
            exist = await self.get_by_code(new_code)
            if exist and exist.id != perm_id:
                raise HTTPException(status_code=400, detail="权限标识已存在")

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def delete(self, perm_id: int):
        # 检查子节点
        res = await self.db.execute(
            select(PermissionsEntity).where(PermissionsEntity.parent_id == perm_id)
        )
        if res.first():
            raise HTTPException(status_code=400, detail="存在子权限，无法删除")

        db_obj = await self.get(perm_id)
        if db_obj:
            db_obj.is_deleted = True
            db_obj.deleted_at = datetime.now()
            await self.db.commit()
            return db_obj
        return None

    async def get_by_user_roles(self, user_id: int) -> List[PermissionsEntity]:
        """获取用户权限并自动补全父级"""
        result = await self.db.execute(
            select(SysUserEntity)
            .options(
                selectinload(SysUserEntity.roles).selectinload(
                    SysRoleEntity.permissions
                )
            )
            .where(SysUserEntity.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            return []

        if user.is_super_admin:
            return await self.get_all()

        explicit_ids = set()
        for role in user.roles:
            if role.status:
                for perm in role.permissions:
                    explicit_ids.add(perm.id)

        if not explicit_ids:
            return []

        all_perms = await self.get_all()
        perm_map = {p.id: p for p in all_perms}
        final_ids = set()

        for pid in explicit_ids:
            curr_id = pid
            while curr_id and curr_id in perm_map:
                if curr_id in final_ids:
                    break
                final_ids.add(curr_id)
                curr_node = perm_map[curr_id]
                curr_id = curr_node.parent_id if curr_node.parent_id else None

        result_list = [perm_map[pid] for pid in final_ids if pid in perm_map]
        result_list.sort(key=lambda x: x.sort)
        return result_list

    async def get_permission_codes_by_user_id(self, user_id: int) -> set[str]:
        query = (
            select(PermissionsEntity.code)
            .join(
                sys_role_permission,
                PermissionsEntity.id == sys_role_permission.c.permission_id,
            )
            .join(SysRoleEntity, sys_role_permission.c.role_id == SysRoleEntity.id)
            .join(sys_user_role, SysRoleEntity.id == sys_user_role.c.role_id)
            .where(
                and_(
                    sys_user_role.c.user_id == user_id,
                    SysRoleEntity.status == True,
                    PermissionsEntity.is_deleted == False,
                )
            )
        )
        result = await self.db.execute(query)
        return {code for code in result.scalars().all() if code}
