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
