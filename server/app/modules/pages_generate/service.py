import xmltodict
from typing import List, Any, Dict
from fastapi import HTTPException, Depends
from app.core.deps import get_db
from app.modules.pages_generate.models import PagesGenerateEntity
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.permissions.models import PermissionsEntity


class PageConfigService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_config(self, page_id: str) -> Dict:
        """获取页面 DSL 配置 (异步)"""
        stmt = select(PagesGenerateEntity).where(
            PagesGenerateEntity.page_key == page_id
        )
        result = await self.db.execute(stmt)
        config = result.scalar_one_or_none()

        if not config:
            raise HTTPException(status_code=404, detail="Page config not found")
        return config.config_json

    def _ensure_list(self, data: Any) -> List[Any]:
        if data is None:
            return []
        if isinstance(data, list):
            return data
        return [data]

    async def import_page_config(self, content: bytes):
        """
        解析 PagesGenerate XML 并存入 sys_page_config 表
        """

        doc = xmltodict.parse(content, process_namespaces=False)
        root_key = list(doc.keys())[0]
        root_data = doc[root_key]
        info_node = root_data.get("PagesGenerate")

        if not info_node:
            raise ValueError("Invalid XML: Root must be PagesGenerate")

        page_id = info_node.get("@id")
        title = info_node.get("@title")
        path_url = info_node.get("@path")
        component_path_url = info_node.get("@componentPath")

        # 3. 构建 DSL - Search Region
        search_region = info_node.get("SearchRegion", {})
        search_fields = []

        # 处理 xmltodict 单个子节点是 dict，多个是 list 的坑
        raw_fields = search_region.get("Field", [])
        if isinstance(raw_fields, dict):
            raw_fields = [raw_fields]

        for f in raw_fields:
            field_config = {
                "key": f.get("@key"),
                "label": f.get("@label"),
                "type": f.get("@type"),  # Input, Select, DatePicker
                "defaultValue": f.get("@defaultValue", None),
                "placeholder": f.get("@placeholder", ""),
            }
            # 处理 Select 的 Options
            if "Option" in f:
                raw_opts = f["Option"]
                if isinstance(raw_opts, dict):
                    raw_opts = [raw_opts]
                field_config["options"] = [
                    {"label": opt.get("@label"), "value": opt.get("@value")}
                    for opt in raw_opts
                ]
            search_fields.append(field_config)

        # 4. 构建 DSL - Table Region
        table_region = info_node.get("TableRegion", {})

        # 列定义
        raw_cols = table_region.get("Column", [])
        if isinstance(raw_cols, dict):
            raw_cols = [raw_cols]
        columns = []
        for c in raw_cols:
            columns.append(
                {
                    "key": c.get("@key"),
                    "title": c.get("@title"),
                    "width": c.get("@width"),
                    "renderType": c.get("@renderType", "text"),  # text, tag, time
                    "sortable": c.get("@sortable") == "true",
                }
            )

        # 行操作
        raw_actions = table_region.get("RowAction", [])
        if isinstance(raw_actions, dict):
            raw_actions = [raw_actions]
        row_actions = []
        for a in raw_actions:
            row_actions.append(
                {
                    "label": a.get("@label"),
                    "type": a.get("@type", "default"),  # primary, info, error
                    "event": a.get("@event"),  # 前端事件名
                    "api": a.get("@api"),  # 后端API
                    "method": a.get("@method", "GET"),
                    "needConfirm": a.get("@needConfirm") == "true",
                    "confirmText": a.get("@confirmText"),
                }
            )

        dsl_json = {
            "pageId": page_id,
            "title": title,
            "search": {"fields": search_fields},
            "table": {
                "apiUrl": table_region.get("@api"),
                "columns": columns,
                "rowActions": row_actions,
            },
        }

        # 5. 存入数据库 (Upsert 异步)
        stmt = select(PagesGenerateEntity).where(
            PagesGenerateEntity.page_key == page_id
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            existing.title = title
            existing.config_json = dsl_json
        else:
            new_config = PagesGenerateEntity(
                page_key=page_id, title=title, config_json=dsl_json
            )
            self.db.add(new_config)

        if path_url:
            parent_code = "system:auto:root"
            stmt_parent = select(PermissionsEntity).where(
                PermissionsEntity.code == parent_code
            )
            res_parent = await self.db.execute(stmt_parent)
            parent_obj = res_parent.scalar_one_or_none()

            if not parent_obj:
                parent_obj = PermissionsEntity(
                    title="低代码页",
                    type=1,
                    code=parent_code,
                    path="/auto-generated",
                    component_path="",
                    name="AutoGeneratedRoot",
                    parent_id=0,
                    icon="",
                    sort=900,
                    is_custom_name=False,
                    keep_alive=True,
                    hide_in_menu=False,
                )
                self.db.add(parent_obj)
                await self.db.flush()
                await self.db.refresh(parent_obj)
                print("Created root menu: 自动生成的路由")

            target_component_path = component_path_url if component_path_url else ""
            perm_code = f"auto:view:{page_id}"
            route_name = f"Auto_{page_id}"

            stmt_perm = select(PermissionsEntity).where(
                PermissionsEntity.code == perm_code
            )
            res_perm = await self.db.execute(stmt_perm)
            existing_perm = res_perm.scalar_one_or_none()

            # 准备路由参数
            perm_data = {
                "title": title,
                "type": 1,  # 1-菜单
                "code": perm_code,
                "path": path_url,
                "component_path": target_component_path,
                "name": route_name,
                "parent_id": parent_obj.id,
                "icon": "",
                "is_custom_name": False,
                "keep_alive": True,
                "hide_in_menu": False,
                "sort": 100,
                "query": {"id": page_id},
            }

            if existing_perm:
                # 更新路由信息
                existing_perm.title = title
                existing_perm.path = path_url
                existing_perm.component_path = target_component_path
                existing_perm.query = {"id": page_id}
                existing_perm.parent_id = parent_obj.id
            else:
                # 创建新路由
                new_perm = PermissionsEntity(**perm_data)
                self.db.add(new_perm)

            print(
                f"Route permission [{perm_code}] synced under parent [{parent_obj.id}]."
            )

        await self.db.commit()
        print(f"Page Config [{page_id}] imported successfully.")


def page_config_service(db: AsyncSession = Depends(get_db)) -> PageConfigService:
    return PageConfigService(db)
