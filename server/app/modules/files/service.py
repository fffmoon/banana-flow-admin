import os
import uuid
import aiofiles
from datetime import datetime
from fastapi import UploadFile, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.core.deps import get_db
from app.core.config import settings
from app.modules.users.models import SysUserEntity
from .repository import FileRepository
from .models import SysFileEntity

ALLOWED_IMAGE_TYPES = settings.FILE_ALLOWED_IMAGE_TYPES
MAX_FILE_SIZE = settings.FILE_MAX_SIZE


class FileService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = FileRepository(db)
        self.base_upload_dir = settings.FILE_UPLOAD_DIR
        self.url_prefix = settings.FILE_URL_PREFIX

    async def upload_image(
        self, file: UploadFile, current_user: SysUserEntity
    ) -> SysFileEntity:
        """
        处理图片上传
        """
        # 校验文件类型
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件格式。仅允许上传图片文件 ({', '.join(ALLOWED_IMAGE_TYPES)}。",
            )

        # 校验文件大小，一般通常在 Nginx 处理
        file.file.seek(0, 2)
        file_size = file.file.tell()
        await file.seek(0)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"文件大小超出限制。允许的最大上传大小为 {MAX_FILE_SIZE / 1024 / 1024}MB。",
            )

        # 存储路径
        today = datetime.now()
        date_dir = today.strftime("%Y/%m/%d")
        upload_path = os.path.join(self.base_upload_dir, date_dir)

        # 确保目录存在
        if not os.path.exists(upload_path):
            os.makedirs(upload_path, exist_ok=True)

        # 生成唯一文件名
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        full_file_path = os.path.join(upload_path, unique_name)

        # 异步写入
        try:
            async with aiofiles.open(full_file_path, "wb") as out_file:
                content = await file.read()
                await out_file.write(content)
        except Exception as e:
            logger.error(f"文件写入失败: {e}")
            raise HTTPException(
                status_code=500, detail="文件上传失败，服务器内部存储错误。"
            )

        # 写入数据库
        relative_path = f"{date_dir}/{unique_name}"
        file_url = f"{self.url_prefix}/{relative_path}"

        file_data = {
            "file_name": file.filename,
            "storage_name": unique_name,
            "file_path": relative_path,
            "file_url": file_url,
            "file_size": file_size,
            "file_type": ext,
            "mime_type": file.content_type,
            "user_id": current_user.id,
        }

        return await self.repo.create(file_data)


def file_service(db: AsyncSession = Depends(get_db)) -> FileService:
    return FileService(db)
