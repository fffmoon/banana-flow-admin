from fastapi import APIRouter, Depends

from app.common.schemas.pages import PagedData, PageParams, PaginationMeta
from app.common.schemas.response import APIResponse
from app.core.deps import PermissionChecker, get_current_active_user
from app.core.i18n import i18n
from app.modules.users.models import SysUserEntity

from .schemas import (
    ListMyNoticesQuery,
    NoticeCreate,
    UnreadCountResponse,
    UserNoticeResponse,
)
from .service import NotificationService, notification_service

router = APIRouter(prefix="/api/v1/notifications", tags=["消息通知"])

# 用户端接口


@router.get(
    "/unread-count",
    response_model=APIResponse[UnreadCountResponse],
    summary="获取未读数量",
)
async def get_unread_count(
    current_user: SysUserEntity = Depends(get_current_active_user),
    service: NotificationService = Depends(notification_service),
):
    """一般用于前端轮询，不需要权限标识，登录即可调用"""
    data = await service.get_unread_count(current_user.id)
    return APIResponse(data=data)


@router.get(
    "",
    response_model=APIResponse[PagedData[UserNoticeResponse]],
    summary="获取我的消息列表",
)
async def list_my_notices(
    query: ListMyNoticesQuery = Depends(),
    page_params: PageParams = Depends(),
    current_user: SysUserEntity = Depends(get_current_active_user),
    service: NotificationService = Depends(notification_service),
):
    result = await service.get_my_notices(current_user.id, query, page_params)
    total_pages = (
        (result["total"] + page_params.size - 1) // page_params.size
        if result["total"] > 0
        else 0
    )
    return APIResponse(
        data=PagedData(
            data=result["items"],
            pagination=PaginationMeta(
                total=result["total"],
                page=page_params.page,
                page_size=page_params.size,
                total_pages=total_pages,
            ),
        )
    )


@router.put("/read-all", response_model=APIResponse, summary="全部已读")
async def read_all_notices(
    current_user: SysUserEntity = Depends(get_current_active_user),
    service: NotificationService = Depends(notification_service),
):
    await service.read_all(current_user.id)
    return APIResponse(title=i18n.t("notification.success.operation"))


@router.put(
    "/{notice_id}/read",
    response_model=APIResponse[UserNoticeResponse],
    summary="标记单条已读",
)
async def read_one_notice(
    notice_id: int,
    current_user: SysUserEntity = Depends(get_current_active_user),
    service: NotificationService = Depends(notification_service),
):
    data = await service.read_notice(current_user.id, notice_id)
    return APIResponse(data=data, title=i18n.t("notification.success.operation"))


@router.delete("/{notice_id}", response_model=APIResponse, summary="删除我的消息")
async def delete_my_notice(
    notice_id: int,
    current_user: SysUserEntity = Depends(get_current_active_user),
    service: NotificationService = Depends(notification_service),
):
    await service.delete_my_notice(current_user.id, notice_id)
    return APIResponse(title=i18n.t("notification.success.delete"))


# 获取单条消息详情
@router.get(
    "/{notice_id}",
    response_model=APIResponse[UserNoticeResponse],
    summary="获取单条消息详情",
)
async def get_notice_detail(
    notice_id: int,
    current_user: SysUserEntity = Depends(get_current_active_user),
    service: NotificationService = Depends(notification_service),
):
    data = await service.get_notice_detail(current_user.id, notice_id)
    return APIResponse(data=data)


# 后台发布接口
@router.post("/publish", response_model=APIResponse, summary="发布通知公告")
async def publish_notice(
    notice_in: NoticeCreate,
    current_user: SysUserEntity = Depends(PermissionChecker("system:notice:publish")),
    service: NotificationService = Depends(notification_service),
):
    # 这里也可以把 publish_notice 放到 BackgroundTasks 中执行，如果目标用户非常多
    await service.publish_notice(
        notice_in, current_user.id, current_user.nickname or current_user.username
    )
    return APIResponse(title=i18n.t("notification.success.publish"))
