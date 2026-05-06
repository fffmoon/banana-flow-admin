# BananaFlowAdmin

现代 Vue3 + TS 后台管理系统模板，UI 高度可定制化，支持动态路由与权限控制

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vue](https://img.shields.io/badge/Vue-3.3.8-brightgreen)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)

## 🖥 预览演示

**在线演示地址：[https://admin.dashixiong.site](https://admin.dashixiong.site)**

## ✨ 核心特性

本项目致力于提供极致的开发体验与高度可定制化的后台解决方案：

- **🎨 灵活的 UI 与主题**：支持多种导航栏模式切换、动态主题切换、CSS 变量注入，完美适配 PC/平板/移动端。
- **🔐 强大的路由与权限**：自动识别路由结构，支持路由级/组件级访问控制、`v-perm` 指令权限，智能组件缓存。
- **⚡️ 极致的性能与体验**：基于 Vite 5 构建，支持 GET 请求自动缓存、Pinia 状态持久化、PWA 更新检测。
- **🌍 国际化与现代化生态**：内置 i18n 多语言支持，采用 UnoCSS + ESM + TypeScript 现代工具链。

## 🛠 技术栈

- **核心框架**：Vue 3.3 + TypeScript 5.0 + Vite 5.0
- **状态管理**：Pinia (支持持久化)
- **UI 组件库**：Naive-UI
- **样式引擎**：UnoCSS + SCSS + CSS 变量注入
- **代码规范**：ESLint + Prettier + Stylelint + Commitlint

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/fffmoon/banana-flow-admin.git

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 📂 项目结构

```text
src
├── api          # 后端 API 交互（请求处理、响应处理等）
├── assets       # 静态资源（图片、字体、样式等）
├── components   # 全局可复用 UI 组件
├── layout       # 页面布局组件（头部、侧边栏、底部等）
├── router       # 路由配置与动态路由拦截
├── store        # Pinia 状态管理
├── styles       # 全局样式与主题配置
├── utils        # 工具函数和辅助类
└── views        # 核心视图组件
```

## ⚙️ 高级配置 (展开查看)

<details>
<summary><b>1. 动态路由配置类型说明 (IRouteDataRaw)</b></summary><br>

在配置动态路由时，支持极其丰富的字段定义，无缝对接权限系统：

```typescript
export interface IRouteDataRaw {
  id: string                  // 路由ID
  parentId?: string | null    // 父路由ID
  title: string               // 菜单标题
  name: string                // 路由名称
  componentPath: string       // 路由组件路径
  path: string                // 路由路径 (为#时仅作为按钮显示)
  code?: string               // 权限标识
  type?: 1 | 2                // 类型: 1-菜单 2-按钮/接口
  sort?: number               // 路由排序
  icon?: string               // 路由图标
  redirect?: string | object  // 路由重定向
  children?: IRouteDataRaw[]  // 子路由
  keepAlive?: boolean         // 是否缓存组件
  auth?: string[]             // 访问所需权限
  permanent?: boolean         // 是否常驻标签页
  hideInMenu?: boolean        // 是否在左侧菜单中隐藏
  hideBreadcrumb?: boolean    // 是否在面包屑中隐藏
  link?: string               // 外部网页链接 (新窗口打开)
  isLogin?: boolean           // 是否需要登录验证
  activeMenu?: string         // 指定高亮的导航路径
  singleMenu?: boolean        // 单级路由标识
  constant?: boolean          // 是否为固定路由
  query?: Record<string, string> // 默认查询参数
}
```
</details>

<details>
<summary><b>2. 推荐的 VS Code 环境配置</b></summary><br>

**必须安装的 VS Code 插件：**
- `Headwind` (Tailwind/UnoCSS 排序)
- `i18n Ally` (国际化辅助)
- `Prettier - Code formatter`
- `UnoCSS`

**推荐的 `.vscode/settings.json` 配置：**

```json
{
  // https://github.com/antfu/eslint-config
  // 禁用默认格式化器，使用eslint代替
  "prettier.enable": false,
  "editor.formatOnSave": false,
  // 自动修复
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never",
    "source.fixAll.stylelint": "explicit"
  },
  // Silent the stylistic rules in you IDE, but still auto fix them
  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off", "fixable": true },
    { "rule": "format/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true },
    {
      "rule": "vue/component-name-in-template-casing",
      "severity": "error", // 强制报错
      "fixable": true // 允许自动修复
    }
  ],
  // stylelint
  "stylelint.validate": ["css", "scss", "vue"],
  "stylelint.snippet": ["css", "scss", "vue-html"],
  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml",
    "xml",
    "gql",
    "graphql",
    "astro",
    "css",
    "less",
    "scss",
    "pcss",
    "postcss"
  ],
  // i18n-ally
  "vue-i18n.i18nPaths": ["locales"],
  "i18n-ally.localesPaths": [
    "locales"
  ],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.sourceLanguage": "zh-CN",
  "i18n-ally.displayLanguage": "zh-CN",
  "i18n-ally.extract.autoDetect": true
}

```
</details>

## 🗺 后续 Roadmap

- [ ] 主题与组件解耦
- [ ] 支持任意 CSS 框架接入
- [ ] 即插即换 UI 库架构
- [ ] 提升无障碍访问 (A11y) 支持
- [ ] 引入无头组件 (Headless UI) + Reka UI
