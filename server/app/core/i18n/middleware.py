from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.i18n import i18n


class I18nMiddleware(BaseHTTPMiddleware):
    """
    国际化中间件：负责拦截请求头并设置全局语言上下文
    """

    async def dispatch(self, request: Request, call_next):
        # 1. 解析 Accept-Language Header (例如: "zh-CN,zh;q=0.9,en;q=0.8")
        accept_language = request.headers.get("Accept-Language", "")

        # 2. 简单的语言协商逻辑
        locale = i18n.locale  # 默认
        if accept_language:
            # 取权重最高的首个语言
            parsed_locale = accept_language.split(",")[0].split(";")[0].strip()
            # 转换为我们的标准格式
            if parsed_locale.startswith("en"):
                locale = "en-US"
            elif parsed_locale.startswith("zh"):
                locale = "zh-CN"

        # 3. 设置上下文变量
        i18n.locale = locale

        # 4. 继续处理请求
        response = await call_next(request)
        return response
