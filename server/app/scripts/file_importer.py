"""
文件导入脚本
使用方法：docker compose exec dt-server-py python app/scripts/file_importer.py -f DeviceMonitor.xml
"""

import argparse
import asyncio
import os
import sys

import xmltodict
from loguru import logger

# 引用 app 模块，必须在导入 app 之前执行！
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal
from app.core.redis_client import redis_manager
from app.modules.pages_generate.service import (
    PageConfigService,
)

# ==========================================
# 配置日志
# ==========================================
logger.remove()  # 移除默认配置
logger.add(sys.stderr, level="INFO")

# 输出到文件
logger.add(
    "./logs/file_importer.log",
    rotation="00:00",
    retention="1 year",
    level="INFO",
    encoding="utf-8",
    compression="zip",
)

# ==========================================
# 目录配置
# ==========================================
IMPORT_DIR = "/app/import_data"
# 如果在本地测试，兼容本地路径
if not os.path.exists(IMPORT_DIR):
    IMPORT_DIR = os.path.join(os.getcwd(), "import_data")


async def process_file(filepath, db, redis_conn):
    """
    处理单个文件
    :param db: SQLAlchemy Session 对象
    :param redis_conn: redis.Redis 连接对象
    """
    filename = os.path.basename(filepath)
    logger.info(f"正在处理文件: {filename}")

    with open(filepath, "rb") as f:
        content = f.read()

    # 简单解析用于判断类型
    try:
        doc = xmltodict.parse(content, process_namespaces=False)
        root_key = list(doc.keys())[0]
        root_data = doc[root_key]
    except Exception as e:
        raise ValueError(f"XML 解析失败: {e}")

    # 根据内容分发
    if "PagesGenerate" in root_data:
        logger.info("类型识别: [通用页面配置]")
        page_service = PageConfigService(db)
        await page_service.import_page_config(content)

    else:
        raise ValueError("未知配置类型 (未找到 DTPDInfo 或 DTODInfo)")


async def main():
    # ==========================================
    # 解析命令行参数
    # ==========================================
    parser = argparse.ArgumentParser(description="XML 数据导入工具 (单文件模式)")
    # 将 file 设为必须参数
    parser.add_argument(
        "-f",
        "--file",
        type=str,
        required=True,
        help="指定要导入的文件名 (需位于 import_data 目录中或提供绝对路径)",
    )
    args = parser.parse_args()

    # ==========================================
    # 路径检查
    # ==========================================
    # 优先尝试作为 import_data 下的文件，如果不存在则尝试作为绝对路径
    target_path = os.path.join(IMPORT_DIR, args.file)

    if not os.path.exists(target_path):
        # 尝试直接使用传入的路径（支持绝对路径）
        if os.path.exists(args.file):
            target_path = args.file
        else:
            logger.error(f"指定的文件不存在: {target_path}")
            return

    logger.info(f"启动导入任务，目标文件: {target_path}")

    # ==========================================
    # 初始化资源
    # ==========================================
    try:
        await redis_manager.initialize()
        redis_client = redis_manager.redis
    except Exception as e:
        logger.error(f"Redis 初始化失败: {e}")
        return

    # ==========================================
    # 执行处理
    # ==========================================
    async with AsyncSessionLocal() as db:
        try:
            await process_file(target_path, db, redis_client)
            await db.commit()  # 显式提交
            logger.info(f"文件导入成功: {args.file}")
        except Exception as e:
            await db.rollback()  # 出错回滚
            logger.error(f"文件处理失败: {str(e)}")
            import traceback

            logger.error(traceback.format_exc())
        finally:
            logger.info("清理资源...")
            await db.close()
            await redis_manager.close()


if __name__ == "__main__":
    asyncio.run(main())
