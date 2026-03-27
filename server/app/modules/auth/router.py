from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm

from app.core.deps import get_current_active_user
from app.common.schemas.response import APIResponse
from app.modules.auth.schemas import TokenResponse
from app.modules.users.schemas import UserResponse, UserLogin, UserCreate
from app.modules.users.models import SysUserEntity
from app.modules.permissions.schemas import PermMenuResponse, PermVersionResponse
from app.modules.permissions.service import permission_service, PermissionService
from .service import auth_service, AuthService

router = APIRouter(prefix="/api/v1", tags=["认证管理"])


@router.post(
    "/auth/login/json",
    response_model=APIResponse[TokenResponse],
    tags=["登录 (前端使用)"],
)
async def login_json(
    login_data: UserLogin, service: AuthService = Depends(auth_service)
) -> APIResponse[TokenResponse]:
    access_token = await service.login_json(login_data)
    return APIResponse(
        data=TokenResponse(access_token=access_token, token_type="bearer"),
        title="登录成功",
    )


@router.post(
    "/auth/login",
    response_model=TokenResponse,
    tags=["登录 (Swagger)"],
)
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(auth_service),
) -> APIResponse[TokenResponse]:
    access_token = await service.login_access_token(form_data)
    return APIResponse(
        data=TokenResponse(access_token=access_token, token_type="bearer"),
        title="登录成功",
    )


@router.post("/auth/logout", response_model=APIResponse, tags=["退出登录"])
async def logout(
    request: Request,
    current_user: SysUserEntity = Depends(get_current_active_user),
    service: AuthService = Depends(auth_service),
):
    await service.logout(request)
    return APIResponse(title="退出登录成功")


@router.get(
    "/auth/me", response_model=APIResponse[UserResponse], tags=["获取当前用户信息"]
)
async def read_users_me(
    current_user: SysUserEntity = Depends(get_current_active_user),
) -> APIResponse[UserResponse]:
    return APIResponse(data=current_user, title="获取用户信息成功")


@router.post(
    "/auth/register", response_model=APIResponse[UserResponse], tags=["用户注册"]
)
async def register_user(
    user_in: UserCreate,
    service: AuthService = Depends(auth_service),
) -> APIResponse[UserResponse]:
    user = await service.register_user(user_in)
    return APIResponse(data=user, title="注册成功")


@router.get(
    "/auth/getPermmenu",
    response_model=APIResponse[PermMenuResponse],
    tags=["获取权限菜单"],
    summary="获取当前登录用户的动态路由和权限",
)
async def get_user_perm_menu(
    service: PermissionService = Depends(permission_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    data = await service.get_user_permission_data(current_user.id)
    return APIResponse(data=data, title="获取权限菜单成功")


@router.get(
    "/auth/version",
    response_model=APIResponse[PermVersionResponse],
    tags=["获取权限版本号"],
    summary="获取当前用户的权限版本号",
)
async def get_user_perm_version(
    service: PermissionService = Depends(permission_service),
    current_user: SysUserEntity = Depends(get_current_active_user),
):
    version = await service.get_permission_version(current_user.id)
    return APIResponse(
        data=PermVersionResponse(version=version), title="获取版本号成功"
    )
