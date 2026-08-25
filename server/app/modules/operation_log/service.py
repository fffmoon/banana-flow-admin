from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.schemas.pages import PageParams
from app.core.deps import get_db
from app.core.i18n import i18n

from .repository import OperationLogRepository
from .schemas import OperationLogQuery


class OperationLogService:
    def __init__(self, db: AsyncSession):
        self.repo = OperationLogRepository(db)

    async def get_list(self, query: OperationLogQuery, page_params: PageParams):
        # 限制时间查询跨度
        if query.start_time and query.end_time:
            delta = query.end_time - query.start_time
            if delta.days > 90:
                raise HTTPException(
                    status_code=400,
                    detail=i18n.t("operation_log.error.time_range_too_long"),
                )

        return await self.repo.get_multi(query, page_params)


def operation_log_service(db: AsyncSession = Depends(get_db)) -> OperationLogService:
    return OperationLogService(db)
