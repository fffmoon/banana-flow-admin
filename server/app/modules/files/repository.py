from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from .models import SysFileEntity


class FileRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, file_data: dict) -> SysFileEntity:
        db_obj = SysFileEntity(**file_data)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def get(self, file_id: int) -> Optional[SysFileEntity]:
        result = await self.db.execute(
            select(SysFileEntity).where(SysFileEntity.id == file_id)
        )
        return result.scalar_one_or_none()
