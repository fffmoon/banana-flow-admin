import time
import functools
from fastapi import Request, BackgroundTasks, Response
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Dict, Any

from .schemas import OperationLogCreate
from .repository import OperationLogRepository
from app.core.database import AsyncSessionLocal
from loguru import logger


def log_operation(module: str, action: str):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # 获取 Request 对象
            request: Request = kwargs.get("request")
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            if not request:
                return await func(*args, **kwargs)

            # 获取 BackgroundTasks
            background_tasks: BackgroundTasks = kwargs.get("background_tasks")
            if not background_tasks:
                for arg in args:
                    if isinstance(arg, BackgroundTasks):
                        background_tasks = arg
                        break

            start_time = time.time()
            status_code = 200
            error_msg = None
            response_data = {}

            try:
                response = await func(*args, **kwargs)

                if isinstance(response, Response):
                    status_code = response.status_code
                    response_data = {"msg": "Binary or Stream Response"}
                else:
                    try:
                        response_data = jsonable_encoder(response)
                    except:
                        response_data = {"msg": "Response serialization failed"}

                return response

            except Exception as e:
                status_code = 500
                error_msg = str(e)
                response_data = {"error": error_msg}
                raise e

            finally:
                duration = int((time.time() - start_time) * 1000)

                # 获取当前用户
                user = kwargs.get("current_user")
                if not user and hasattr(request, "state"):
                    user = getattr(request.state, "user", None)

                # 提取请求参数
                request_params = {}
                request_params.update(request.path_params)
                request_params.update(request.query_params._dict)

                for key, value in kwargs.items():
                    if key in [
                        "request",
                        "background_tasks",
                        "service",
                        "current_user",
                    ]:
                        continue
                    if isinstance(value, (Request, BackgroundTasks)):
                        continue

                    if isinstance(value, BaseModel):
                        try:
                            request_params.update(value.model_dump())
                        except:
                            request_params.update(value.dict())
                    elif isinstance(
                        value, (int, str, bool, list, dict)
                    ) and not key.startswith("_"):
                        request_params[key] = value

                # 脱敏处理
                sensitive_keys = [
                    "password",
                    "token",
                    "secret",
                    "confirm_password",
                    "old_password",
                ]
                for k in list(request_params.keys()):
                    if any(s in k.lower() for s in sensitive_keys):
                        request_params[k] = "******"

                user_agent = request.headers.get("user-agent", "")

                # 组装日志对象
                log_in = OperationLogCreate(
                    userId=getattr(user, "id", None),
                    username=getattr(user, "username", "Anonymous"),
                    module=module,
                    action=action,
                    method=request.method,
                    path=request.url.path,
                    ipAddress=request.client.host if request.client else "Unknown",
                    location="",
                    os="",
                    browser="",
                    userAgent=user_agent,
                    requestParams=jsonable_encoder(request_params),
                    responseData=jsonable_encoder(response_data),
                    statusCode=status_code,
                    executionTime=duration,
                )

                # 异步写入数据库
                if background_tasks:
                    background_tasks.add_task(save_log, log_in)
                else:
                    try:
                        await save_log(log_in)
                    except Exception as log_err:
                        logger.error(f"日志写入失败: {log_err}")

        return wrapper

    return decorator


async def save_log(log_in: OperationLogCreate):
    try:
        async with AsyncSessionLocal() as session:
            repo = OperationLogRepository(session)
            await repo.create(log_in)
    except Exception as e:
        logger.error(f"Error saving log: {e}")
