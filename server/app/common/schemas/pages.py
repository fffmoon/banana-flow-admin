from typing import Generic, TypeVar, List
from pydantic import BaseModel
from fastapi import Query
from app.common.schemas.response import CamelCaseModel

T = TypeVar("T")


class PageParams:
    """
    通用分页请求参数依赖项
    使用方法: def list_items(page_params: PageParams = Depends()):
    """

    def __init__(
        self,
        page: int = Query(1, ge=1, description="页码，从1开始"),
        size: int = Query(10, ge=1, le=100, description="每页数量"),
    ):
        self.page = page
        self.size = size


class PaginationMeta(CamelCaseModel):  
    """
    分页元数据
    """

    total: int
    page: int
    page_size: int
    total_pages: int


class PagedData(CamelCaseModel, Generic[T]):  
    """
    分页响应结构
    """

    data: List[T]
    pagination: PaginationMeta
