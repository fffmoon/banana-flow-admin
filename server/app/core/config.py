from pathlib import Path
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """应用配置"""

    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    APP_ENV: str = "development"
    #  CORS
    CORS_ORIGINS: List[str] = ["*"]

    # 基础配置
    APP_NAME: str = "未命名系统"
    VERSION: str = "1.0.0"
    DEBUG: bool = False  # 生产环境应该为 False
    ADMIN_PASSWORD: str = "123456"

    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # 数据库配置
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "banana_flow_admin_db"

    # JWT 安全配置
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # token 过期时间 24小时
    # Redis Token 前缀
    REDIS_TOKEN_PREFIX: str = "sys:token:"

    # 文件上传存储路径
    FILE_UPLOAD_DIR: str = "static/uploads"
    # 文件上传访问路径
    FILE_URL_PREFIX: str = "/static/uploads"
    # 文件上传最大大小 (字节)
    FILE_MAX_SIZE: int = 5 * 1024 * 1024
    # 允许上传的图片类型
    FILE_ALLOWED_IMAGE_TYPES: set = {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
    }

    # 业务配置
    B_PRODUCER_TASK_SW: bool = True
    B_CONSUMER_TASK_SW: bool = True
    REDIS_ROBOT_STATE_KEY: str = "sys:runtime:robots"

    # i18n 配置
    DEFAULT_LOCALE: str = "zh-CN"
    SUPPORTED_LOCALES: list[str] = ["zh-CN", "en-US"]
    I18N_DIR: str = "app/locales"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
