from loguru import logger
from sqlalchemy import Boolean, Column, DateTime, event, text
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Session, with_loader_criteria

from app.core.config import settings

# aiomysql 用于实际业务连接
ASYNC_SQLALCHEMY_DATABASE_URL = f"mysql+aiomysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# 创建异步引擎
engine = create_async_engine(
    ASYNC_SQLALCHEMY_DATABASE_URL,
    echo=False,  # 调试 SQL 时设为 True
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
)

# 创建异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # 异步模式下通常设为 False 避免不必要的属性过期
)


# 数据库健康检查
async def check_database_connection():
    """
    启动时检查数据库连接是否正常，以及目标数据库是否存在。
    """
    logger.info(
        f"正在连接 mysql 数据库: {settings.DB_HOST}:{settings.DB_PORT} (库名: {settings.DB_NAME})"
    )
    try:
        # 尝试获取连接并执行最简单的查询
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("mysql 连接成功")
    except Exception as e:
        logger.error(
            f"mysql 连接失败！请检查 mysql 是否已启动且 '{settings.DB_NAME}' 是否存在。详细错误: {e}"
        )
        raise e


# 软删除拦截器
@event.listens_for(Session, "do_orm_execute")
def _add_soft_delete_filtering_criteria(execute_state):
    # print(f"DEBUG: 拦截器已捕捉到查询: {execute_state.statement}")
    """
    针对 ORM 执行的全局过滤拦截器
    """
    if execute_state.is_select and not execute_state.execution_options.get(
        "include_deleted", False
    ):
        execute_state.statement = execute_state.statement.options(
            with_loader_criteria(
                SoftDeleteMixin,
                lambda cls: cls.is_deleted == False,
                include_aliases=True,
                propagate_to_loaders=True,
            )
        )


# 基类与 Mixins
class Base(AsyncAttrs, DeclarativeBase):
    """
    使用 AsyncAttrs 允许在异步环境下访问某些映射属性
    """

    pass


class SoftDeleteMixin:
    """自动包含软删除字段"""

    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime, nullable=True)


class AuditMixin:
    """审计混入类"""

    from sqlalchemy.sql import func

    create_time = Column(DateTime, server_default=func.now(), comment="创建时间")
    update_time = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间"
    )
