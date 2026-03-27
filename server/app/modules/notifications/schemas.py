from pydantic import Field, ConfigDict
from typing import Optional, List, Tuple
from datetime import datetime
from app.common.schemas.response import CamelCaseModel
from app.modules.notifications.models import SysUserNoticeEntity, SysNoticeEntity

# --- 请求模型 ---


class NoticeCreate(CamelCaseModel):
    """创建通知 (管理员)"""

    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(...)
    notice_type: int = Field(1, description="1-通知 2-公告")
    # 为空发给所有人
    target_user_ids: List[int] = Field(default=[], description="目标用户ID列表")


class NoticeUpdate(CamelCaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class ListMyNoticesQuery(CamelCaseModel):
    """获取我的消息列表查询参数"""

    is_read: Optional[bool] = None
    notice_type: int = Field(0, description="类型: 0-全部, 1-通知, 2-公告, 3-私信")
    title: Optional[str] = Field(None, description="标题模糊搜索")
    publisher_name: Optional[str] = Field(None, description="发布人模糊搜索")


# --- 响应模型 ---


class NoticeBase(CamelCaseModel):
    id: int
    title: str
    notice_type: int
    publisher_name: Optional[str] = None
    create_time: datetime


class UserNoticeResponse(NoticeBase):
    """用户视角的通知列表项"""

    content: Optional[str] = None
    is_read: bool
    read_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_tuple(
        cls, orm_tuple: Tuple[SysUserNoticeEntity, SysNoticeEntity]
    ) -> "UserNoticeResponse":
        """
        从 SQLAlchemy 查询返回的 (SysUserNoticeEntity, SysNoticeEntity) 元组创建 UserNoticeResponse
        """
        user_notice, notice_content = orm_tuple

        data_to_combine = {
            "id": notice_content.id,
            "title": notice_content.title,
            "content": notice_content.content,
            "notice_type": notice_content.notice_type,
            "publisher_name": notice_content.publisher_name,
            "create_time": notice_content.create_time,
            "is_read": user_notice.is_read,
            "read_at": user_notice.read_at,
        }
        return cls.model_validate(data_to_combine)


class UnreadCountResponse(CamelCaseModel):
    unread_count: int
