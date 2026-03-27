from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.database import SoftDeleteMixin, AuditMixin
from app.modules.roles.models import sys_user_role, SysRoleEntity


class SysUserEntity(Base, SoftDeleteMixin, AuditMixin):
    """用户表"""

    __tablename__ = "sys_user"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    username = Column(
        String(50), unique=True, index=True, nullable=False, comment="账号"
    )
    password_hash = Column(String(100), nullable=False, comment="加密密码")
    nickname = Column(String(50), comment="昵称")
    avatar = Column(String(255), comment="头像")
    email = Column(String(100), index=True, comment="邮箱")
    mobile_phone = Column(String(20), index=True, comment="手机号")
    gender = Column(Integer, default=0, comment="性别(0-未知, 1-男, 2-女)")

    is_active = Column(Boolean, default=True, comment="账户状态")
    is_system = Column(Boolean, default=False, comment="是否系统内置用户")
    last_login_time = Column(DateTime, nullable=True, comment="最后登录时间")

    # 关联角色
    roles = relationship("SysRoleEntity", secondary=sys_user_role, backref="users")

    @property
    def is_super_admin(self) -> bool:
        """
        判断是否为超级管理员
        可以基于 role_code 判断，也可以基于 role_level == 0 判断
        这里建议保持基于 role_code 的判断，防止数据不一致时的安全隐患
        """
        return any(role.role_code == "super_admin" for role in self.roles)

    @property
    def role_level(self) -> int:
        """
        获取用户当前的最高等级（数值越小，等级越高）。
        如果用户没有角色，默认返回一个较低的等级（如 999）。
        只计算启用状态的角色。
        """
        if not self.roles:
            return 999  # 无角色，等级最低

        # 筛选出启用的角色等级
        levels = [role.role_level for role in self.roles if role.status]

        if not levels:
            return 999

        return min(levels)
