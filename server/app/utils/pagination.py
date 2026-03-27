# app/utils/pagination.py
import math
from typing import TypeVar
from sqlalchemy.orm import Query as SqlQuery
from app.common.schemas.pages import PageParams, PagedData, PaginationMeta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


async def paginate(db: AsyncSession, stmt, params: PageParams) -> PagedData:
    """
    SQLAlchemy 2.0 异步分页工具
    """
    # 计算总数
    count_stmt = select(func.count()).select_from(stmt.subquery())
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0

    # 分页查询
    page_stmt = stmt.offset((params.page - 1) * params.size).limit(params.size)
    result = await db.execute(page_stmt)
    items = result.scalars().all()

    total_pages = (total + params.size - 1) // params.size if params.size > 0 else 0

    return PagedData(
        data=items,
        pagination=PaginationMeta(
            total=total,
            page=params.page,
            page_size=params.size,
            total_pages=total_pages,
        ),
    )


def paginate_list(data_list: list, params: PageParams) -> PagedData:
    """
    针对已存在列表（如树形结构、缓存数据）的内存分页工具
    """
    total = len(data_list)
    start = (params.page - 1) * params.size
    end = start + params.size

    items = data_list[start:end]
    total_pages = math.ceil(total / params.size) if params.size > 0 else 0

    return PagedData(
        data=items,
        pagination=PaginationMeta(
            total=total, page=params.page, pageSize=params.size, totalPages=total_pages
        ),
    )
