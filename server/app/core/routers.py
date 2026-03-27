from fastapi import FastAPI

from app.modules.auth.router import router as auth_router
from app.modules.files.router import router as files_router
from app.modules.image_management.router import router as image_management_router
from app.modules.notifications.router import router as notifications_router
from app.modules.operation_log.router import router as operation_log_router
from app.modules.pages_generate.router import router as pages_router
from app.modules.permissions.router import router as menus_router
from app.modules.roles.router import router as roles_router
from app.modules.users.router import router as users_router


def register_routers(app: FastAPI) -> None:
    """
    注册所有路由到 FastAPI 应用
    """

    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(roles_router)
    app.include_router(menus_router)
    app.include_router(pages_router)
    app.include_router(operation_log_router)
    app.include_router(notifications_router)
    app.include_router(files_router)
    app.include_router(image_management_router)
