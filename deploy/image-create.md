# 制作离线镜像包

## 名词

- 前端项目名称：`banana-flow-admin-web-v3`
- 后端项目名称：`banana-flow-admin-server-py`
- 部署路径：`/opt/banana-flow-admin-platform`
- 版本号规范：`v年月日.当日序号.组件标识`
  - 前端版本示例：`v20260403.1.web`
  - 后端版本示例：`v20260403.1.server`


## 前端

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
  docker build -t banana-flow-admin-web-v3:v20260403.1.web ./
```

4. 使用以下命令导出镜像：
```bash
 docker save banana-flow-admin-web-v3:v20260403.1.web | gzip > ../deploy/images/banana-flow-admin-web-v3-v20260403.1.web.tar.gz
```

## 后端
1. 切换到后端目录：
```bash
  cd ./server
```

2. 使用以下命令制作 Docker 镜像：
```bash
  docker build -t banana-flow-admin-server-py:v20260403.1.server ./
  # （可选）如果修改了基础环境或需要强制拉取最新依赖，可使用无缓存构建：
  # docker build --no-cache -t banana-flow-admin-server-py:v20260403.1.server ./
```

3. 使用以下命令导出镜像：
```bash
 docker save banana-flow-admin-server-py:v20260403.1.server | gzip > ../deploy/images/banana-flow-admin-server-py-v20260403.1.server.tar.gz
```

## 数据库

1. **准备基础镜像**：
	```bash
	  docker pull mysql:8.0
	  docker pull redis:7.0
	```

2. **导出镜像**
	```bash
	 docker save mysql:8.0 redis:7.0 | gzip > ../deploy/images/database-images.tar.gz
	```

