from pydantic import EmailStr, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.common.schemas.response import CamelCaseModel
from app.modules.roles.schemas import RoleBase


class UserEditableBase(CamelCaseModel):
    """
    可编辑的通用字段基类户
    """

    nickname: Optional[str] = Field(None, max_length=50, description="昵称")
    email: Optional[EmailStr] = Field(None, description="邮箱")
    mobile_phone: Optional[str] = Field(
        None, pattern=r"^1[3-9]\d{9}$", description="手机号"
    )
    avatar: Optional[str] = Field(None, max_length=255, description="头像URL")
    gender: Optional[int] = Field(None, ge=0, le=2, description="性别 0-未知 1-男 2-女")

    @field_validator("email", "mobile_phone", mode="before")
    @classmethod
    def empty_string_to_none(cls, v: Optional[str]):
        """
        通用校验器：将前端传来的空字符串 "" 转换为 None，
        避免数据库唯一索引冲突或格式校验失败
        """
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v


class UserCreate(UserEditableBase):
    """创建用户请求参数"""

    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, description="密码")
    role_ids: List[int] = Field(default=[], description="角色ID列表")
    is_active: bool = Field(default=True, description="是否启用")


class UserProfileUpdate(UserEditableBase):
    """
    个人修改资料请求参数
    """

    pass


class UserAdminUpdate(UserEditableBase):
    """
    管理员修改用户请求参数
    """

    role_ids: Optional[List[int]] = Field(None, description="角色ID列表")
    is_active: Optional[bool] = Field(None, description="是否启用/禁用")


class UserLogin(CamelCaseModel):
    """用户登录请求参数"""

    username: str
    password: str


class UserBase(UserEditableBase):
    """用户基础信息"""

    username: str
    is_active: bool


class UserResponse(UserBase):
    """
    完整的用户响应模型
    """

    id: int
    last_login_time: Optional[datetime] = None
    # 嵌套角色信息，避免循环导入，确保 RoleBase 在外部已定义
    roles: List[RoleBase] = []

    # 确保 ORM 模型能转换为 Pydantic
    model_config = ConfigDict(from_attributes=True)


class UserFilter(CamelCaseModel):
    """用户列表查询参数"""

    username: Optional[str] = None
    email: Optional[str] = None
    mobile_phone: Optional[str] = None
    nickname: Optional[str] = None
    is_active: Optional[bool] = None


class UserPasswordUpdate(CamelCaseModel):
    """
    修改密码请求参数
    """

    old_password: str = Field(..., description="旧密码")
    new_password: str = Field(..., min_length=6, description="新密码")
