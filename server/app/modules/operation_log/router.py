from fastapi import APIRouter, Depends

from app.common.schemas.pages import PagedData, PageParams
from app.common.schemas.response import APIResponse
from app.core.deps import PermissionChecker, get_current_active_user
from app.core.i18n import i18n
from app.modules.users.models import SysUserEntity

from .schemas import OperationLogQuery, OperationLogResponse
from .service import OperationLogService, operation_log_service

router = APIRouter(prefix="/api/v1", tags=["操作日志管理"])


@router.get(
    "/operation-logs",
    response_model=APIResponse[PagedData[OperationLogResponse]],
    summary="查询操作日志列表",
)
async def get_operation_log_list(
    query: OperationLogQuery = Depends(),
    page_params: PageParams = Depends(),
    service: OperationLogService = Depends(operation_log_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
    _: dict = Depends(PermissionChecker("system:operation_log:list")),
):
    """
    获取全系统的操作审计日志，支持多维度过滤。
    """
    paged_data = await service.get_list(query, page_params)
    return APIResponse(data=paged_data, title=i18n.t("operation_log.success.get_list"))
