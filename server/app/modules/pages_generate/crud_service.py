from typing import Type, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from fastapi import HTTPException, Request
from app.utils.query_builder import apply_dynamic_filters
from app.utils.pagination import paginate
from app.common.schemas.pages import PageParams, PagedData
from fastapi.encoders import jsonable_encoder


class GenericCrudService:
    def __init__(self, model: Type[Any], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_list(self, request: Request, page_params: PageParams) -> dict:
        # 构造基础查询
        stmt = select(self.model)

        # 清洗查询参数
        raw_params = dict(request.query_params)
        clean_params = {}
        for k, v in raw_params.items():
            if k in ["page", "size"]:
                continue
            if v is not None and str(v).strip() != "":
                clean_params[k] = v

        # 应用过滤
        stmt = apply_dynamic_filters(stmt, self.model, clean_params, exclude_keys=[])

        # 排序
        sort_col = getattr(self.model, "record_time", getattr(self.model, "id", None))
        if sort_col is not None:
            stmt = stmt.order_by(sort_col.desc())

        # 执行分页
        paged_result = await paginate(self.db, stmt, page_params)

        # 提取数据
        raw_items = getattr(paged_result, "data", [])
        pagination_info = getattr(paged_result, "pagination", None)
        final_total = getattr(pagination_info, "total", 0) if pagination_info else 0

        # 序列化数据
        serializable_items = [jsonable_encoder(item) for item in raw_items]

        # 返回给前端
        return {
            "items": serializable_items,
            "total": final_total,
            "page": page_params.page,
            "size": page_params.size,
        }

    async def delete_item(self, item_id: Any):
        # 兼容数字 ID 或 字符串 ID (device_id)
        # 先尝试按主键 id 查
        stmt = select(self.model).where(self.model.id == item_id)
        result = await self.db.execute(stmt)
        item = result.scalar_one_or_none()

        if not item:
            raise HTTPException(status_code=404, detail=f"未找到记录: {item_id}")

        await self.db.delete(item)
        await self.db.commit()
        return True
