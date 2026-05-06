import json
from contextvars import ContextVar
from pathlib import Path

from app.core.config import settings

# 协程安全的上下文变量
_current_locale: ContextVar[str] = ContextVar(
    "current_locale", default=settings.DEFAULT_LOCALE
)


class I18nManager:
    def __init__(self):
        self.translations = {}
        self.load_translations()

    def load_translations(self):
        """加载 JSON 语言包"""
        locales_dir = Path(settings.I18N_DIR)
        if not locales_dir.exists():
            return

        for file_path in locales_dir.glob("*.json"):
            locale = file_path.stem
            with open(file_path, "r", encoding="utf-8") as f:
                self.translations[locale] = json.load(f)

    @property
    def locale(self) -> str:
        return _current_locale.get()

    @locale.setter
    def locale(self, value: str):
        if value in settings.SUPPORTED_LOCALES:
            _current_locale.set(value)
        else:
            _current_locale.set(settings.DEFAULT_LOCALE)

    def t(self, key: str, **kwargs) -> str:
        """
        获取翻译文本
        用法: i18n.t("global.error.not_found", resource="用户")
        """
        locale = self.locale
        keys = key.split(".")

        # 逐级往下找
        data = self.translations.get(locale, {})
        for k in keys:
            if isinstance(data, dict):
                data = data.get(k)
            else:
                data = None
                break

        if data is None:
            # 回退到默认语言
            if locale != settings.DEFAULT_LOCALE:
                data = self.translations.get(settings.DEFAULT_LOCALE, {})
                for k in keys:
                    data = data.get(k) if isinstance(data, dict) else None

        # 如果还是找不到，直接返回 key
        if data is None or not isinstance(data, str):
            return key

        # 支持字符串格式化
        return data.format(**kwargs) if kwargs else data


# 全局单例
i18n = I18nManager()
