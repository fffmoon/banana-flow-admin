from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.common.schemas.pages import PagedData, PageParams
from app.common.schemas.response import APIResponse
from app.core.deps import get_current_active_user
from app.modules.operation_log.deps import log_operation
from app.modules.users.models import SysUserEntity

from .schemas import (
    CreateDirReq,
    DirectoryItemRes,
    MoveDirReq,
    MoveImageReq,
    RenameDirReq,
    RenameImageReq,
)
from .service import ImageManagementService, image_management_service

router = APIRouter(prefix="/api/v1/image-management", tags=["图片管理(目录体系)"])

# ==================== 基础与查询 ====================


@router.get(
    "/directories/root", response_model=APIResponse[int], summary="获取根目录ID"
)
async def get_root_directory_id(
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    root_id = await service.get_or_create_root(current_user)
    return APIResponse(data=root_id, title="操作成功")


@router.get(
    "/directories/content",
    response_model=APIResponse[PagedData[DirectoryItemRes]],
    summary="获取目录内容",
)
async def get_directory_structure(
    dir_id: Optional[int] = None,
    search_name: Optional[str] = None,
    page_params: PageParams = Depends(),
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    result = await service.get_directory_content(
        dir_id, search_name, page_params, current_user
    )
    return APIResponse(data=result, title="查询成功")


@router.get(
    "/directories/{dir_id}/structure",
    response_model=APIResponse[List[dict]],
    summary="获取面包屑(路径体系)",
)
async def get_directory_structure_by_id(
    dir_id: int,
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    result = await service.get_breadcrumbs(dir_id, current_user)
    return APIResponse(data=result, title="查询成功")


@router.get(
    "/directories/tree",
    response_model=APIResponse[List[DirectoryItemRes]],
    summary="获取目录树(用于移动操作)",
)
async def get_tree_directory_structures(
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    result = await service.get_tree_structure(current_user)
    return APIResponse(data=result, title="查询成功")


# ==================== 目录操作 ====================


@router.post("/directories", response_model=APIResponse, summary="新建目录")
@log_operation(module="图片管理", action="新建目录")
async def create_directory(
    req: CreateDirReq,
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    await service.create_directory(req, current_user)
    return APIResponse(title="目录创建成功")


@router.put("/directories/rename", response_model=APIResponse, summary="重命名目录")
@log_operation(module="图片管理", action="重命名目录")
async def rename_directory(
    req: RenameDirReq,
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    await service.rename_directory(req, current_user)
    return APIResponse(title="目录重命名成功")


@router.put("/directories/move", response_model=APIResponse, summary="移动目录")
@log_operation(module="图片管理", action="移动目录")
async def move_directory(
    req: MoveDirReq,
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    await service.move_directory(req, current_user)
    return APIResponse(title="目录移动成功")


@router.delete("/directories/{dir_id}", response_model=APIResponse, summary="删除目录")
@log_operation(module="图片管理", action="删除目录")
async def delete_directory(
    dir_id: int,
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    await service.delete_directory(dir_id, current_user)
    return APIResponse(title="目录删除成功")


# ==================== 图片文件操作 ====================


@router.post("/images", response_model=APIResponse, summary="上传图片到目录")
@log_operation(module="图片管理", action="上传图片")
async def upload_images(
    dirId: int = Form(..., description="目标目录ID"),
    file: UploadFile = File(..., description="图片文件"),
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    await service.upload_image(dirId, file, current_user)
    return APIResponse(title="图片上传成功")


@router.put("/images/rename", response_model=APIResponse, summary="重命名图片")
@log_operation(module="图片管理", action="重命名图片")
async def rename_image(
    req: RenameImageReq,
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    await service.rename_image(req, current_user)
    return APIResponse(title="图片重命名成功")


@router.put("/images/move", response_model=APIResponse, summary="移动图片")
@log_operation(module="图片管理", action="移动图片")
async def move_image(
    req: MoveImageReq,
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    await service.move_image(req, current_user)
    return APIResponse(title="图片移动成功")


@router.delete("/images/{images_id}", response_model=APIResponse, summary="删除图片")
@log_operation(module="图片管理", action="删除图片")
async def delete_image(
    images_id: int,
    service: ImageManagementService = Depends(image_management_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    await service.delete_image(images_id, current_user)
    return APIResponse(title="图片删除成功")
