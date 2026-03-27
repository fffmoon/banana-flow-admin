from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import AuditMixin, Base, SoftDeleteMixin


class ImageDirectoryEntity(Base, SoftDeleteMixin, AuditMixin):
    """
    图片管理 - 目录表
    """

    __tablename__ = "img_directory"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="目录ID")
    parent_id = Column(
        Integer, ForeignKey("img_directory.id"), nullable=True, comment="父级目录ID"
    )
    name = Column(String(255), nullable=False, comment="目录名称")
    user_id = Column(Integer, index=True, nullable=False, comment="所属用户ID")


class ImageFileEntity(Base, SoftDeleteMixin, AuditMixin):
    """
    图片管理 - 文件映射表
    """

    __tablename__ = "img_file"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="虚拟文件ID")
    dir_id = Column(
        Integer, ForeignKey("img_directory.id"), nullable=True, comment="所属目录ID"
    )
    file_id = Column(
        Integer, ForeignKey("sys_file.id"), nullable=False, comment="关联的物理文件ID"
    )
    name = Column(String(255), nullable=False, comment="显示的文件名")
    user_id = Column(Integer, index=True, nullable=False, comment="所属用户ID")

    # 预加载物理文件信息
    sys_file = relationship("SysFileEntity", foreign_keys=[file_id], lazy="noload")
