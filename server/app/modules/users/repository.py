from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, or_
from fastapi import HTTPException
from datetime import datetime
from .models import SysUserEntity
from app.modules.roles.models import SysRoleEntity
from .schemas import UserCreate, UserAdminUpdate, UserFilter
from app.modules.auth.security import get_password_hash
from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import selectinload


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, id: int) -> Optional[SysUserEntity]:
        # 异步查询单个对象
        result = await self.db.execute(
            select(SysUserEntity)
            .options(selectinload(SysUserEntity.roles))
            .where(SysUserEntity.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[SysUserEntity]:
        result = await self.db.execute(
            select(SysUserEntity)
            .options(selectinload(SysUserEntity.roles))
            .where(SysUserEntity.username == username)
        )
        return result.scalar_one_or_none()

    async def create(self, obj_in: UserCreate) -> SysUserEntity:
        if await self.get_by_username(obj_in.username):
            raise HTTPException(status_code=400, detail="用户名已存在")

        db_obj = SysUserEntity(
            username=obj_in.username,
            password_hash=get_password_hash(obj_in.password),
            email=obj_in.email,
            nickname=obj_in.nickname,
            is_active=obj_in.is_active,
        )

        if obj_in.role_ids:
            # 异步获取角色列表
            role_result = await self.db.execute(
                select(SysRoleEntity).where(SysRoleEntity.id.in_(obj_in.role_ids))
            )
            db_obj.roles = role_result.scalars().all()

        self.db.add(db_obj)
        await self.db.commit()
        return await self.get(db_obj.id)

    async def update(self, user_id: int, obj_in: UserAdminUpdate) -> SysUserEntity:
        # 先获取用户
        result = await self.db.execute(
            select(SysUserEntity)
            .options(selectinload(SysUserEntity.roles))
            .where(SysUserEntity.id == user_id)
        )
        db_obj = result.scalar_one_or_none()

        if not db_obj:
            raise HTTPException(status_code=404, detail="用户不存在")

        update_data = obj_in.model_dump(exclude_unset=True)

        if "role_ids" in update_data:
            r_ids = update_data.pop("role_ids")
            # 异步更新关联关系
            role_result = await self.db.execute(
                select(SysRoleEntity).where(SysRoleEntity.id.in_(r_ids))
            )
            db_obj.roles = role_result.scalars().all()

        for k, v in update_data.items():
            setattr(db_obj, k, v)

        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def update_login_time(self, user_id: int):
        await self.db.execute(
            update(SysUserEntity)
            .where(SysUserEntity.id == user_id)
            .values(last_login_time=datetime.now())
        )
        await self.db.commit()

    def get_multi_stmt(self, filters: UserFilter):
        """构造查询语句，不执行"""
        stmt = select(SysUserEntity).options(selectinload(SysUserEntity.roles))

        if filters.username:
            stmt = stmt.where(SysUserEntity.username.like(f"%{filters.username}%"))
        if filters.nickname:
            stmt = stmt.where(SysUserEntity.nickname.like(f"%{filters.nickname}%"))
        if filters.email:
            stmt = stmt.where(SysUserEntity.email == filters.email)
        if filters.mobile_phone:
            stmt = stmt.where(SysUserEntity.mobile_phone.like(f"%{filters.mobile_phone}%"))
        if filters.is_active is not None:
            stmt = stmt.where(SysUserEntity.is_active == filters.is_active)

        return stmt.order_by(SysUserEntity.create_time.desc())

    async def get_by_email_or_phone(
        self, email: str = None, phone: str = None
    ) -> Optional[SysUserEntity]:
        if not email and not phone:
            return None

        conditions = []
        if email:
            conditions.append(SysUserEntity.email == email)
        if phone:
            conditions.append(SysUserEntity.mobile_phone == phone)

        result = await self.db.execute(select(SysUserEntity).where(or_(*conditions)))
        return result.scalar_one_or_none()

    async def update_fields(
        self, user_id: int, update_data: Dict[str, Any]
    ) -> SysUserEntity:
        await self.db.execute(
            update(SysUserEntity)
            .where(SysUserEntity.id == user_id)
            .values(**update_data)
        )
        await self.db.commit()
        return await self.get(user_id)
