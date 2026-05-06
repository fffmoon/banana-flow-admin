# 部署说明

## 名词

- 前端项目名称：`banana-flow-admin-web-v3`
- 后端项目名称：`banana-flow-admin-server-py`
- 部署路径：`/opt/banana-flow-admin-platform`
- 版本号规范：`v年月日.当日序号.组件标识`
  - 前端版本示例：`v20260403.1.web`
  - 后端版本示例：`v20260403.1.server`

## 1. 环境准备

在开始部署之前，请确保服务器满足以下要求：

- **操作系统**: CentOS 7+ / Ubuntu 18.04+
- **依赖软件**:
  - Docker (版本 20.10+)
  - Docker Compose (版本 2.0+)
- **硬件资源**: 建议 2核 CPU / 2G 内存 / 10G+ 硬盘

## 2. 部署包结构说明

请将部署包解压至服务器 `/opt/banana-flow-admin-platform` (或其他自定义目录)，解压后的目录结构应如下所示：

```sh
/opt/banana-flow-admin-platform/
├── docker-compose.yml       # 容器编排文件
├── .env                     # 全局环境变量配置
├── images/                  # 离线镜像包文件夹
│   ├── database-images.tar   # mysql, redis 基础镜像
│   ├── banana-flow-admin-server-py-v20260403.1.server.tar
│   └── banana-flow-admin-web-v3-v20260403.1.web.tar
├── server/                  # 后端挂载目录
│   ├── logs/                # 运行日志
│   └── import_data/         # 导入数据
├── web/                     # 前端挂载目录
│   └── default.conf         # Nginx 配置文件
└── data/                    # 数据库持久化目录
```

## 3. 安装部署步骤

### 3.1 导入离线镜像

进入项目根目录，加载所有 Docker 镜像：

```bash
cd /opt/banana-flow-admin-platform

# 导入数据库镜像
docker load -i images/database-images.tar

# 导入应用镜像
docker load -i images/banana-flow-admin-server-py-v20260403.1.server.tar.gz
docker load -i images/banana-flow-admin-web-v3-v20260403.1.web.tar.gz

# 验证镜像是否导入成功
docker images
# 确认列表中包含: mysql, redis, banana-flow-admin-server-py, banana-flow-admin-web-v3
```

### 3.2 配置文件检查

*如果没有必要，3.2不需要修改，直接看3.3*

**1. 修改环境变量 `.env`**

使用文本编辑器（如 `vim`）打开 `.env` 文件，确认数据库密码等敏感信息：

```ini
# MySQL 配置
DB_ROOT_PASSWORD=复杂密码
DB_USER=qing
DB_PASSWORD=G7JeTlpvu1!2ep

# Redis 配置
REDIS_PASSWORD=pZJ%yYc3C6lPa9
```

**2. 修改 default.conf**

修改 `default.conf` 文件，使得前端可以通过容器内部通信的方式访问后台服务。

``` conf
# 上游服务1
upstream backend_server {
    server banana-flow-admin-server-py:8000;
}

```

### 3.3 启动服务

在项目根目录下执行：

```bash
# 后台启动所有服务
docker compose up -d

# 查看服务运行状态
docker compose ps
```

**预期结果**：所有服务的 State 应为 `Up`。

### 3.4 验证部署

- **Web 访问**: 浏览器访问 `http://服务器IP:18003`
- **后端 API**: 浏览器或 Postman 访问 `http://服务器IP:8000/docs`。

## 4. 常见运维操作

### 4.1 查看日志

```bash
# 查看所有服务实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f banana-flow-admin-server-py
# 或者直接查看挂载的日志文件
tail -f server/logs/banana-flow-admin-server.log
```

### 4.2 重启服务

```bash
# 重启所有服务
docker-compose restart

# 仅重启单个服务，比如前端
docker-compose restart banana-flow-admin-web-v3
```

### 4.3 更新部署

如果需要更新后端或前端版本：

1. 将新的 `.tar` 镜像包放入 `images/` 目录。

2. 导入新镜像：

   ```sh
   docker load -i images/banana-flow-admin-server-py-v20260403.1.server.tar.gz
   ```

3. 修改 `env` 中的镜像版本号 *（docker-compose从env中读取tag）*。

4. 执行更新命令：
   ```bash
   docker compose up -d
   ```

### 4.4 数据备份

数据库文件位于当前目录的 `./data` 文件夹下。

- **备份**: 建议定期打包 `./data` 目录。
- **恢复**: 停止服务后，将备份的 `data` 目录覆盖回原位，再启动服务。

---

