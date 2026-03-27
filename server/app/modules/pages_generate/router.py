# app/modules/pages_generate/router.py
from typing import Any
from app.common.schemas.response import APIResponse
from app.modules.pages_generate.service import (
    PageConfigService,
    page_config_service,
)
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db
from .model_loader import get_model_by_tablename
from .crud_service import GenericCrudService
from app.common.schemas.pages import PageParams, PagedData

router = APIRouter(prefix="/api/v1", tags=["自动生成页面"])


@router.get("/pages/config/{page_id}", response_model=APIResponse[Any])
async def get_page_config(
    page_id: str, page_service: PageConfigService = Depends(page_config_service)
):
    config_json = await page_service.get_config(page_id)
    return APIResponse(data=config_json)


async def get_generic_service(table_name: str, db: AsyncSession = Depends(get_db)):
    model = get_model_by_tablename(table_name)
    if not model:
        raise HTTPException(status_code=404, detail=f"数据模型 {table_name} 不存在")
    return GenericCrudService(model, db)


@router.get("/auto/{table_name}", response_model=APIResponse[Any])
async def auto_list(
    request: Request,
    page_params: PageParams = Depends(),
    service: GenericCrudService = Depends(get_generic_service),
):
    data = await service.get_list(request, page_params)
    return APIResponse(data=data)


@router.delete("/auto/{table_name}/{id}")
async def auto_delete(
    id: str, service: GenericCrudService = Depends(get_generic_service)
):
    await service.delete_item(id)
    return APIResponse(title="删除成功")
