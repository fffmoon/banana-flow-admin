# 🍌 BananaFlowAdmin (蕉速后台管理系统)

现代化的全栈后台管理系统模板。前端基于 Vue3 + TS + NaiveUI，后端基于 FastAPI + SQLAlchemy 2.0。UI 高度可定制化，支持动态路由与智能权限控制，旨在为您的后续开发提供一个坚实、开箱即用的底层框架。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vue](https://img.shields.io/badge/Vue-3.3.8-brightgreen)](https://vuejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)

## ✨ 核心特性

- **🚀 现代技术栈**：Vue 3.3 + FastAPI + SQLAlchemy 2.0，全异步高性能。
- **🔐 智能权限控制**：基于 OAuth2 与 JWT 的无状态认证，前端支持路由级 + 组件级（指令）权限。
- **🎨 多主题引擎**：支持动态主题切换 + CSS 变量注入，多模式导航栏。
- **📦 开箱即用部署**：提供完整的 Docker Compose 部署方案，支持离线环境快速拉起。

## 🖥 预览演示

**在线演示地址：[https://admin.dashixiong.site](https://admin.dashixiong.site)**

<table>
  <tr>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/login.png?raw=true" alt="登录页"/></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-1.png?raw=true" alt="首页1"/></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-2.png?raw=true" alt="首页2"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-3.png?raw=true" alt="首页3"/></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-4.png?raw=true" alt="首页4"/></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/home-page-5.png?raw=true" alt="首页5"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/mobile-1.png?raw=true" alt="移动端1"/></td>
    <td><img src="https://github.com/fffmoon/banana-flow-admin/raw/master/docs/mobile-2.png?raw=true" alt="移动端2"/></td>
  </tr>
</table>

## 📖 文档导航

本项目包含完整的前端、后端及部署运维代码。为方便阅读，各模块的详细说明已拆分至对应目录，请点击以下链接查看：

- 🎨 **[前端开发文档](./web/README.md)** (Vue3, TypeScript, 动态路由, UI 配置)
- ⚙️ **[后端开发文档](./server/README.md)** (FastAPI, SQLAlchemy, 数据库迁移, 接口说明)
- 🚢 **[部署运维手册](./deploy/README.md)** (Docker 离线/在线部署, Nginx, 日志管理)

## 🚀 极速起步

如果你想快速在本地跑起来看效果：

**1. 克隆项目**
```sh
git clone https://github.com/fffmoon/banana-flow-admin.git
cd banana-flow-admin
```

**2. 启动后端** 

*详情见 [后端文档](./server/README.md)*

**3. 启动前端** 

*详情见 [前端文档](./web/README.md)*


## 🧩 项目结构

```sh
BananaFlowAdmin
├── server      # 后端服务 (Python / FastAPI)
├── web         # 前端展示 (Vue3 / TypeScript)
└── deploy      # 部署配置 (Docker / Nginx)
```
