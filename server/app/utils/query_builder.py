from sqlalchemy import select, String, Text
from typing import Type, Any


def apply_dynamic_filters(
    stmt, model: Type, request_data: dict, exclude_keys: list = None
):
    """
    根据字典参数动态构建 SQLAlchemy 2.0 异步查询条件
    stmt: select(Model) 对象
    request_data: 过滤参数字典
    """
    if exclude_keys is None:
        exclude_keys = ["page", "size", "t"]

    for key, value in request_data.items():
        if key in exclude_keys or value == "" or value is None:
            continue

        if not hasattr(model, key):
            continue

        column = getattr(model, key)

        # 获取列的 Python 类型进行判断
        try:
            python_type = column.type.python_type
            if python_type == str:
                # 字符串类型使用模糊查询
                stmt = stmt.where(column.like(f"%{value}%"))
            else:
                # 其他类型（Int, Bool, Decimal）使用精确查询
                stmt = stmt.where(column == value)
        except NotImplementedError:
            # 无法识别类型时默认精确查询
            stmt = stmt.where(column == value)

    return stmt
