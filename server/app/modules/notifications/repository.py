# app/modules/notifications/repository.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional
from datetime import datetime

from .models import SysNoticeEntity, SysUserNoticeEntity
from .schemas import NoticeCreate, ListMyNoticesQuery


class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_content(
        self, obj_in: NoticeCreate, publisher_id: int, publisher_name: str
    ) -> SysNoticeEntity:
        """创建消息内容"""
        db_obj = SysNoticeEntity(
            title=obj_in.title,
            content=obj_in.content,
            notice_type=obj_in.notice_type,
            publisher_id=publisher_id,
            publisher_name=publisher_name,
        )
        self.db.add(db_obj)
        await self.db.flush()
        return db_obj

    async def batch_create_user_notices(self, notice_id: int, user_ids: List[int]):
        """批量写入用户信箱"""
        mappings = [{"notice_id": notice_id, "user_id": uid} for uid in user_ids]
        if mappings:
            await self.db.run_sync(
                lambda session: session.bulk_insert_mappings(
                    SysUserNoticeEntity, mappings
                )
            )

    def _apply_filters(
        self, stmt, user_id: int, query: Optional[ListMyNoticesQuery] = None
    ):
        """
        应用通用的过滤条件
        """

        # 强制条件
        stmt = stmt.where(SysUserNoticeEntity.user_id == user_id)
        stmt = stmt.where(SysNoticeEntity.is_deleted == False)

        if not query:
            return stmt

        # 动态条件
        if query.is_read is not None:
            stmt = stmt.where(SysUserNoticeEntity.is_read == query.is_read)

        if query.notice_type and query.notice_type > 0:
            stmt = stmt.where(SysNoticeEntity.notice_type == query.notice_type)

        if query.title:
            stmt = stmt.where(SysNoticeEntity.title.ilike(f"%{query.title}%"))

        if query.publisher_name:
            stmt = stmt.where(
                SysNoticeEntity.publisher_name.ilike(f"%{query.publisher_name}%")
            )
        return stmt

    async def get_user_notice_list(
        self, user_id: int, query: ListMyNoticesQuery, limit: int, offset: int
    ):
        """获取用户的通知列表"""
        # 1. 构建基础 Select 和 Join
        stmt = select(SysUserNoticeEntity, SysNoticeEntity).join(
            SysNoticeEntity, SysUserNoticeEntity.notice_id == SysNoticeEntity.id
        )

        # 2. 应用过滤
        stmt = self._apply_filters(stmt, user_id, query)

        # 3. 应用排序和分页
        stmt = (
            stmt.order_by(
                SysUserNoticeEntity.is_read.asc(), SysNoticeEntity.create_time.desc()
            )
            .limit(limit)
            .offset(offset)
        )

        result = await self.db.execute(stmt)
        return result.all()

    async def get_user_notice_count(
        self, user_id: int, query: ListMyNoticesQuery
    ) -> int:
        """统计数量 (带过滤条件)"""
        # 1. 构建 Select count(*) 和 Join
        # 注意：必须 Join SysNoticeEntity，因为 title/type 等过滤字段在 Notice 表中
        stmt = (
            select(func.count())
            .select_from(SysUserNoticeEntity)
            .join(SysNoticeEntity, SysUserNoticeEntity.notice_id == SysNoticeEntity.id)
        )

        # 2. 应用相同的过滤逻辑
        stmt = self._apply_filters(stmt, user_id, query)

        return (await self.db.execute(stmt)).scalar() or 0

    async def get_unread_count_simple(self, user_id: int) -> int:
        """
        仅统计未读数量 (用于右上角红点，不带复杂搜索)
        """
        stmt = (
            select(func.count())
            .select_from(SysUserNoticeEntity)
            .join(SysNoticeEntity, SysUserNoticeEntity.notice_id == SysNoticeEntity.id)
            .where(
                SysUserNoticeEntity.user_id == user_id,
                SysUserNoticeEntity.is_read == False,
                SysNoticeEntity.is_deleted == False,
            )
        )
        return (await self.db.execute(stmt)).scalar() or 0

    async def get_user_notice_detail(self, user_id: int, notice_id: int):
        """获取单条详情"""
        stmt = (
            select(SysUserNoticeEntity, SysNoticeEntity)
            .join(SysNoticeEntity, SysUserNoticeEntity.notice_id == SysNoticeEntity.id)
            .where(SysUserNoticeEntity.user_id == user_id)
            .where(SysNoticeEntity.id == notice_id)
        )
        result = await self.db.execute(stmt)
        return result.first()

    async def mark_read(self, user_id: int, notice_id: Optional[int] = None):
        """标记已读"""
        stmt = (
            update(SysUserNoticeEntity)
            .where(
                SysUserNoticeEntity.user_id == user_id,
                SysUserNoticeEntity.is_read == False,
            )
            .values(is_read=True, read_at=datetime.now())
        )
        if notice_id:
            stmt = stmt.where(SysUserNoticeEntity.notice_id == notice_id)

        await self.db.execute(stmt)
        await self.db.commit()

    async def delete_user_notice(self, user_id: int, notice_id: int):
        """用户删除通知"""
        stmt_check = select(SysUserNoticeEntity).where(
            SysUserNoticeEntity.user_id == user_id,
            SysUserNoticeEntity.notice_id == notice_id,
        )
        result = await self.db.execute(stmt_check)
        db_obj = result.scalar_one_or_none()

        if not db_obj:
            return None

        db_obj.is_deleted = True
        db_obj.deleted_at = datetime.now()
        await self.db.commit()
        return db_obj
