# fmt: off
# ruff: noqa: I001, E402, F401
import sys
import os
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context

# =========================================================
# 1. Python 工作目录路径 & 导入项目配置
# =========================================================
sys.path.append(os.getcwd())

from app.core.database import Base, ASYNC_SQLALCHEMY_DATABASE_URL

# 导入所有需要迁移的模型类
from app.modules.devices.models import DeviceInfoEntity
from app.modules.pages_generate.models import PagesGenerateEntity
from app.modules.permissions.models import PermissionsEntity
from app.modules.users.models import SysUserEntity
from app.modules.operation_log.models import OperationLogEntity
from app.modules.notifications.models import SysUserNoticeEntity
from app.modules.files.models import SysFileEntity
from app.modules.roles.models import SysRoleEntity
from app.modules.image_management.models import ImageDirectoryEntity, ImageFileEntity

# =========================================================
# 2. 配置 Alembic
# =========================================================
config = context.config

# 配置日志
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 设置目标元数据
target_metadata = Base.metadata

# =========================================================
# 3. 迁移函数定义
# =========================================================


def run_migrations_offline() -> None:
    """离线模式迁移（生成 SQL 脚本）"""
    url = ASYNC_SQLALCHEMY_DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """同步辅助函数：在异步连接中执行迁移"""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """异步在线模式迁移"""

    # 创建异步引擎
    connectable = create_async_engine(
        ASYNC_SQLALCHEMY_DATABASE_URL,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # 使用 run_sync 桥接同步逻辑
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


# =========================================================
# 4. 执行入口
# =========================================================
if context.is_offline_mode():
    run_migrations_offline()
else:
    # 针对异步驱动，使用 asyncio 运行
    try:
        asyncio.run(run_migrations_online())
    except RuntimeError:
        # 兼容处理已存在事件循环的情况
        loop = asyncio.get_event_loop()
        loop.run_until_complete(run_migrations_online())
