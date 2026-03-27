from sqlalchemy.ext.asyncio import AsyncSession
from .models import OperationLogEntity
from .schemas import OperationLogCreate
from app.utils.pagination import paginate
from app.common.schemas.pages import PageParams
from .schemas import OperationLogQuery
from sqlalchemy import select, desc


class OperationLogRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, obj_in: OperationLogCreate):
        data = obj_in.model_dump(by_alias=False)
        db_obj = OperationLogEntity(**data)
        self.db.add(db_obj)
        await self.db.commit()
        return db_obj

    async def get_multi(self, query: OperationLogQuery, page_params: PageParams):
        stmt = select(OperationLogEntity)

        # 动态过滤
        if query.username:
            stmt = stmt.where(OperationLogEntity.username.ilike(f"%{query.username}%"))
        if query.module:
            stmt = stmt.where(OperationLogEntity.module == query.module)
        if query.status_code:
            if query.status_code == 200:
                stmt = stmt.where(OperationLogEntity.status_code == 200)
            else:
                stmt = stmt.where(OperationLogEntity.status_code != 200)

        # 时间范围查询
        if query.start_time:
            stmt = stmt.where(OperationLogEntity.created_at >= query.start_time)
        if query.end_time:
            stmt = stmt.where(OperationLogEntity.created_at <= query.end_time)

        # 默认按时间倒序
        stmt = stmt.order_by(desc(OperationLogEntity.created_at))

        # 调用通用分页
        return await paginate(self.db, stmt, page_params)
