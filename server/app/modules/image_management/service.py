import math
from typing import List, Optional

from fastapi import Depends, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.schemas.pages import PagedData, PageParams
from app.core.deps import get_db
from app.modules.files.service import FileService, file_service
from app.modules.users.models import SysUserEntity

from .models import ImageDirectoryEntity, ImageFileEntity
from .repository import ImageManagementRepository
from .schemas import (
    CreateDirReq,
    DirectoryItemRes,
    MoveDirReq,
    MoveImageReq,
    RenameDirReq,
    RenameImageReq,
)


class ImageManagementService:
    def __init__(self, db: AsyncSession, file_svc: FileService):
        self.db = db
        self.repo = ImageManagementRepository(db)
        self.file_svc = file_svc

    async def get_or_create_root(self, current_user: SysUserEntity) -> int:
        root_dir = await self.repo.get_root_dir(current_user.id)
        if not root_dir:
            root_dir = await self.repo.create_dir(
                ImageDirectoryEntity(
                    name="根目录", parent_id=None, user_id=current_user.id
                )
            )
        return root_dir.id

    async def create_directory(self, req: CreateDirReq, current_user: SysUserEntity):
        parent_id = req.dir_id or await self.get_or_create_root(current_user)
        new_dir = ImageDirectoryEntity(
            name=req.name, parent_id=parent_id, user_id=current_user.id
        )
        # 检查当前目录下是否存在同名目录
        is_duplicate = await self.repo.check_same_dir_name_in_dir(
            current_user.id, parent_id, req.name
        )

        if is_duplicate:
            raise HTTPException(
                status_code=400,
                detail=f"当前目录下已存在名为 '{req.name}' 的目录，无法创建同名目录。",
            )

        new_dir = ImageDirectoryEntity(
            name=req.name, parent_id=parent_id, user_id=current_user.id
        )
        await self.repo.create_dir(new_dir)

    async def rename_directory(self, req: RenameDirReq, current_user: SysUserEntity):
        dir_obj = await self.repo.get_dir_by_id(req.dir_id, current_user.id)
        if not dir_obj:
            raise HTTPException(
                status_code=404, detail="系统未查询到相关目录记录，可能已被移除。"
            )
        if dir_obj.parent_id is None:
            raise HTTPException(
                status_code=403, detail="受系统保护机制限制，根目录无法被重命名。"
            )

        # 检查当前目录下是否存在同名目录
        is_duplicate = await self.repo.check_same_dir_name_in_dir(
            current_user.id, dir_obj.parent_id, req.name
        )

        if is_duplicate:
            raise HTTPException(
                status_code=400,
                detail=f"当前目录下已存在名为 '{req.name}' 的目录，无法重命名到同名目录。",
            )

        dir_obj.name = req.name
        await self.db.commit()

    async def delete_directory(self, dir_id: int, current_user: SysUserEntity):
        dir_obj = await self.repo.get_dir_by_id(dir_id, current_user.id)
        if not dir_obj:
            raise HTTPException(status_code=404, detail="系统未查询到相关目录记录。")
        if dir_obj.parent_id is None:
            raise HTTPException(
                status_code=403, detail="受系统保护机制限制，核心根目录无法被删除。"
            )

        has_content = await self.repo.check_dir_has_content(dir_id)
        if has_content:
            raise HTTPException(
                status_code=400,
                detail="当前目录层级下包含有效的文件或子目录，受数据保护机制限制，请先清空内容后再执行删除操作。",
            )

        await self.repo.delete_dir(dir_id)

    async def move_directory(self, req: MoveDirReq, current_user: SysUserEntity):
        if req.dir_id == req.target_dir_id:
            raise HTTPException(
                status_code=400,
                detail="受系统逻辑限制，目标路径与原路径相同，无法执行移动操作。",
            )

        dir_obj = await self.repo.get_dir_by_id(req.dir_id, current_user.id)
        if not dir_obj or dir_obj.parent_id is None:
            raise HTTPException(
                status_code=403, detail="受系统保护机制限制，无法移动根目录或无效目录。"
            )

        # 防止将目录移动到自己的子目录中（环路检测）
        all_dirs = await self.repo.get_all_dirs_by_user(current_user.id)
        dir_dict = {d.id: d.parent_id for d in all_dirs}

        curr_parent = req.target_dir_id
        while curr_parent is not None:
            if curr_parent == req.dir_id:
                raise HTTPException(
                    status_code=400,
                    detail="受层级系统逻辑关联限制，无法将目标目录移动至其自身的子目录中。",
                )
            curr_parent = dir_dict.get(curr_parent)

        # 检查目标目录下是否存在同名目录
        is_duplicate = await self.repo.check_same_dir_name_in_dir(
            current_user.id, req.target_dir_id, dir_obj.name
        )
        if is_duplicate:
            raise HTTPException(
                status_code=400,
                detail=f"目标目录下已存在名为 '{dir_obj.name}' 的目录，无法移动到同名目录。",
            )

        dir_obj.parent_id = req.target_dir_id
        await self.db.commit()

    async def upload_image(
        self, dir_id: int, file: UploadFile, current_user: SysUserEntity
    ):
        # 1. 调用已有的底层系统文件上传服务
        sys_file = await self.file_svc.upload_image(file, current_user)

        # 2. 创建虚拟映射
        target_dir = dir_id or await self.get_or_create_root(current_user)
        img_file = ImageFileEntity(
            dir_id=target_dir,
            file_id=sys_file.id,
            name=sys_file.file_name,
            user_id=current_user.id,
        )
        await self.repo.create_image_file(img_file)

    async def rename_image(self, req: RenameImageReq, current_user: SysUserEntity):
        img_obj = await self.repo.get_image_by_id(req.images_id, current_user.id)
        if not img_obj:
            raise HTTPException(status_code=404, detail="系统未查询到相关文件记录。")
        # 检查当前目录下是否存在同名文件
        is_duplicate = await self.repo.check_same_name_in_dir(
            current_user.id, img_obj.dir_id, req.name
        )
        if is_duplicate:
            raise HTTPException(
                status_code=400,
                detail=f"当前目录下已存在名为 '{req.name}' 的文件，无法重命名到同名文件。",
            )
        img_obj.name = req.name
        await self.db.commit()

    async def delete_image(self, img_id: int, current_user: SysUserEntity):
        # 仅软删除虚拟映射，保留 sys_file 供他处使用，或依业务决定物理删除
        await self.repo.delete_image(img_id)

    async def move_image(self, req: MoveImageReq, current_user: SysUserEntity):
        img_obj = await self.repo.get_image_by_id(req.images_id, current_user.id)
        if not img_obj:
            raise HTTPException(status_code=404, detail="系统未查询到相关文件记录。")
        # 检查目标目录下是否存在同名文件
        is_duplicate = await self.repo.check_same_name_in_dir(
            current_user.id, req.dir_id, img_obj.name
        )
        if is_duplicate:
            raise HTTPException(
                status_code=400,
                detail=f"目标目录下已存在名为 '{img_obj.name}' 的文件，无法移动到同名文件。",
            )
        img_obj.dir_id = req.dir_id
        await self.db.commit()

    async def get_breadcrumbs(
        self, dir_id: int, current_user: SysUserEntity
    ) -> List[dict]:
        all_dirs = await self.repo.get_all_dirs_by_user(current_user.id)
        dir_dict = {d.id: d for d in all_dirs}

        breadcrumbs = []
        curr_id = dir_id
        while curr_id in dir_dict:
            curr_node = dir_dict[curr_id]
            breadcrumbs.append({"id": curr_node.id, "name": curr_node.name})
            curr_id = curr_node.parent_id

        return breadcrumbs  # Vue 前端已经做了 .reverse()

    async def get_tree_structure(
        self, current_user: SysUserEntity
    ) -> List[DirectoryItemRes]:
        all_dirs = await self.repo.get_all_dirs_by_user(current_user.id)

        node_map = {}
        roots = []

        for d in all_dirs:
            node_map[d.id] = DirectoryItemRes(
                id=d.id,
                name=d.name,
                type="folder",
                date=d.create_time.strftime("%Y-%m-%d"),
                children=[],
            )

        for d in all_dirs:
            node = node_map[d.id]
            if d.parent_id is None:
                roots.append(node)
            else:
                if d.parent_id in node_map:
                    node_map[d.parent_id].children.append(node)

        return roots

    async def get_directory_content(
        self,
        dir_id: Optional[int],
        search_name: Optional[str],
        page_params: PageParams,
        current_user: SysUserEntity,
    ) -> PagedData[DirectoryItemRes]:
        offset = (page_params.page - 1) * page_params.size
        rows, total = await self.repo.get_paginated_content(
            user_id=current_user.id,
            dir_id=dir_id,
            search_name=search_name,
            offset=offset,
            limit=page_params.size,
        )

        items = [DirectoryItemRes.from_union_row(row) for row in rows]
        total_pages = math.ceil(total / page_params.size) if total > 0 else 0

        return PagedData(
            data=items,
            pagination={
                "page": page_params.page,
                "pageSize": page_params.size,
                "total": total,
                "totalPages": total_pages,
            },
        )


def image_management_service(
    db: AsyncSession = Depends(get_db), file_svc: FileService = Depends(file_service)
) -> ImageManagementService:
    return ImageManagementService(db, file_svc)
