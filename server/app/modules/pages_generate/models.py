from sqlalchemy import Column, Integer, String, Text, JSON
from app.core.database import Base


class PagesGenerateEntity(Base):
    __tablename__ = "pages_generate"

    id = Column(Integer, primary_key=True, index=True)
    page_key = Column(String(50), unique=True, index=True, comment="页面唯一标识")
    title = Column(String(100), comment="页面标题")
    config_json = Column(JSON, comment="解析后的DSL JSON数据")
