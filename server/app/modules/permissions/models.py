from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, JSON
from app.core.database import Base
from app.core.database import SoftDeleteMixin, AuditMixin


class PermissionsEntity(Base, SoftDeleteMixin, AuditMixin):
    """
    系统权限表 (菜单 + 按钮 + 接口)
    """

    __tablename__ = "sys_permissions"

    id = Column(
        Integer, primary_key=True, autoincrement=True, index=True, comment="权限ID"
    )
    parent_id = Column(Integer, nullable=True, default=0, comment="父级ID")

    title = Column(String(100), nullable=False, comment="菜单标题/权限名称")
    type = Column(Integer, nullable=False, comment="类型: 1-菜单 2-按钮/接口")

    # type为2时使用
    code = Column(String(100), comment="权限标识(ex: system:user:add)")

    # 路由相关，type为1时使用
    is_custom_name = Column(Boolean, default=False, comment="是否自定义路由名称")
    name = Column(String(100), comment="路由名称")
    path = Column(String(200), comment="链接地址")
    component_path = Column(String(200), comment="组件路径")
    icon = Column(String(100), comment="图标")
    redirect = Column(String(200), comment="重定向路径")
    sort = Column(Integer, default=0, comment="排序权重")
    keep_alive = Column(Boolean, default=True, comment="是否缓存")
    hide_in_menu = Column(Boolean, default=False, comment="是否在菜单隐藏")
    active_menu = Column(String(200), comment="指定高亮菜单")
    is_login = Column(Boolean, default=False, comment="是否需要登录")
    link = Column(String(500), comment="外部链接")
    permanent = Column(Boolean, default=False, comment="是否永久缓存")
    single_menu = Column(Boolean, default=False, comment="是否单菜单")
    auth = Column(JSON, nullable=True, comment="权限标识数组 ['system:user:add']")
    auths = Column(JSON, nullable=True, comment="权限池对象数组")
    hide_breadcrumb = Column(Boolean, default=False, comment="是否隐藏面包屑")
    query = Column(JSON, nullable=True, comment="查询参数")

    def __repr__(self):
        return f"<PermissionsEntity(title='{self.title}', code='{self.code}')>"
