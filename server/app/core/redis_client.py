import redis.asyncio as redis
from loguru import logger

from app.core.config import settings


class RedisManager:
    def __init__(self):
        self.client: redis.Redis | None = None

    async def initialize(self):
        """
        初始化连接池
        """
        if self.client is not None:
            return

        logger.info(f"正在连接 Redis : {settings.REDIS_HOST}:{settings.REDIS_PORT}")
        try:
            # DOTO 后续可以使用 from_url 或直接传参，启用连接池特性
            self.client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD,
                decode_responses=True,
                encoding="utf-8",
                # 连接池设置
                socket_timeout=5,
                socket_connect_timeout=5,
                retry_on_timeout=True,  # 自动重试
                health_check_interval=30,  # 库内部自动每30秒ping一次
            )
            # 启动时测试一次连接
            await self.client.ping()
            logger.info("Redis 连接成功")
        except Exception as e:
            logger.error(f"Redis 连接初始化失败: {e}")
            raise e

    async def close(self):
        """关闭连接池"""
        if self.client:
            await self.client.close()
            logger.info("Redis 连接已关闭")

    @property
    def redis(self) -> redis.Redis:
        """
        获取 Redis 实例。如果未初始化则抛出错误，我已经在mian中使用，一般不会报错
        """
        if self.client is None:
            raise RuntimeError(
                "Redis 尚未初始化，请确保在应用启动时调用了 initialize()"
            )
        return self.client


# 全局单例
redis_manager = RedisManager()
