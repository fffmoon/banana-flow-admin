from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from .models import SysRoleEntity
from app.modules.permissions.models import PermissionsEntity
from .schemas import RoleCreate, RoleUpdate


class RoleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, id: int) -> Optional[SysRoleEntity]:
        result = await self.db.execute(
            select(SysRoleEntity).where(SysRoleEntity.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(self, code: str) -> Optional[SysRoleEntity]:
        result = await self.db.execute(
            select(SysRoleEntity).where(SysRoleEntity.role_code == code)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[SysRoleEntity]:
        result = await self.db.execute(
            select(SysRoleEntity).where(SysRoleEntity.role_name == name)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> List[SysRoleEntity]:
        # 预加载 permissions 关系
        result = await self.db.execute(
            select(SysRoleEntity)
            .options(selectinload(SysRoleEntity.permissions))
            .order_by(SysRoleEntity.sort.asc())
        )
        return result.scalars().all()

    async def create(self, obj_in: RoleCreate) -> SysRoleEntity:
        db_obj = SysRoleEntity(
            role_name=obj_in.role_name,
            role_code=obj_in.role_code,
            status=obj_in.status,
            sort=obj_in.sort,
            role_level=obj_in.role_level,
        )
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def update(self, db_obj: SysRoleEntity, obj_in: RoleUpdate) -> SysRoleEntity:
        update_data = obj_in.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(db_obj, k, v)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def soft_delete(self, role: SysRoleEntity) -> bool:
        role.is_deleted = True
        await self.db.commit()
        return True

    async def update_role_menus(self, role: SysRoleEntity, menu_ids: List[int]):
        # 异步获取权限对象
        result = await self.db.execute(
            select(PermissionsEntity).where(PermissionsEntity.id.in_(menu_ids))
        )
        permissions = result.scalars().all()

        # 更新关联关系
        role.permissions = permissions
        await self.db.commit()
