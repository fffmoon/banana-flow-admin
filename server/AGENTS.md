# AGENTS.md

本文件用于指导 Codex 在 `server/` 目录下工作。目标是减少每次读取无关文件的 token 消耗，并让 Codex 更准确地遵循本项目的后端架构。

## 项目概览

- 技术栈：FastAPI、Python 3.10+、Pydantic 2、SQLAlchemy 2.0 async、aiomysql、Redis、Alembic、loguru。
- 应用目录：`app/`。
- 业务模块目录：`app/modules/{module_name}/`。
- 公共能力目录：`app/core/`、`app/common/`、`app/utils/`。
- API 前缀通常为 `/api/v1`。

## 优先阅读

为节省上下文，优先阅读和当前任务直接相关的模块，以及必要的公共文件：

- 模块示例：`app/modules/users/`、`app/modules/roles/`、`app/modules/permissions/`。
- 路由注册：`app/core/routers.py`。
- 数据库连接、基类和 Mixin：`app/core/database.py`。
- 认证与权限依赖：`app/core/deps.py`。
- 统一响应：`app/common/schemas/response.py`。
- 分页：`app/common/schemas/pages.py`、`app/utils/pagination.py`。
- Redis：`app/core/redis_client.py`。
- i18n 文案：`app/locales/`。

除非任务确实跨多个领域，不要一次性扫描整个 `app/modules`。

## 架构规则

新模块必须放在 `app/modules/{module_name}/`，并遵循垂直切片分层：

- `models.py`：只放 SQLAlchemy ORM 实体。
- `schemas.py`：只放 Pydantic 请求模型和响应模型。
- `repository.py`：只放数据库 CRUD 和查询构造。
- `service.py`：业务逻辑、权限/数据范围校验、响应模型组装、业务异常。
- `router.py`：接收请求、依赖注入、参数校验、调用 Service、统一返回响应。

分层边界：

- Router 只能调用 Service，不要写业务逻辑或数据库操作。
- Service 调用 Repository。能放进 Repository 的 SQL/ORM 查询，不要直接写在 Service。
- Repository 负责 `select()`、`insert()`、`update()`、`delete()` 等数据库操作，返回 ORM 对象或 SQLAlchemy statement。
- Schema 负责复杂响应组装。如果一个响应需要由多个 ORM 对象或字典组合，不要在 Service 手动拼大字典，应在响应 Schema 上添加 `classmethod` 工厂方法。

## 数据库与 ORM

- 只使用 SQLAlchemy 2.0 异步写法，禁止使用 `session.query()`。
- 数据库 IO 必须使用 `async/await`，例如 `await session.execute(stmt)`、`await session.commit()`、`await session.refresh(obj)`。
- 异步环境读取关联关系时，必须用 `selectinload()` 或 `joinedload()` 显式预加载，不要依赖懒加载。
- `app/core/database.py` 中通过 `SoftDeleteMixin` 配置了软删除全局过滤。写原生 SQL 或特殊 execution options 时要特别注意不要绕过过滤。
- 新 Model 按需继承现有基类和 Mixin，例如 `Base`、`SoftDeleteMixin`、`AuditMixin`。
- Python 代码和数据库字段使用 `snake_case`。

## Schema 与 API 规范

- 前端 JSON 使用 `camelCase`；后端响应模型应继承 `CamelCaseModel` 自动生成驼峰别名。
- 响应模型必须继承 `app.common.schemas.response.CamelCaseModel`。
- 接口返回必须使用 `app.common.schemas.response.APIResponse` 包裹。
- 分页列表响应必须使用 `app.common.schemas.pages.PagedData[T]`。
- 列表接口参数中应注入 `page_params: PageParams = Depends()`。
- 优先使用 Pydantic 2 写法，例如 `model_dump(exclude_unset=True)`。

统一响应示例：

```python
return APIResponse(data=result, title="操作成功")
```

## 认证、权限与安全

- 受保护路由必须通过 `app.core.deps` 中的 `get_current_active_user` 或 `PermissionChecker("module:action")` 获取当前用户并校验权限。
- 权限字符串使用现有风格，例如 `system:users:list`。
- Service 层必须处理数据范围和越权问题，尤其是用户、角色、组织、归属数据等敏感操作。
- 业务错误使用 `fastapi.HTTPException` 抛出，并提供清晰中文或 i18n 文案。
- 重要写操作或捕获异常时，使用 `from loguru import logger` 记录日志。
- Redis 操作必须异步，使用 `app.core.redis_client` 中的 `redis_manager`。

## 新功能开发流程

创建新的后端功能时，按以下顺序实现：

1. 在 `models.py` 定义 ORM 实体，并继承合适的 Mixin。
2. 在 `schemas.py` 定义请求模型和继承 `CamelCaseModel` 的响应模型。
3. 在 `repository.py` 编写异步 CRUD 和查询方法。
4. 在 `service.py` 编写业务逻辑、参数校验、数据范围校验、Schema 工厂方法调用。
5. 在 `router.py` 定义端点，添加认证/权限依赖，并统一返回 `APIResponse`。
6. 在 `app/core/routers.py` 注册新路由；如果没有注册，需要明确提醒用户。
7. 如果表结构变化，并且任务需要同步数据库，添加或更新 Alembic 迁移。

## 现有能力，禁止重复实现

直接复用以下工具：

- `APIResponse`、`CamelCaseModel`：`app.common.schemas.response`
- `PageParams`、`PagedData`、`PaginationMeta`：`app.common.schemas.pages`
- `AsyncSessionLocal`：`app.core.database`
- `get_db`、`get_current_active_user`、`PermissionChecker`：`app.core.deps`
- `settings`：`app.core.config`
- `redis_manager`：`app.core.redis_client`
- `paginate`：`app.utils.pagination`
- `log_operation`：`app.modules.operation_log.deps`
- `i18n`：`app.core.i18n`

## 校验方式

优先使用聚焦校验：

- Python 语法检查：`python -m py_compile <files>`。
- 如果存在相关测试，优先运行目标测试。
- 需要更大范围校验时，再使用项目已有 lint 或测试工具。
- 如果因为数据库、Redis、环境变量缺失导致无法运行校验，需要在最终回复中说明。
