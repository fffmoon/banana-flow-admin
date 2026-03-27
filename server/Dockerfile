# ==========================================
# 第一阶段：Builder（用于安装依赖和编译）
# ==========================================
FROM python:3.10-slim as builder

WORKDIR /build

# 更换为阿里云镜像源并安装构建依赖 (gcc 等)
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y gcc default-libmysqlclient-dev && \
    rm -rf /var/lib/apt/lists/*

# 创建虚拟环境 (将所有依赖安装到虚拟环境中，方便整体拷贝)
RUN python -m venv /opt/venv
# 激活虚拟环境的 PATH
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .

# 升级 pip 并安装依赖，去除不需要的缓存
RUN pip install --upgrade pip --no-cache-dir -i https://mirrors.aliyun.com/pypi/simple/ && \
    pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# ==========================================
# 第二阶段：Runner（最终运行的精简镜像）
# ==========================================
FROM python:3.10-slim

WORKDIR /app

# 设置时区等环境变量（可选推荐）
ENV TZ=Asia/Shanghai \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# 如果运行阶段需要系统级动态库，在这里安装运行库（不需要 gcc）
# RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources ...

# 从 builder 阶段拷贝已经安装好的虚拟环境
COPY --from=builder /opt/venv /opt/venv

# 处理 C 库文件
# RUN mkdir -p /app/libs
# COPY libs/libgdmifcso.so /usr/local/lib/libgdmifcso.so

# 只拷贝应用代码
COPY . .

RUN chmod +x /app/start.sh && sed -i 's/\r$//' /app/start.sh

CMD ["/app/start.sh"]