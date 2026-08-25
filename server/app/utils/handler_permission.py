from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.permissions.models import PermissionsEntity
from app.modules.roles.models import SysRoleEntity, sys_role_permission, sys_user_role


def has_permission(current_user_role_level: int, target_role_level: int) -> bool:
    """
    判断当前用户是否有权限编辑目标角色。例如：用户权限等级0（超级管理员）可以编辑权限等级1（管理员）

    Args:
        current_user_role_level: 当前用户的权限等级（数字越小权限越大）
        target_role_level: 目标角色的权限等级（数字越小权限越大）

    Returns:
        bool: 当前用户可以编辑目标角色时返回True
    """
    # 数字越小权限越大，所以当前用户数字 < 目标角色数字 时，有权限
    return current_user_role_level < target_role_level


async def check_has_permission(
    db: AsyncSession, user_id: int, is_super_admin: bool, perm_code: str
) -> bool:
    """
    通用权限检查：判断用户是否拥有特定的权限标识码
    """
    if is_super_admin:
        return True

    stmt = (
        select(PermissionsEntity.id)
        .join(
            sys_role_permission,
            PermissionsEntity.id == sys_role_permission.c.permission_id,
        )
        .join(SysRoleEntity, SysRoleEntity.id == sys_role_permission.c.role_id)
        .join(sys_user_role, SysRoleEntity.id == sys_user_role.c.role_id)
        .where(
            sys_user_role.c.user_id == user_id,
            SysRoleEntity.status == True,
            PermissionsEntity.code == perm_code,
        )
        .limit(1)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None
