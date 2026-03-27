from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException
from .repository import OperationLogRepository
from .schemas import OperationLogQuery
from app.common.schemas.pages import PageParams
from app.core.deps import get_db


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
                    detail={
                        "status": "您当前选择的时间筛选跨度过长",
                        "restriction": "系统审计日志查询范围不得超过 90 个自然日",
                        "reason": "这是为了保障数据库在高并发环境下的查询响应性能，防止大规模数据检索导致系统负载过载。",
                    },
                )

        return await self.repo.get_multi(query, page_params)


def operation_log_service(db: AsyncSession = Depends(get_db)) -> OperationLogService:
    return OperationLogService(db)
