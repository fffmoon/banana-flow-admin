from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.core.i18n import i18n

T = TypeVar("T")


class CamelCaseModel(BaseModel):
    """
    驼峰转换，注意：所有输出都需要集成这个类
    """

    model_config = ConfigDict(
        # 转驼峰
        alias_generator=to_camel,
        # 允许通过字段名下划线填充数据，UserResponse(is_active=True) 写法有效
        populate_by_name=True,
        # 允许从 ORM 对象读取数据
        from_attributes=True,
    )


def get_default_success_title():
    return i18n.t("global.success.ok")


# 标准的 API 响应结构，注意：所有响应都需要继承这个类
class APIResponse(CamelCaseModel, Generic[T]):
    success: bool = True
    status: int = 200
    data: Optional[T] = None
    title: str = Field(default_factory=get_default_success_title)
    biz_code: str = Field(default="", description="业务错误码")
