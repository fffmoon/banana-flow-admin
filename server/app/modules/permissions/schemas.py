from pydantic import Field
from typing import List, Optional, Dict, Any
from app.common.schemas.response import CamelCaseModel


class PermissionBase(CamelCaseModel):
    parent_id: Optional[int] = Field(0, description="父级ID")
    title: str = Field(..., min_length=1, max_length=100)
    name: Optional[str] = None
    code: str = Field(..., description="权限标识")
    type: int = Field(..., description="1-菜单 2-按钮 3-接口")
    is_custom_name: bool = Field(False, description="是否自定义路由名称")

    path: Optional[str] = None
    component_path: Optional[str] = None
    icon: Optional[str] = None
    redirect: Optional[str] = None
    sort: int = 0

    keep_alive: bool = True
    hide_in_menu: bool = False

    hide_breadcrumb: bool = False
    permanent: bool = False
    single_menu: bool = False

    active_menu: Optional[str] = None
    is_login: bool = False
    link: Optional[str] = None

    auth: Optional[List[str]] = []
    auths: Optional[List[Dict[str, Any]]] = []
    query: Optional[Dict[str, Any]] = None


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(CamelCaseModel):
    # 允许所有字段更新
    title: Optional[str] = None
    name: Optional[str] = None
    code: Optional[str] = None
    type: Optional[int] = None
    path: Optional[str] = None
    component_path: Optional[str] = None
    icon: Optional[str] = None
    redirect: Optional[str] = None
    sort: Optional[int] = None

    keep_alive: Optional[bool] = None
    hide_in_menu: Optional[bool] = None
    hide_breadcrumb: Optional[bool] = None
    permanent: Optional[bool] = None
    single_menu: Optional[bool] = None
    is_login: Optional[bool] = None

    active_menu: Optional[str] = None
    link: Optional[str] = None
    parent_id: Optional[int] = None
    auth: Optional[List[str]] = None
    auths: Optional[List[dict]] = None
    query: Optional[Dict[str, Any]] = None

    is_custom_name: Optional[bool] = None


class PermissionResponse(PermissionBase):
    id: int


class PermissionTreeResponse(PermissionResponse):
    children: Optional[List["PermissionTreeResponse"]] = []


PermissionTreeResponse.model_rebuild()


class PermMenuResponse(CamelCaseModel):
    perms: List[str]
    menus: List[PermissionTreeResponse]
    version: str


class PermVersionResponse(CamelCaseModel):
    """权限版本号响应"""

    version: str = Field(..., description="权限版本哈希值")
