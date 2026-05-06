# BananaFlowAdmin

基于 FastAPI 构建的现代化、纯异步、垂直分层架构后端服务

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red.svg)](https://www.sqlalchemy.org/)
[![Redis](https://img.shields.io/badge/Redis-Latest-DC382D.svg)](https://redis.io/)


## ✨ 核心特性

本项目采用严谨的现代化 Python 后端架构设计，保证代码的可维护性与高性能：

- **🏗 垂直切片分层**：严格遵循 `Router -> Schema -> Service -> Repository -> Model` 的分层职责，解耦业务逻辑。
- **🚀 纯异步高性能**：拥抱 `asyncio`，基于 **SQLAlchemy 2.0 + `aiomysql`** 提供完全非阻塞的数据库 IO。
- **🔐 无状态安全认证**：采用 OAuth2 Password Bearer 流程，使用 **JWT** 进行权限校验，Token 状态与黑名单依托 **Redis** 管理。
- **🛠 现代工程化构建**：使用 `Alembic` 管理数据迁移，内置 `Ruff` 极速代码检查，原生支持 Docker 容器化部署。


## 🚀 快速开始

1.  **创建 Python 虚拟环境**
    ```bash
        python3 -m venv .venv
        # Windows 激活
        .venv\Scripts\activate 
        # Linux 激活
        source .venv/bin/activate
    ```

2.  **配置环境变量**
    ```bash
        cp .env.example .env
        # 编辑 .env 文件，配置数据库、Redis 等参数
    ```


3.  **安装依赖**
    ```bash
        pip install -r requirements-dev.txt
        
        # 生产环境需要安装 gunicorn 和 uvicorn
        pip install gunicorn uvicorn[standard]
    ```
4. **启动项目**
    ```bash
        # 方式a：直接运行项目
        python run.py
        # 方式b：指定端口的方式
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 
    ```
    服务启动后，请在浏览器访问 http://127.0.0.1:8000/docs 查看 Swagger 交互式文档。


## 🗄️ 数据库与迁移指南

本项目使用 Alembic 进行数据库版本控制和数据迁移。

### 1. 初始化数据库

执行迁移命令

```sh
  alembic upgrade head
```

### 2. 初始化基本数据

数据库建表完成后，需导入系统所需的基础角色和权限数据。会创建基本的角色、用户数据

```sh
    python app/scripts/init_db.py
```

### 3. 注意事项

1. 项目根目录下的 alembic.ini 文件，sqlalchemy.url 这一行已经注释，因为用 Python 代码覆盖它
2. 配置 alembic/env.py 
```python
    from app.core.database import Base, SQLALCHEMY_DATABASE_URL
    from app.models.scene import SceneEntity
    from app.models.robot_config import RobotConfig
```
3. 当修改了 models 中的表结构后，按如下步骤同步到数据库
```sh
  # 生成迁移脚本
  alembic revision --autogenerate -m "init_full_schema"
```


## 📂 项目结构

```sh
project/
├── app/                          # 主应用目录
│   ├── __init__.py
│   ├── main.py                   # 应用实例和启动文件
│   ├── core/                     # 核心配置
│   │   ├── __init__.py
│   │   ├── config.py             # 配置文件
│   │   ├── security.py           # 认证安全相关
│   │   ├── deps.py               # get_redis、get_db
│   │   ├── redis_client.py       # redis连接
│   │   └── database.py           # 数据库连接
│   ├── modules/                  # 模块目录
│   │   ├── schemas.py            # 请求/响应验证模型
│   │   ├── router.py             # 路由层
│   │   ├── models.py             # 数据库模型
│   │   ├── repository.py         # 数据库操作层
│   │   └── services.py           # 业务逻辑层
│   ├── libs/                     # 存放C库文件
│   │   └── libgdmifcso.so   
│   ├── utils/                    # 工具函数
│   │   ├── __init__.py
│   │   └── common.py
│   └── tests/                    # 测试文件
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_users.py
│       └── test_items.py
├── requirements/                 # 依赖文件（分环境）
│   ├── base.txt                 # 基础依赖
│   ├── dev.txt                  # 开发环境
│   └── prod.txt                 # 生产环境
├── alembic/                  # 数据库迁移文件
├── static/                     # 静态文件
├── templates/                  # 模板文件（如果使用Jinja2）
├── .env.example               # 环境变量示例
├── .gitignore
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## ⚙️ 高级配置 (展开查看)


<details>
<summary><b>1. 推荐使用vscode作为开发工具，安装vscode插件：</b></summary><br>

- Python
- Ruff
- Pylance
- Flake8

</details>


<details>
<summary><b>1. 推荐配置vscode设置：</b></summary><br>

```js
# .vscode/settings.json
{
    // 设置 Python 文件的默认格式化程序为 Ruff
    "[python]": {
        "editor.defaultFormatter": "charliermarsh.ruff",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            // 自动修复可修复的错误（比如多余的空格、没用的 import）
            "source.fixAll.ruff": "explicit",
            // 自动对 import 语句进行排序
            "source.organizeImports.ruff": "explicit"
        }
    },
    // 让 Ruff 插件优先使用你项目里 uv add 安装的那个版本
    "ruff.importStrategy": "fromEnvironment"
}
```
</details>

