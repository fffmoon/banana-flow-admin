import os
import sys
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from app.common.schemas.response import APIResponse
from app.core.config import settings
from app.core.database import check_database_connection, engine
from app.core.exceptions import register_exception_handlers
from app.core.redis_client import redis_manager
from app.core.routers import register_routers

# 处理自动化生成页面报错

# 挂载日志
logger.remove()
logger.add(sys.stderr, level="INFO")
# 将日志输出到文件
logger.add(
    "./logs/dt-server.log",
    rotation="00:00",
    retention="360 days",
    level="INFO",
    encoding="utf-8",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info(f"正在启动{settings.APP_NAME}...")

    # Redis 连接初始化
    await redis_manager.initialize()
    await check_database_connection()
    yield

    logger.info("关闭中...")

    # 停止 Worker
    if hasattr(app.state, "worker_manager"):
        await app.state.worker_manager.stop()

    # 关闭 Redis
    await redis_manager.close()
    # 关闭数据库连接
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件目录
os.makedirs(settings.FILE_UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 注册全局异常处理器
register_exception_handlers(app)

# 路由注册
register_routers(app)


@app.get(
    "/",
    tags=["测试能否访问"],
)
async def root():
    return APIResponse(
        data={
            "appName": settings.APP_NAME,
            "version": settings.VERSION,
            "env": settings.APP_ENV,
        },
        title="服务运行正常",
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG
    )
