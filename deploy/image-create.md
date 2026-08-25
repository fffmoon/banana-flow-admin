# 制作离线镜像包

## 名词

- 前端项目名称：`banana-flow-admin-web-v3`
- 后端项目名称：`banana-flow-admin-server-py`
- 部署路径：`/opt/banana-flow-admin-platform`
- 版本号规范：`v年月日.当日序号.组件标识`
  - 前端版本示例：`v20260526.1.web`
  - 后端版本示例：`v20260526.1.server`


## 方式1：一键打包脚本

项目根目录执行：

```bash
node scripts/build-images.js
```

默认会自动完成：

- 生成版本号：`v年月日.当日序号.web/server`
- 前端生产构建：`pnpm build:production`
- 构建前端、后端 Docker 镜像
- 拉取并导出 `mysql:8.0`、`redis:7.0`
- 将镜像导出到 `deploy/images/*.tar.gz`
- 更新 `deploy/.env` 中的 `WEB_VERSION`、`SERVER_VERSION`

常用参数：

```bash
# 只打前后端，不重新导出数据库镜像
node scripts/build-images.js --target app

# 只打前端
node scripts/build-images.js --target web

# 只打后台
node scripts/build-images.js --target server

# 后端强制无缓存构建
node scripts/build-images.js --target server --no-cache-server

# 指定当日序号
node scripts/build-images.js --seq 2

# 数据库镜像不重新 pull，直接导出本地已有镜像
node scripts/build-images.js --target db --skip-db-pull
```

查看完整参数：

```bash
node scripts/build-images.js --help
```

## 方式2：手动打包流程

### 前端

1. 切换到前端目录：
```bash
cd ./web
```

2. 使用以下命令构建生产版本：
```bash
  pnpm build:production
```

3. 使用以下命令制作 Docker 镜像：
```bash
  docker build -t banana-flow-admin-web-v3:v20260526.1.web ./
```

4. 使用以下命令导出镜像：
```bash
 # 注意：用到了压缩命令，cmd可能不支持命令，可以使用git base here
 docker save banana-flow-admin-web-v3:v20260526.1.web | gzip > ../deploy/images/banana-flow-admin-web-v3-v20260526.1.web.tar.gz
```

### 后端
1. 切换到后端目录：
```bash
  cd ./server
```

2. 使用以下命令制作 Docker 镜像：
```bash
  docker build -t banana-flow-admin-server-py:v20260526.1.server ./
  # （可选）如果修改了基础环境或需要强制拉取最新依赖，可使用无缓存构建：
  # docker build --no-cache -t banana-flow-admin-server-py:v20260526.1.server ./
```

3. 使用以下命令导出镜像：
```bash
 docker save banana-flow-admin-server-py:v20260526.1.server | gzip > ../deploy/images/banana-flow-admin-server-py-v20260526.1.server.tar.gz
```

### 数据库

1. **准备基础镜像**：
	```bash
	  docker pull mysql:8.0
	  docker pull redis:7.0
	```

2. **导出镜像**
	```bash
	 docker save mysql:8.0 redis:7.0 | gzip > ../deploy/images/database-images.tar.gz
	```

