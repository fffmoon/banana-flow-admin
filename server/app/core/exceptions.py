"""
全局异常处理器模块

该模块包含 FastAPI 应用的全局异常处理逻辑，遵循 RESTful API 统一响应格式。
所有异常处理器返回 APIResponse 格式的 JSON 响应。
"""

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.common.schemas.response import APIResponse
from app.core.i18n import i18n


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """处理 HTTP 异常 (如 404 Not Found, 403 Forbidden, 手动 raise HTTPException)"""
    return JSONResponse(
        status_code=exc.status_code,
        content=APIResponse(
            success=False,
            status=exc.status_code,
            data=None,
            title=str(exc.detail),  # 使用异常的 detail 作为 title
            biz_code=f"HTTP_{exc.status_code}",
        ).model_dump(by_alias=True),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """处理参数校验异常 (Pydantic 校验失败)"""
    # 将 Pydantic 的详细错误信息放在 data 中
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=APIResponse(
            success=False,
            status=422,
            data={"errors": exc.errors()},
            title=i18n.t("global.error.validation_error"),
            biz_code="VALIDATION_ERROR",
        ).model_dump(by_alias=True),
    )


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """处理数据库操作异常"""
    logger.error(f"数据库异步操作异常: {exc}")
    return JSONResponse(
        status_code=500,
        content=APIResponse(
            success=False,
            status=500,
            data=str(exc),
            title=i18n.t("global.error.db_error"),
            biz_code="SERVER_ERROR",
        ).model_dump(by_alias=True),
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """处理所有未捕获的异常 (500 Internal Server Error)"""
    # 记录详细错误日志，方便排查
    logger.error(f"全局异常捕获: {exc}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse(
            success=False,
            status=500,
            data=None,  # 生产环境通常不返回具体错误堆栈给前端
            title=i18n.t("global.error.server_error"),
            biz_code="SERVER_ERROR",
        ).model_dump(by_alias=True),
    )


def register_exception_handlers(app):
    """
    注册所有全局异常处理器到 FastAPI 应用

    Args:
        app: FastAPI 应用实例
    """
    app.exception_handler(StarletteHTTPException)(http_exception_handler)
    app.exception_handler(RequestValidationError)(validation_exception_handler)
    app.exception_handler(SQLAlchemyError)(sqlalchemy_exception_handler)
    app.exception_handler(Exception)(global_exception_handler)
