from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.common.schemas.response import CamelCaseModel


class Token(CamelCaseModel):
    """Token 基础模型"""

    access_token: str
    token_type: str


class TokenResponse(Token):
    """Token 响应模型"""

    pass


class TokenPayload(CamelCaseModel):
    """Token 载荷"""

    sub: Optional[str] = None
    exp: Optional[int] = None
