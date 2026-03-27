# app/modules/notifications/service.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends, HTTPException, BackgroundTasks

from app.core.deps import get_db
from app.modules.users.models import SysUserEntity
from .repository import NotificationRepository
from .schemas import (
    NoticeCreate,
    UserNoticeResponse,
    UnreadCountResponse,
    ListMyNoticesQuery,
)
from app.common.schemas.pages import PageParams


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = NotificationRepository(db)

    async def publish_notice(
        self, notice_in: NoticeCreate, publisher_id: int, publisher_name: str
    ):
        content_obj = await self.repo.create_content(
            notice_in, publisher_id, publisher_name
        )

        target_ids = []
        if notice_in.target_user_ids:
            target_ids = notice_in.target_user_ids
        else:
            stmt = select(SysUserEntity.id).where(
                SysUserEntity.is_active == True, SysUserEntity.is_deleted == False
            )
            result = await self.db.execute(stmt)
            target_ids = result.scalars().all()

        if target_ids:
            await self.repo.batch_create_user_notices(content_obj.id, target_ids)

        await self.db.commit()
        return content_obj

    async def get_my_notices(
        self, user_id: int, query: ListMyNoticesQuery, page_params: PageParams
    ):
        """
        获取我的消息列表 (支持分页和复杂搜索)
        """
        offset = (page_params.page - 1) * page_params.size

        # 将 query 对象直接传给 repository，保持 service 层简洁
        rows = await self.repo.get_user_notice_list(
            user_id, query, page_params.size, offset
        )

        # 获取符合条件的总数
        total = await self.repo.get_user_notice_count(user_id, query)

        # 组装数据
        data = [UserNoticeResponse.from_orm_tuple(row) for row in rows]

        return {"items": data, "total": total}

    async def get_unread_count(self, user_id: int) -> UnreadCountResponse:
        """获取简单的未读计数"""
        count = await self.repo.get_unread_count_simple(user_id)
        return UnreadCountResponse(unread_count=count)

    async def read_notice(self, user_id: int, notice_id: int):
        await self.repo.mark_read(user_id, notice_id)
        return await self.get_notice_detail(user_id, notice_id)

    async def read_all(self, user_id: int):
        await self.repo.mark_read(user_id, None)

    async def delete_my_notice(self, user_id: int, notice_id: int):
        await self.repo.delete_user_notice(user_id, notice_id)

    async def get_notice_detail(
        self, user_id: int, notice_id: int
    ) -> UserNoticeResponse:
        """获取单条消息详情"""
        row = await self.repo.get_user_notice_detail(user_id, notice_id)

        if not row:
            raise HTTPException(status_code=404, detail="消息不存在或已被删除")

        return UserNoticeResponse.from_orm_tuple(row)


def notification_service(db: AsyncSession = Depends(get_db)) -> NotificationService:
    return NotificationService(db)
