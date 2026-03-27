import hashlib
import json
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import Depends

from app.core.redis_client import redis_manager
from app.core.deps import get_db
from app.modules.users.models import SysUserEntity
from app.modules.roles.models import SysRoleEntity

from .repository import PermissionRepository
from .models import PermissionsEntity
from .schemas import PermissionResponse, PermissionUpdate, PermissionCreate


class PermissionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PermissionRepository(db)

    def build_tree(self, perms: List[PermissionsEntity]) -> List[Dict]:
        """将扁平列表转为树"""
        nodes = []
        for p in perms:
            if p.type == 1:
                node = {
                    "id": p.id,
                    "parent_id": p.parent_id,
                    "title": p.title,
                    "code": p.code,
                    "type": p.type,
                    "path": p.path,
                    "componentPath": p.component_path,
                    "name": p.name,
                    "redirect": p.redirect,
                    "icon": p.icon,
                    "keepAlive": p.keep_alive,
                    "hideInMenu": p.hide_in_menu,
                    "activeMenu": p.active_menu,
                    "link": p.link,
                    "hideBreadcrumb": p.hide_breadcrumb,
                    "permanent": p.permanent,
                    "singleMenu": p.single_menu,
                    "auth": p.auth,
                    "auths": p.auths,
                    "isLogin": p.is_login,
                    "children": [],
                    "query": p.query,
                }
                nodes.append(node)

        node_map = {n["id"]: n for n in nodes}
        roots = []
        for node in nodes:
            pid = node["parent_id"]
            if pid and pid in node_map:
                node_map[pid]["children"].append(node)
            else:
                roots.append(node)
        return roots

    async def get_user_permissions(self, user_id: int):
        """供 Router 调用：获取用户的完整权限列表（扁平）"""
        return await self.repo.get_by_user_roles(user_id)

    async def get_user_permission_data(self, user_id: int):
        # 1. 使用 repo 实例查询
        all_perms = await self.repo.get_by_user_roles(user_id)

        btn_perms = [p.code for p in all_perms if p.type == 2]
        menu_tree = self.build_tree(all_perms)
        version = self._calculate_version(all_perms)

        redis_key = f"sys:user:perm_version:{user_id}"
        await redis_manager.redis.set(redis_key, version, ex=60 * 60 * 24)

        return {"perms": btn_perms, "menus": menu_tree, "version": version}

    def _calculate_version(self, perms: List[PermissionsEntity]) -> str:
        data_list = [
            PermissionResponse.model_validate(p, from_attributes=True).model_dump()
            for p in perms
        ]
        data_list.sort(key=lambda x: x["id"])
        json_str = json.dumps(data_list, sort_keys=True, default=str)
        return hashlib.md5(json_str.encode("utf-8")).hexdigest()

    async def get_permission_version(self, user_id: int) -> str:
        redis_key = f"sys:user:perm_version:{user_id}"
        cached_version = await redis_manager.redis.get(redis_key)
        if cached_version:
            return cached_version

        all_perms = await self.repo.get_by_user_roles(user_id)
        version = self._calculate_version(all_perms)
        await redis_manager.redis.set(redis_key, version, ex=60 * 60 * 24)
        return version

    async def clear_all_user_cache(self):
        pattern = "sys:user:perm_version:*"
        async for key in redis_manager.redis.scan_iter(pattern):
            await redis_manager.redis.delete(key)

    async def update(self, perm_id: int, obj_in: PermissionUpdate):
        db_obj = await self.repo.update(perm_id, obj_in)
        await self.clear_all_user_cache()
        return db_obj

    async def createAndAssignToUser(self, perm: PermissionCreate, user: SysUserEntity):
        # 创建权限记录
        db_obj = await self.repo.create(perm)

        # 处理角色分配逻辑
        stmt = (
            select(SysUserEntity)
            .options(
                selectinload(SysUserEntity.roles).selectinload(
                    SysRoleEntity.permissions
                )
            )
            .where(SysUserEntity.id == user.id)
        )
        result = await self.db.execute(stmt)
        db_user = result.scalar_one_or_none()

        if db_user and db_user.roles:
            for role in db_user.roles:
                if role.status:
                    role.permissions.append(db_obj)
            await self.db.commit()

        await self.clear_all_user_cache()
        return db_obj

    async def delete(self, perm_id: int):
        await self.repo.delete(perm_id)
        await self.clear_all_user_cache()


def permission_service(db: AsyncSession = Depends(get_db)) -> PermissionService:
    return PermissionService(db)
