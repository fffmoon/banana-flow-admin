from fastapi import APIRouter, UploadFile, File, Depends, Request, BackgroundTasks
from app.core.deps import get_current_active_user, PermissionChecker
from app.common.schemas.response import APIResponse
from app.modules.users.models import SysUserEntity
from app.modules.operation_log.deps import log_operation
from .service import file_service, FileService
from .schemas import FileResponse

router = APIRouter(prefix="/api/v1", tags=["文件管理"])


@router.post(
    "/upload/image", response_model=APIResponse[FileResponse], summary="上传图片"
)
@log_operation(module="文件管理", action="上传图片")
async def upload_image(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="图片文件"),
    service: FileService = Depends(file_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
    # 后续扩展是否需要特定权限
    # _: dict = Depends(PermissionChecker("system:file:upload"))
):
    """
    通用图片上传接口。
    上传的文件将存储在服务器本地，并返回访问 URL。
    """
    result = await service.upload_image(file, current_user)
    return APIResponse(data=result, title="上传成功")
