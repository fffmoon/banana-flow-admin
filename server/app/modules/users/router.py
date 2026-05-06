from fastapi import APIRouter, BackgroundTasks, Depends, Request

from app.common.schemas.pages import PagedData, PageParams
from app.common.schemas.response import APIResponse
from app.core.deps import PermissionChecker, get_current_active_user
from app.core.i18n import i18n
from app.modules.operation_log.deps import log_operation

from .models import SysUserEntity
from .schemas import (
    UserAdminUpdate,
    UserCreate,
    UserFilter,
    UserPasswordUpdate,
    UserProfileUpdate,
    UserResponse,
)
from .service import UserService, user_service

router = APIRouter(prefix="/api/v1", tags=["用户管理"])


@router.get(
    "/users",
    response_model=APIResponse[PagedData[UserResponse]],
    summary="查询用户列表",
)
async def list_users(
    filters: UserFilter = Depends(),
    page_params: PageParams = Depends(),
    service: UserService = Depends(user_service),
    current_user: SysUserEntity = Depends(PermissionChecker("system:users:list")),
):
    data = await service.get_users_list(filters, page_params)
    return APIResponse(data=data)


@router.post("/users", response_model=APIResponse[UserResponse], summary="创建用户")
@log_operation(module="用户管理", action="创建用户")
async def create_user(
    request: Request,
    background_tasks: BackgroundTasks,
    user_in: UserCreate,
    service: UserService = Depends(user_service),
    current_user: SysUserEntity = Depends(PermissionChecker("system:users:create")),
):
    user = await service.create_user(user_in, current_user)
    return APIResponse(data=user, title=i18n.t("user.success.create"))


@router.put(
    "/users/me", response_model=APIResponse[UserResponse], summary="更新个人资料"
)
@log_operation(module="用户管理", action="修改个人资料")
async def update_me(
    request: Request,
    background_tasks: BackgroundTasks,
    user_in: UserProfileUpdate,
    service: UserService = Depends(user_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    """
    更新当前登录用户的个人信息 (昵称, 邮箱, 手机号, 头像, 性别)
    """
    user = await service.update_me(current_user.id, user_in, current_user)
    return APIResponse(data=user, title=i18n.t("user.success.profile_update"))


@router.put("/users/me/password", response_model=APIResponse, summary="修改个人密码")
@log_operation(module="用户管理", action="修改个人密码")
async def change_password(
    request: Request,
    background_tasks: BackgroundTasks,
    password_in: UserPasswordUpdate,
    service: UserService = Depends(user_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    """
    修改当前登录用户的密码，需要提供旧密码进行验证
    """
    await service.change_password(current_user.id, password_in)
    return APIResponse(title=i18n.t("user.success.password_change"))


@router.put(
    "/users/{user_id}", response_model=APIResponse[UserResponse], summary="修改用户"
)
@log_operation(module="用户管理", action="修改用户")
async def update_user(
    request: Request,
    background_tasks: BackgroundTasks,
    user_id: int,
    user_in: UserAdminUpdate,
    service: UserService = Depends(user_service),
    current_user: SysUserEntity = Depends(PermissionChecker("system:users:update")),
):
    user = await service.update_user(user_id, user_in, current_user)

    if user_in.is_active is True:
        title = i18n.t("user.success.enable")
    elif user_in.is_active is False:
        title = i18n.t("user.success.disable")
    else:
        title = i18n.t("user.success.update")

    return APIResponse(data=user, title=title)


@router.delete("/users/{user_id}", response_model=APIResponse, summary="删除用户")
@log_operation(module="用户管理", action="删除用户")
async def delete_user(
    request: Request,
    background_tasks: BackgroundTasks,
    user_id: int,
    service: UserService = Depends(user_service),
    current_user: SysUserEntity = Depends(PermissionChecker("system:users:delete")),
):
    await service.delete_user(user_id, current_user)
    return APIResponse(title=i18n.t("user.success.delete"))
