# BananaFlowAdmin

现代 Vue3 + TS 后台管理系统模板，UI 高度可定制化，支持动态路由与权限控制

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vue](https://img.shields.io/badge/Vue-3.3.8-brightgreen)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)

## ✨ 核心特性

- **高度可拔插 UI** - 基于无头组件设计，可替换任意 UI 库
- **动态路由系统** - 自动识别路由结构，无缝对接权限系统
- **多主题引擎** - 支持动态主题切换 + CSS 变量注入
- **智能权限控制** - 路由级 + 组件级访问控制
- **现代工具链** - Unocss + ESM + TypeScript 优化开发体验
- **全平台响应式** - 完美适配 PC/平板/移动端

## 🖥 预览演示

> 截图文件在docs目录下

<table>
  <tr>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/login.png?raw=true" /></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-1.png?raw=true" /></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-2.png?raw=true" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-3.png?raw=true" /></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-4.png?raw=true" /></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-5.png?raw=true" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/mobile-1.png?raw=true" /></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/mobile-2.png?raw=true" /></td>
  </tr>
</table>


## 🧩 项目结构

```sh
src
├── # 核心代码目录
│   ├── api                   # 后端API交互：包含请求处理、响应处理等
│   │   ├── index.ts           # 全局API入口
│   │   └── example            # 示例模块
│   │        ├── api.ts        # 示例API函数
│   │        ├── index.ts      # 示例模块入口
│   │        └── type.ts       # 示例模块的类型定义
│   ├── assets                # 静态资源：图片、字体、样式等
│   ├── class                 # 自定义类和模型类
│   ├── components            # 可复用的UI组件
│   ├── constants             # 常量定义
│   ├── layout                # 页面布局组件：如头部、底部、侧边栏等
│   ├── maps                  # 数据映射相关的代码和资源
│   ├── plugins               # 自定义插件或第三方库集成
│   ├── router                # 路由配置和路由组件
│   ├── store                 # 状态管理（如Vuex或Pinia）
│   ├── styles                # 全局样式和主题
│   ├── utils                 # 工具函数和辅助类
│   ├── views                 # 视图组件：对应不同页面
│
├── # 配置文件
│   ├── settings.ts           # 项目配置文件（可覆盖默认配置）
│   └── settings.default.ts   # 项目的默认配置文件

```

## 🚀 快速开始

1. 克隆项目
```sh
git clone https://github.com/fffmoon/banana-flow-admin.git
```

2. 安装依赖
```sh
pnpm install
```

3. 启动开发服务器
```sh
pnpm dev
```

4. 构建生产版本
```sh
pnpm build
```

## 🔌 动态路由系统

  动态路由的结构和配置

   ```typescript
    // 路由id
    id: string
    // 路由标题
    title: string
    // 路由组件路径
    componentPath: string
    // 路由路径为#时，仅作为菜单按钮显示，不加入到路由中
    path: string
    // 路由图标
    icon?: string
    // 路由重定向
    redirect?: string
    // 子路由
    children?: IRouteDataRaw[]
    // 是否缓存
    keepAlive?: boolean
    // 是否需要权限
    auth?: string[]
    // 是否常驻标签页 false
    permanent?: boolean
    // 权限池，对路由本身无实际作用，通常用于角色管理模块
    auths?: { name: string, value: string }[]
    // 是否在导航中展示，当子导航里没有可展示的导航时，会直接显示父导航
    hideInMenu?: boolean
    // 是否在面包屑导航中展示
    hideBreadcrumb?: boolean
    // 外部网页链接，会在浏览器新窗口访问该链接
    link?: string
    // 是否需要登录才能访问，和auth有一定重叠
    isLogin?: false
    // 指定高亮的导航，需要设置完整路由地址，通常与 meta.menu: false 一起使用，
    activeMenu?: string
    // 单级路由，只在一级路由时生效，等同于在二级路由的 hideInMenu: true
    singleMenu?: boolean

   ```


## UI 无头组件架构

  - 主题与组件解耦
  - 支持任意 CSS 框架
  - 即插即换 UI 库
  - 无障碍访问支持


## vscode 设置与插件

### vscode 设置

> 将该配置添加到项目的 .vscode/settings.json 文件中

```json
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
      "severity": "error",  // 强制报错
      "fixable": true       // 允许自动修复
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
  "vue-i18n.i18nPaths": "i18n,locales",
}

```

### vscode 插件

> 必须的插件

- headwind

- i18n Ally

- Prettier - Code formatter

- Unocss


## 高级特性

  - ​请求缓存​​ - GET 请求自动缓存
  - ​​持久化状态​​ - Pinia 状态持久化
  - ​​​i18n 国际化​​ - 多语言支持
  - ​​​更新提示​​ - PWA 更新检测
  - ​​​指令权限​​ - v-perm 权限指令
  - ​​​组件级缓存​​ - 智能路由缓存系统

## 🧪 技术栈

### ​​核心框架​​
  Vue 3.3 + TypeScript 5.0 + Pinia

### ​​样式引擎​​
Unocss + SCSS + CSS 变量注入

### ​​UI 方案​​
无头组件 + Reka UI

### ​​工具链​​
Vite 5.0 + ESLint + commitlint