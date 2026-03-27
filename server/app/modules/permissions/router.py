from fastapi import APIRouter, Depends, Request, BackgroundTasks
from typing import List
from app.core.deps import get_current_active_user, PermissionChecker
from app.common.schemas.response import APIResponse
from .schemas import PermissionCreate, PermissionUpdate, PermissionTreeResponse
from .service import permission_service, PermissionService
from app.modules.users.models import SysUserEntity
from app.modules.operation_log.deps import log_operation

router = APIRouter(prefix="/api/v1", tags=["系统权限"])


@router.get("/permissions", response_model=APIResponse[List[PermissionTreeResponse]])
async def get_permission_list(
    current_user: SysUserEntity = Depends(get_current_active_user),
    service: PermissionService = Depends(permission_service),
    _: dict = Depends(PermissionChecker("system:menu:list")),
):
    all_data = await service.get_user_permissions(user_id=current_user.id)
    return APIResponse(data=all_data)


@router.post("/permissions", response_model=APIResponse)
@log_operation(module="系统权限", action="创建权限")
async def create_permission(
    perm: PermissionCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: SysUserEntity = Depends(get_current_active_user),
    service: PermissionService = Depends(permission_service),
    _: dict = Depends(PermissionChecker("system:menu:create")),
):
    await service.createAndAssignToUser(perm, current_user)
    return APIResponse(title="创建成功")


@router.put("/permissions/{id}", response_model=APIResponse)
@log_operation(module="系统权限", action="修改权限")
async def update_permission(
    id: int,
    perm: PermissionUpdate,
    request: Request,
    background_tasks: BackgroundTasks,
    service: PermissionService = Depends(permission_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
    _: dict = Depends(PermissionChecker("system:menu:update")),
):
    await service.update(id, perm)
    return APIResponse(title="更新成功")


@router.delete("/permissions/{id}", response_model=APIResponse)
@log_operation(module="系统权限", action="删除权限")
async def delete_permission(
    request: Request,
    background_tasks: BackgroundTasks,
    id: int,
    service: PermissionService = Depends(permission_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
    _: dict = Depends(PermissionChecker("system:menu:delete")),
):
    await service.delete(id)
    return APIResponse(title="删除成功")
