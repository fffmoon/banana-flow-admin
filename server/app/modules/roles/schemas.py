from pydantic import Field
from typing import Optional, List
from app.common.schemas.response import CamelCaseModel


# 基础模型
class RoleBase(CamelCaseModel):
    role_name: str = Field(..., min_length=1, max_length=50, description="角色名称")
    role_code: str = Field(..., min_length=1, max_length=50, description="权限标识")
    status: bool = Field(True, description="角色状态")
    sort: int = Field(0, description="显示顺序")
    is_system: bool = Field(False, description="是否为系统角色")
    role_level: int = Field(10, description="角色等级")


class RoleCreate(RoleBase):
    pass


class RoleUpdate(CamelCaseModel):
    role_name: Optional[str] = None
    role_code: Optional[str] = None
    status: Optional[bool] = None
    sort: Optional[int] = None
    role_level: Optional[int] = None


class RoleResponse(RoleBase):
    id: int
    menu_ids: List[int] = []


class RoleWithEditResponse(RoleResponse):
    can_edit: bool = Field(True, description="是否可编辑")


# 用于给角色分配菜单的请求体
class RoleMenuUpdate(CamelCaseModel):
    menu_ids: List[int] = Field(..., description="菜单ID列表")
