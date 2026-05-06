import os
import sys
import xmltodict
import argparse
from pathlib import Path
from typing import Dict, Any, List

# 项目根目录
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# 模板函数

def python_model_code(table_name: str, fields: List[Dict]) -> str:
    """生成 models.py（通常xml会导入进来应该是已经存在表了，这里先占位）"""
    return f'''from sqlalchemy import Column, Integer, String, Float, DateTime, Text, DECIMAL
from app.core.database import Base


class {to_pascal(table_name)}Entity(Base):
    __tablename__ = "{table_name}"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # 这里要请教袁总，是否需要根据xml字段生成模型
    pass
'''

def python_schema_code(table_name: str, fields: List[Dict]) -> str:
    """生成 schemas.py"""
    # 按字段类型生成 Pydantic 字段
    field_lines = []
    for f in fields:
        key = f["key"]
        ptype = "Optional[str]" if f.get("type") == "Input" else "Optional[str]"
        field_lines.append(f'    {key}: {ptype} = None')
    return f'''from typing import Optional
from app.common.schemas.response import CamelCaseModel


class {to_pascal(table_name)}Base(CamelCaseModel):
{chr(10).join(field_lines)}


class {to_pascal(table_name)}Create({to_pascal(table_name)}Base):
    pass


class {to_pascal(table_name)}Update({to_pascal(table_name)}Base):
    pass


class {to_pascal(table_name)}Response({to_pascal(table_name)}Base):
    id: int
'''

def python_repository_code(table_name: str, fields: List[Dict]) -> str:
    return f'''from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.orm import selectinload
from app.common.schemas.pages import PageParams
from app.utils.pagination import paginate
from app.utils.query_builder import apply_dynamic_filters
# 注意：这里假设模型已存在，请根据实际情况导入正确的模型
# from app.modules.{table_name}.models import {to_pascal(table_name)}Entity
from app.modules.devices.models import DeviceInfoEntity  # 示例：复用现有模型

ModelClass = DeviceInfoEntity   # 请在实际使用时替换为正确的模型


class {to_pascal(table_name)}Repository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_list(self, request_data: dict, page_params: PageParams):
        stmt = select(ModelClass)
        stmt = apply_dynamic_filters(stmt, ModelClass, request_data)
        return await paginate(self.db, stmt, page_params)

    async def get_by_id(self, entity_id: int):
        stmt = select(ModelClass).where(ModelClass.id == entity_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, obj_in: dict) -> ModelClass:
        db_obj = ModelClass(**obj_in)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def update(self, entity_id: int, obj_in: dict) -> ModelClass:
        db_obj = await self.get_by_id(entity_id)
        if not db_obj:
            return None
        for k, v in obj_in.items():
            setattr(db_obj, k, v)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def delete(self, entity_id: int) -> None:
        db_obj = await self.get_by_id(entity_id)
        if db_obj:
            await self.db.delete(db_obj)
            await self.db.commit()
'''

def python_service_code(table_name: str) -> str:
    class_name = f"{to_pascal(table_name)}Service"
    repo_class = f"{to_pascal(table_name)}Repository"
    return f'''from typing import Any
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db
from app.common.schemas.pages import PageParams
from .repository import {repo_class}


class {class_name}:
    def __init__(self, db: AsyncSession):
        self.repo = {repo_class}(db)

    async def get_list(self, query: dict, page_params: PageParams):
        return await self.repo.get_list(query, page_params)

    async def get_detail(self, item_id: int):
        item = await self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="记录不存在")
        return item

    async def create(self, data: dict) -> Any:
        return await self.repo.create(data)

    async def update(self, item_id: int, data: dict) -> Any:
        item = await self.repo.update(item_id, data)
        if not item:
            raise HTTPException(status_code=404, detail="记录不存在")
        return item

    async def delete(self, item_id: int) -> None:
        item = await self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="记录不存在")
        await self.repo.delete(item_id)


def {table_name}_service(db: AsyncSession = Depends(get_db)) -> {class_name}:
    return {class_name}(db)
'''

def python_router_code(table_name: str, api_prefix: str) -> str:
    class_name = f"{to_pascal(table_name)}Service"
    service_dep = f"{table_name}_service"
    pascal = to_pascal(table_name)
    return f'''from fastapi import APIRouter, Depends, Request
from app.common.schemas.response import APIResponse
from app.common.schemas.pages import PageParams, PagedData
from .service import {class_name}, {service_dep}
from .schemas import {pascal}Response, {pascal}Create, {pascal}Update

router = APIRouter(prefix="{api_prefix}", tags=["{pascal}管理"])


@router.get("", response_model=APIResponse[PagedData[{pascal}Response]])
async def list_items(
    request: Request,
    page_params: PageParams = Depends(),
    service: {class_name} = Depends({service_dep}),
):
    query_params = dict(request.query_params)
    data = await service.get_list(query_params, page_params)
    return APIResponse(data=data)


@router.get("/{{item_id}}", response_model=APIResponse[{pascal}Response])
async def get_item(
    item_id: int,
    service: {class_name} = Depends({service_dep}),
):
    item = await service.get_detail(item_id)
    return APIResponse(data=item)


@router.post("", response_model=APIResponse[{pascal}Response])
async def create_item(
    item_in: {pascal}Create,
    service: {class_name} = Depends({service_dep}),
):
    data = item_in.model_dump(by_alias=True)
    new_item = await service.create(data)
    return APIResponse(data=new_item, title="创建成功")


@router.put("/{{item_id}}", response_model=APIResponse[{pascal}Response])
async def update_item(
    item_id: int,
    item_in: {pascal}Update,
    service: {class_name} = Depends({service_dep}),
):
    data = item_in.model_dump(exclude_unset=True, by_alias=True)
    updated = await service.update(item_id, data)
    return APIResponse(data=updated, title="更新成功")


@router.delete("/{{item_id}}", response_model=APIResponse)
async def delete_item(
    item_id: int,
    service: {class_name} = Depends({service_dep}),
):
    await service.delete(item_id)
    return APIResponse(title="删除成功")
'''

def vue_api_code(table_name: str, api_prefix: str) -> str:
    return f"""import request from '@/utils/request'
import type {{
  {to_pascal(table_name)}Response,
  {to_pascal(table_name)}Create,
  {to_pascal(table_name)}Update,
  PagedData
}} from './types'

export const get{to_pascal(table_name)}List = (params: Record<string, any>) =>
  request.get<PagedData<{to_pascal(table_name)}Response>>('{api_prefix}', {{ params }})

export const get{to_pascal(table_name)}Detail = (id: number) =>
  request.get<{to_pascal(table_name)}Response>(`{api_prefix}/${{id}}`)

export const create{to_pascal(table_name)} = (data: {to_pascal(table_name)}Create) =>
  request.post<{to_pascal(table_name)}Response>('{api_prefix}', data)

export const update{to_pascal(table_name)} = (id: number, data: {to_pascal(table_name)}Update) =>
  request.put<{to_pascal(table_name)}Response>(`{api_prefix}/${{id}}`, data)

export const delete{to_pascal(table_name)} = (id: number) =>
  request.delete(`{api_prefix}/${{id}}`)
"""

def vue_types_code(table_name: str, fields: List[Dict]) -> str:
    field_lines = []
    for f in fields:
        field_lines.append(f'  {f["key"]}: string')
    return f"""export interface {to_pascal(table_name)}Response {{
  id: number
{chr(10).join(field_lines)}
  // 补充其他字段
}}

export interface {to_pascal(table_name)}Create {{
{chr(10).join(field_lines)}
}}

export type {to_pascal(table_name)}Update = Partial<{to_pascal(table_name)}Create>

export interface PagedData<T> {{
  data: T[]
  pagination: {{
    total: number
    page: number
    pageSize: number
    totalPages: number
  }}
}}
"""

def vue_page_code(page_config: Dict, table_name: str) -> str:
    """生成 search-table 页面组件"""
    table_api = page_config["table"]["apiUrl"]
    search_fields = page_config["search"]["fields"]
    columns = page_config["table"]["columns"]
    pascal_name = to_pascal(table_name)

    return f"""<script setup lang="ts">
import {{ ref, reactive, onMounted }} from 'vue'
import {{ get{pascal_name}List, delete{pascal_name} }} from './api'
import {{ ElMessage, ElMessageBox }} from 'element-plus'
import type {{ {pascal_name}Response }} from './types'

const loading = ref(false)
const tableData = ref<{pascal_name}Response[]>([])
const pagination = reactive({{ page: 1, size: 10, total: 0 }})
const searchForm = reactive({{{", ".join([f"{field['key']}: ''" for field in search_fields])}}})

const fetchData = async () => {{
  loading.value = true
  try {{
    const res = await get{pascal_name}List(
      Object.assign({{ page: pagination.page, size: pagination.size }}, searchForm)
    )
    tableData.value = res.data.data
    pagination.total = res.data.pagination.total
  }} finally {{
    loading.value = false
  }}
}}

const handleSearch = () => {{
  pagination.page = 1
  fetchData()
}}

const handleReset = () => {{
  Object.assign(searchForm, {{{", ".join([f"{field['key']}: ''" for field in search_fields])}}})
  searchForm.status = ''  // select 默认值
  fetchData()
}}

const handleDelete = (row: {pascal_name}Response) => {{
  ElMessageBox.confirm('确定删除该记录吗？', '警告', {{
    type: 'warning'
  }}).then(async () => {{
    await delete{pascal_name}(row.id)
    ElMessage.success('删除成功')
    fetchData()
  }})
}}

onMounted(() => {{
  fetchData()
}})
</script>

<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        {chr(10).join([generate_search_item(f) for f in search_fields])}
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border>
        {chr(10).join([f'<el-table-column prop="{col["key"]}" label="{col["title"]}" width="{col["width"] or ""}" />' for col in columns])}
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{{ row }}">
            {chr(10).join([generate_action_button(action) for action in page_config['table']['rowActions']])}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @change="fetchData"
      />
    </el-card>
  </div>
</template>

<style scoped>
.page-container {{
  padding: 16px;
}}
.search-card {{
  margin-bottom: 16px;
}}
</style>
"""

def generate_search_item(field: Dict) -> str:
    if field["type"] == "Input":
        return f'<el-form-item label="{field["label"]}"><el-input v-model="searchForm.{field["key"]}" placeholder="{field.get("placeholder", "")}" clearable /></el-form-item>'
    if field["type"] == "Select":
        # 修复 f-string 不能包含反斜杠的问题
        options = chr(10).join([f'<el-option label="{opt["label"]}" value="{opt["value"]}" />' for opt in field.get("options", [])])
        return f'<el-form-item label="{field["label"]}"><el-select v-model="searchForm.{field["key"]}" clearable>{options}</el-select></el-form-item>'
    return ""

def generate_action_button(action: Dict) -> str:
    if action.get("event") == "viewDetail":
        return '<el-button type="info" size="small" @click="handleView(row)">详情</el-button>'
    if action.get("needConfirm"):
        return f'<el-button type="{action.get("type", "danger")}" size="small" @click="handleDelete(row)">{action["label"]}</el-button>'
    return ""

def to_pascal(snake: str) -> str:
    return snake.replace("_", " ").title().replace(" ", "")

def to_camel(snake: str) -> str:
    parts = snake.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])

def table_name_from_xml(xml_data: Dict) -> str:
    """/api/v1/auto/device_info -> device_info"""
    api = xml_data["table"]["apiUrl"]
    return api.rstrip("/").split("/")[-1]

def parse_xml(file_path: str) -> Dict:
    with open(file_path, "rb") as f:
        doc = xmltodict.parse(f, process_namespaces=False)
    root = doc[next(iter(doc))]
    page = root["PagesGenerate"]

    # 搜索字段
    search = page.get("SearchRegion", {})
    raw_fields = search.get("Field", [])
    if not isinstance(raw_fields, list):
        raw_fields = [raw_fields]
    search_fields = []
    for f in raw_fields:
        field = {
            "key": f["@key"],
            "label": f["@label"],
            "type": f["@type"],
            "defaultValue": f.get("@defaultValue"),
            "placeholder": f.get("@placeholder", ""),
        }
        if "Option" in f:
            opts = f["Option"] if isinstance(f["Option"], list) else [f["Option"]]
            field["options"] = [{"label": o["@label"], "value": o["@value"]} for o in opts]
        search_fields.append(field)

    # 表格
    table = page.get("TableRegion", {})
    raw_cols = table.get("Column", [])
    if not isinstance(raw_cols, list):
        raw_cols = [raw_cols]
    columns = []
    for c in raw_cols:
        columns.append({
            "key": c["@key"],
            "title": c["@title"],
            "width": c.get("@width"),
            "renderType": c.get("@renderType", "text"),
            "sortable": c.get("@sortable") == "true"
        })

    raw_actions = table.get("RowAction", [])
    if not isinstance(raw_actions, list):
        raw_actions = [raw_actions]
    actions = []
    for a in raw_actions:
        actions.append({
            "label": a["@label"],
            "type": a.get("@type", "default"),
            "event": a.get("@event"),
            "api": a.get("@api"),
            "method": a.get("@method", "GET"),
            "needConfirm": a.get("@needConfirm") == "true",
            "confirmText": a.get("@confirmText", "")
        })

    return {
        "pageId": page["@id"],
        "title": page["@title"],
        "path": page["@path"],
        "componentPath": page.get("@componentPath", ""),
        "search": {"fields": search_fields},
        "table": {
            "apiUrl": table.get("@api", ""),
            "columns": columns,
            "rowActions": actions
        }
    }

def generate_backend(config: Dict, output_dir: Path):
    table_name = table_name_from_xml(config)
    module_dir = output_dir / f"auto_{table_name}"
    module_dir.mkdir(parents=True, exist_ok=True)

    fields = config["table"]["columns"]
    # __init__.py
    (module_dir / "__init__.py").touch()

    # models.py (可选择不生成，若已有模型则跳过)
    # with open(module_dir / "models.py", "w", encoding="utf-8") as f:
    #     f.write(python_model_code(table_name, fields))

    # schemas.py
    with open(module_dir / "schemas.py", "w", encoding="utf-8") as f:
        f.write(python_schema_code(table_name, fields))

    # repository.py
    with open(module_dir / "repository.py", "w", encoding="utf-8") as f:
        f.write(python_repository_code(table_name, fields))

    # service.py
    with open(module_dir / "service.py", "w", encoding="utf-8") as f:
        f.write(python_service_code(table_name))

    # router.py
    api_prefix = config["table"]["apiUrl"]  # 如 /api/v1/auto/device_info
    with open(module_dir / "router.py", "w", encoding="utf-8") as f:
        f.write(python_router_code(table_name, api_prefix))

    print(f"后端模块已生成: {module_dir}")
    print("请将以下路由注册代码添加到 app/core/routers.py:")
    print(f'from app.modules.auto_{table_name}.router import router as auto_{table_name}_router')
    print(f'app.include_router(auto_{table_name}_router)')

def generate_frontend(config: Dict, output_dir: Path):
    table_name = table_name_from_xml(config)
    page_path = config["path"]
    views_dir = output_dir / "src" / "views" / "auto" / page_path
    api_dir = views_dir  # 可放在一起或统一 api 目录

    views_dir.mkdir(parents=True, exist_ok=True)

    # types.ts
    with open(views_dir / "types.ts", "w", encoding="utf-8") as f:
        f.write(vue_types_code(table_name, config["table"]["columns"]))

    # api.ts
    with open(views_dir / "api.ts", "w", encoding="utf-8") as f:
        f.write(vue_api_code(table_name, config["table"]["apiUrl"]))

    # index.vue
    with open(views_dir / "index.vue", "w", encoding="utf-8") as f:
        f.write(vue_page_code(config, table_name))

    print(f"前端页面已生成: {views_dir}")
    print("请将以下路由添加到 Vue 路由配置中:")
    print(f'''
{{
  path: '/{page_path}',
  name: 'Auto{to_pascal(table_name)}',
  component: () => import('@/views/auto/{page_path}/index.vue'),
  meta: {{ title: '{config["title"]}' }}
}}
''')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-f", "--file", required=True, help="XML文件路径")
    args = parser.parse_args()

    xml_path = Path(args.file)
    if not xml_path.exists():
        print(f"文件不存在: {xml_path}")
        return

    config = parse_xml(xml_path)
    print("解析成功，页面信息：", config["title"])

    # 后端输出目录: app/modules/auto_{table}/
    backend_dir = BASE_DIR / "app" / "modules"
    generate_backend(config, backend_dir)

    # 前端输出目录: 项目根/src
    frontend_dir = BASE_DIR
    generate_frontend(config, frontend_dir)

if __name__ == "__main__":
    main()