from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm

from app.modules.auth import security
from app.core.config import settings
from app.core.redis_client import redis_manager
from app.core.deps import get_db
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserResponse, UserLogin, UserCreate


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def create_token(self, user_id: int) -> str:
        """生成 Token 并存入 Redis"""
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            subject=str(user_id), expires_delta=access_token_expires
        )

        redis_key = f"{settings.REDIS_TOKEN_PREFIX}{access_token}"
        await redis_manager.redis.set(
            redis_key, str(user_id), ex=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        return access_token

    async def login_json(self, login_data: UserLogin) -> str:
        # 校验用户
        user = await self.user_repo.get_by_username(username=login_data.username)

        if not user or not security.verify_password(
            login_data.password, user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="用户名或密码错误"
            )
        elif not user.is_active:
            raise HTTPException(status_code=400, detail="用户已被冻结")

        # 更新最后登录时间
        await self.user_repo.update_login_time(user.id)

        # 生成 Token
        return await self.create_token(user.id)

    async def login_access_token(self, form_data: OAuth2PasswordRequestForm) -> str:
        user = await self.user_repo.get_by_username(username=form_data.username)

        if not user or not security.verify_password(
            form_data.password, user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="用户名或密码错误"
            )
        elif not user.is_active:
            raise HTTPException(status_code=400, detail="用户已被冻结")

        await self.user_repo.update_login_time(user.id)
        return await self.create_token(user.id)

    async def logout(self, request: Request) -> bool:
        """注销"""
        auth_header = request.headers.get("Authorization")
        if auth_header:
            scheme, _, token = auth_header.partition(" ")
            if scheme.lower() == "bearer" and token:
                redis_key = f"{settings.REDIS_TOKEN_PREFIX}{token}"
                await redis_manager.redis.delete(redis_key)
        return True

    async def register_user(self, user_in: UserCreate) -> UserResponse:
        user = await self.user_repo.get_by_username(username=user_in.username)
        if user:
            raise HTTPException(status_code=400, detail="该用户名已被注册")

        new_user = await self.user_repo.create(obj_in=user_in)
        return new_user


def auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)
