from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, Request

from app.common.schemas.response import APIResponse
from app.core.deps import PermissionChecker
from app.core.i18n import i18n
from app.modules.operation_log.deps import log_operation
from app.modules.roles.schemas import (
    RoleCreate,
    RoleMenuUpdate,
    RoleResponse,
    RoleUpdate,
    RoleWithEditResponse,
)
from app.modules.roles.service import SysRoleService, role_service
from app.modules.users.models import SysUserEntity

router = APIRouter(prefix="/api/v1", tags=["角色管理"])


@router.get("/roles", response_model=APIResponse[List[RoleWithEditResponse]])
async def get_roles_list(
    current_user: SysUserEntity = Depends(PermissionChecker("system:roles:list")),
    service: SysRoleService = Depends(role_service),
):
    roles = await service.get_role_list(current_user)
    return APIResponse(data=roles)


@router.post("/roles", response_model=APIResponse[RoleResponse])
@log_operation(module="角色管理", action="创建角色")
async def create_role(
    request: Request,
    background_tasks: BackgroundTasks,
    role_in: RoleCreate,
    current_user: SysUserEntity = Depends(PermissionChecker("system:roles:create")),
    service: SysRoleService = Depends(role_service),
):
    new_role = await service.create_role(role_in, current_user)
    return APIResponse(data=new_role)


@router.put("/roles/{role_id}", response_model=APIResponse[RoleResponse])
@log_operation(module="角色管理", action="修改角色")
async def update_role(
    request: Request,
    background_tasks: BackgroundTasks,
    role_id: int,
    role_in: RoleUpdate,
    current_user: SysUserEntity = Depends(PermissionChecker("system:roles:update")),
    service: SysRoleService = Depends(role_service),
):
    role = await service.update_role(role_id, role_in, current_user)
    return APIResponse(data=role)


@router.delete("/roles/{role_id}", response_model=APIResponse)
@log_operation(module="角色管理", action="删除角色")
async def delete_role(
    request: Request,
    background_tasks: BackgroundTasks,
    role_id: int,
    current_user: SysUserEntity = Depends(PermissionChecker("system:roles:delete")),
    service: SysRoleService = Depends(role_service),
):
    await service.delete_role(role_id, current_user)
    return APIResponse(title=i18n.t("role.success.delete"))


@router.put("/roles/{role_id}/menus", response_model=APIResponse)
@log_operation(module="角色管理", action="分配菜单权限")
async def assign_menus_to_role(
    request: Request,
    background_tasks: BackgroundTasks,
    role_id: int,
    role_menu: RoleMenuUpdate,
    current_user: SysUserEntity = Depends(
        PermissionChecker("system:roles:assign_menus")
    ),
    service: SysRoleService = Depends(role_service),
):
    await service.update_role_menus(role_id, role_menu.menu_ids, current_user)
    return APIResponse(title=i18n.t("role.success.assign_menus"))
