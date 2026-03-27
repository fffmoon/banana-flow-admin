from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey
from app.core.database import Base, SoftDeleteMixin, AuditMixin


class SysFileEntity(Base, SoftDeleteMixin, AuditMixin):
    """
    系统文件表
    """

    __tablename__ = "sys_file"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="文件ID")

    file_name = Column(String(255), nullable=False, comment="原始文件名")
    storage_name = Column(
        String(255), nullable=False, unique=True, comment="存储文件名(UUID)"
    )
    file_path = Column(String(255), nullable=False, comment="相对路径")
    file_url = Column(String(255), nullable=False, comment="访问URL")
    file_size = Column(BigInteger, comment="文件大小(字节)")
    file_type = Column(String(50), comment="文件扩展名")
    mime_type = Column(String(100), comment="MIME类型")

    user_id = Column(Integer, index=True, comment="上传者ID")
