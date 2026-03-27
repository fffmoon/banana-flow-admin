from typing import List, Optional, Tuple

from sqlalchemy import func, literal, select, union_all, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.files.models import SysFileEntity

from .models import ImageDirectoryEntity, ImageFileEntity


class ImageManagementRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # 获取一个用户下的根目录
    async def get_root_dir(self, user_id: int) -> Optional[ImageDirectoryEntity]:
        stmt = select(ImageDirectoryEntity).where(
            ImageDirectoryEntity.user_id == user_id,
            ImageDirectoryEntity.parent_id == None,
            ImageDirectoryEntity.is_deleted == False,
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    # 创建一个目录
    async def create_dir(self, directory: ImageDirectoryEntity) -> ImageDirectoryEntity:
        self.db.add(directory)
        await self.db.commit()
        await self.db.refresh(directory)
        return directory

    # 创建一个文件映射
    async def create_image_file(self, img_file: ImageFileEntity) -> ImageFileEntity:
        self.db.add(img_file)
        await self.db.commit()
        await self.db.refresh(img_file)
        return img_file

    # 获取一个用户下的指定目录
    async def get_dir_by_id(
        self, dir_id: int, user_id: int
    ) -> Optional[ImageDirectoryEntity]:
        stmt = select(ImageDirectoryEntity).where(
            ImageDirectoryEntity.id == dir_id,
            ImageDirectoryEntity.user_id == user_id,
            ImageDirectoryEntity.is_deleted == False,
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    # 获取一个用户下的所有文件
    async def get_image_by_id(
        self, img_id: int, user_id: int
    ) -> Optional[ImageFileEntity]:
        stmt = select(ImageFileEntity).where(
            ImageFileEntity.id == img_id,
            ImageFileEntity.user_id == user_id,
            ImageFileEntity.is_deleted == False,
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    # 获取一个用户下的所有目录
    async def get_all_dirs_by_user(self, user_id: int) -> List[ImageDirectoryEntity]:
        stmt = select(ImageDirectoryEntity).where(
            ImageDirectoryEntity.user_id == user_id,
            ImageDirectoryEntity.is_deleted == False,
        )
        return list((await self.db.execute(stmt)).scalars().all())

    # 获取一个父目录下的所有子项（目录）
    async def get_all_children(
        self, user_id: int, parent_id: int
    ) -> List[ImageDirectoryEntity]:
        stmt = select(ImageDirectoryEntity).where(
            ImageDirectoryEntity.user_id == user_id,
            ImageDirectoryEntity.parent_id == parent_id,
            ImageDirectoryEntity.is_deleted == False,
        )
        return list((await self.db.execute(stmt)).scalars().all())

    # 检查一个目录下是否有子项或文件
    async def check_dir_has_content(self, dir_id: int) -> bool:
        # 检查子目录
        dir_count = await self.db.execute(
            select(func.count()).where(
                ImageDirectoryEntity.parent_id == dir_id,
                ImageDirectoryEntity.is_deleted == False,
            )
        )
        # 检查子文件
        file_count = await self.db.execute(
            select(func.count()).where(
                ImageFileEntity.dir_id == dir_id, ImageFileEntity.is_deleted == False
            )
        )
        return (dir_count.scalar() or 0) > 0 or (file_count.scalar() or 0) > 0

    # 删除一个目录
    async def delete_dir(self, dir_id: int):
        stmt = (
            update(ImageDirectoryEntity)
            .where(ImageDirectoryEntity.id == dir_id)
            .values(is_deleted=True)
        )
        await self.db.execute(stmt)
        await self.db.commit()

    # 删除一个文件
    async def delete_image(self, img_id: int):
        stmt = (
            update(ImageFileEntity)
            .where(ImageFileEntity.id == img_id)
            .values(is_deleted=True)
        )
        await self.db.execute(stmt)
        await self.db.commit()

    # 检查一个目录下是否存在同名的文件
    async def check_same_name_in_dir(
        self, user_id: int, dir_id: int, name: str
    ) -> Optional[ImageFileEntity]:
        stmt = select(ImageFileEntity).where(
            ImageFileEntity.user_id == user_id,
            ImageFileEntity.dir_id == dir_id,
            ImageFileEntity.name == name,
            ImageFileEntity.is_deleted == False,
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    # 检查一个目录下是否存在同名的目录
    async def check_same_dir_name_in_dir(
        self, user_id: int, dir_id: int, name: str
    ) -> Optional[ImageDirectoryEntity]:
        stmt = select(ImageDirectoryEntity).where(
            ImageDirectoryEntity.user_id == user_id,
            ImageDirectoryEntity.id == dir_id,
            ImageDirectoryEntity.name == name,
            ImageDirectoryEntity.is_deleted == False,
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    # 获取一个用户下的所有文件（分页）
    async def get_paginated_content(
        self,
        user_id: int,
        dir_id: Optional[int],
        search_name: Optional[str],
        offset: int,
        limit: int,
    ) -> Tuple[List, int]:
        """使用 UNION ALL 进行分页查询，合并文件夹和文件"""

        # 基础目录查询
        dir_stmt = select(
            ImageDirectoryEntity.id.label("id"),
            ImageDirectoryEntity.name.label("name"),
            literal("folder").label("type"),
            literal("").label("file_path"),
            literal("").label("file_type"),
            ImageDirectoryEntity.create_time.label("create_time"),
        ).where(
            ImageDirectoryEntity.user_id == user_id,
            ImageDirectoryEntity.is_deleted == False,
        )

        # 基础文件查询
        file_stmt = (
            select(
                ImageFileEntity.id.label("id"),
                ImageFileEntity.name.label("name"),
                literal("file").label("type"),
                SysFileEntity.file_url.label("file_path"),
                SysFileEntity.mime_type.label("file_type"),
                ImageFileEntity.create_time.label("create_time"),
            )
            .select_from(ImageFileEntity)
            .join(SysFileEntity, ImageFileEntity.file_id == SysFileEntity.id)
            .where(
                ImageFileEntity.user_id == user_id, ImageFileEntity.is_deleted == False
            )
        )

        # 过滤条件逻辑
        if search_name:
            dir_stmt = dir_stmt.where(
                ImageDirectoryEntity.name.ilike(f"%{search_name}%")
            )
            file_stmt = file_stmt.where(ImageFileEntity.name.ilike(f"%{search_name}%"))
        elif dir_id is not None:
            dir_stmt = dir_stmt.where(ImageDirectoryEntity.parent_id == dir_id)
            file_stmt = file_stmt.where(ImageFileEntity.dir_id == dir_id)

        # 构建 UNION 查询
        union_subq = union_all(dir_stmt, file_stmt).subquery()

        # 查询总数
        count_stmt = select(func.count()).select_from(union_subq)
        total = (await self.db.execute(count_stmt)).scalar() or 0

        # 分页查询 (优先显示文件夹，其次按时间倒序)
        data_stmt = (
            select(union_subq)
            .order_by(
                union_subq.c.type.desc(),  # 'folder' > 'file'
                union_subq.c.create_time.desc(),
            )
            .offset(offset)
            .limit(limit)
        )

        rows = (await self.db.execute(data_stmt)).all()
        return rows, total
