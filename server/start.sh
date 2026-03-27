#!/bin/bash

# 非0状态码脚本立即退出
set -e

# 执行数据库迁移
echo "Running database migrations..."
alembic upgrade head

# 初始化数据库
echo "Initializing database..."
python app/scripts/init_db.py

# 启动 FastAPI 服务
SERVER_HOST=${HOST:-0.0.0.0}
SERVER_PORT=${PORT:-8000}
echo "Starting application on ${SERVER_HOST}:${SERVER_PORT}..."

exec uvicorn app.main:app --host "$SERVER_HOST" --port "$SERVER_PORT"