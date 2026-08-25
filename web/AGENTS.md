# AGENTS.md

本文件用于指导 Codex 在 `web/` 目录下工作。目标是减少每次读取无关文件的 token 消耗，并让 Codex 更准确地遵循本项目的前端约定。

## 项目概览

- 技术栈：Vue 3、TypeScript、Vite、Naive UI、Pinia、SCSS、UnoCSS/Iconify。
- 包管理：`package.json` 声明了 `pnpm`，现有脚本也可以通过 `npm` 执行。
- 源码目录：`src/`。
- 常用路径别名：`@/* -> src/*`，`@apis/* -> src/api/*`，`@stores/* -> src/store/modules/*`。
- 项目使用动态路由。修改导航、菜单、权限路由前，先查看 `src/router/` 和现有路由模块。

## 优先阅读

为节省上下文，先读和任务最相关的少量文件：

- 常见“搜索表单 + 表格”页面风格：`src/views/system/user/index.vue`。
- API 写法：优先查看当前业务模块下的 `js/api.ts`，全局请求封装查看 `src/api/request.ts`。
- Store 写法：`src/store/modules/*.ts`。
- 路由逻辑：`src/router/handleRouters.ts`、`src/router/modules/*.ts`。
- 全局样式和样式变量：`src/styles/`、`uno.config.ts`。

除非任务确实跨多个业务页面，不要一次性扫描整个 `src/views`。

## 前端约定

- 业务页面放在 `src/views/{module_name}/`。
- API 封装和相关 TypeScript 类型默认放在当前业务模块目录下，例如 `src/views/{module_name}/js/api.ts` 或子模块自己的 `js/api.ts`。
- 只有跨多个模块复用的全局 API，才放在 `src/api/` 或 `src/api/modules/` 下。
- Vue 文件优先使用 `<script setup lang="ts">`。
- 项目使用 auto-import 自动导入常用 Vue、Pinia、Naive UI API，以及本项目封装的离散 API，例如 `useMessage()`。除非当前文件已有相同风格或需要类型导入，不要手动导入这些自动导入的 API。
- 图标通常使用 UnoCSS/Iconify class，例如在 Naive UI 的 icon slot 中使用 `i-mdi-plus`。
- 标准后台管理页面遵循现有模式：上方 `NCard` 放搜索表单，下方 `NCard` 放远程 `NDataTable`，包含 `loading`、分页对象、查询/重置逻辑，操作按钮按权限使用 `v-perm` 或 `userStore.hasPerms` 控制。
- 前后端交互 JSON 字段使用 `camelCase`；后端 Python 字段使用 `snake_case`，会通过响应模型自动转为 `camelCase`。
- 不要重复实现全局请求逻辑。业务模块内的 `js/api.ts` 仍然统一使用全局 `request<T>()`。

## 实现要求

- 修改范围尽量贴近当前需求，不做无关重构。
- 新增列表页时，至少考虑加载状态、搜索、重置、分页、空数据/异常兜底、权限控制。
- 新增表单或弹窗时，优先参考现有 Naive UI 表单校验写法；保存成功后通过 `success` 事件通知列表刷新。
- 新增业务类型时，接口入参、响应类型和页面使用处要保持一致。
- 未经明确需要和用户确认，不新增依赖。

## 校验方式

根据改动范围选择最小可用校验：

- 单文件或少量文件 lint：`npx eslint <changed files>`。
- 全量前端 lint：`npm run lint`。
- 构建校验：`npm run build:development`。
- 需要视觉/交互验证时启动开发服务：`npm run dev -- --port 5173`。

如果因为依赖、环境或后端服务缺失导致无法校验，需要在最终回复中说明。
