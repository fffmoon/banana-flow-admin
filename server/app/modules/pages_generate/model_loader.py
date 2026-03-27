from app.core.database import Base


def get_model_by_tablename(tablename: str):
    """
    根据表名获取 SQLAlchemy 模型类
    """
    for mapper in Base.registry.mappers:
        cls = mapper.class_
        if hasattr(cls, "__tablename__") and cls.__tablename__ == tablename:
            return cls
    return None
