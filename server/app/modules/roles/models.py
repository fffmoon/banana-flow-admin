from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.database import SoftDeleteMixin, AuditMixin

# 角色-权限 关联表
sys_role_permission = Table(
    "sys_role_permission",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("sys_role.id"), primary_key=True),
    Column(
        "permission_id", Integer, ForeignKey("sys_permissions.id"), primary_key=True
    ),
)

# 用户-角色 关联表
sys_user_role = Table(
    "sys_user_role",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("sys_user.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("sys_role.id"), primary_key=True),
)


class SysRoleEntity(Base, SoftDeleteMixin, AuditMixin):
    """角色表"""

    __tablename__ = "sys_role"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    role_name = Column(String(50), nullable=False, comment="角色名称")

    role_code = Column(
        String(50), unique=True, nullable=False, comment="角色编码(ex: admin)"
    )

    status = Column(Boolean, default=True, comment="角色状态")
    sort = Column(Integer, default=0, comment="显示顺序")
    is_system = Column(Boolean, default=False, comment="是否系统内置角色")

    role_level = Column(
        Integer,
        default=10,
        nullable=False,
        comment="角色等级(0-超级管理员, 1-系统管理员, 10-普通用户, 100-访客)",
    )

    # 关联权限
    permissions = relationship(
        "PermissionsEntity", secondary=sys_role_permission, backref="roles"
    )