# 制作离线镜像包


## 前端

1. 切换到前端目录：
```bash
cd ./web
```

1. 使用以下命令构建生产版本：
```bash
  pnpm build:production
```

2. 使用以下命令制作 Docker 镜像：
```bash
  docker build -t banana-flow-admin-web-v3:v1.1 ./
```

3. 使用以下命令导出镜像：
```bash
  docker save -o ../deploy/images/banana-flow-admin-web-v3.tar banana-flow-admin-web-v3:v1.1
```

## 后端
1. 切换到后端目录：
```bash
  cd ./server
```

2. 使用以下命令制作 Docker 镜像：
```bash
  docker build --no-cache -t banana-flow-admin-server-py:v1.1 ./
```

3. 使用以下命令导出镜像：
```bash
  docker save -o ../deploy/images/banana-flow-admin-server-py.tar banana-flow-admin-server-py:v1.1
```

## 数据库

1. **准备基础镜像**：
```bash
  docker pull mysql:8.0
  docker pull redis:7.0
```

3. **导出镜像**：
```bash
  docker save -o ../deploy/images/database-images.tar mysql:8.0 redis:7.0
```