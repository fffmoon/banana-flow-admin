from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base, SoftDeleteMixin, AuditMixin


class SysNoticeEntity(Base, SoftDeleteMixin, AuditMixin):
    """
    通知公告内容表
    """

    __tablename__ = "sys_notice"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    title = Column(String(255), nullable=False, comment="标题")
    content = Column(Text, nullable=False, comment="内容")

    # 消息类型: 1-通知(Notification) 2-公告(Announcement) 3-私信(Direct Message)
    notice_type = Column(Integer, default=1, comment="类型: 1-通知 2-公告 3-私信")

    # 发布者ID
    publisher_id = Column(Integer, comment="发布者ID", nullable=True)
    publisher_name = Column(String(50), comment="发布者姓名", nullable=True)


class SysUserNoticeEntity(Base, SoftDeleteMixin):
    """
    用户消息状态表
    """

    __tablename__ = "sys_user_notice"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    notice_id = Column(Integer, ForeignKey("sys_notice.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("sys_user.id"), nullable=False, index=True)

    is_read = Column(Boolean, default=False, index=True, comment="是否已读")
    read_at = Column(DateTime, nullable=True, comment="阅读时间")

    notice = relationship("SysNoticeEntity", lazy="noload")
