from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.i18n import i18n
from app.core.redis_client import redis_manager
from app.modules.roles.models import SysRoleEntity
from app.modules.users.models import SysUserEntity

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login/json")


# 异步获取数据库会话
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# 获取当前用户
async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> SysUserEntity:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=i18n.t("global.error.unauthorized"),
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    # 异步 Redis 校验
    redis_key = f"{settings.REDIS_TOKEN_PREFIX}{token}"
    if not await redis_manager.redis.exists(redis_key):
        raise credentials_exception

    # 自动续期
    await redis_manager.redis.expire(
        redis_key, settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    result = await db.execute(
        select(SysUserEntity)
        .options(
            joinedload(SysUserEntity.roles).selectinload(SysRoleEntity.permissions)
        )
        .where(SysUserEntity.id == user_id)
    )
    user = result.unique().scalar_one_or_none()

    if not user:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: SysUserEntity = Depends(get_current_user),
) -> SysUserEntity:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="用户已被冻结")
    return current_user


# 权限检查器
class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    async def __call__(
        self, user: SysUserEntity = Depends(get_current_active_user)
    ) -> SysUserEntity:
        if user.is_super_admin:
            return user

        user_permissions = {
            p.code for r in user.roles if r.status for p in r.permissions if p.code
        }

        if self.required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=i18n.t(
                    "global.permission.error.forbidden", perm=self.required_permission
                ),
            )
        return user


def check_permission(perm_code: str):
    return Depends(PermissionChecker(perm_code))
