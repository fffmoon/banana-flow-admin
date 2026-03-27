from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.core.database import Base


class OperationLogEntity(Base):
    __tablename__ = "operation_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, comment="操作用户ID")
    username = Column(String(50), comment="操作用户名")
    module = Column(String(50), comment="业务模块")
    action = Column(String(100), comment="操作描述")
    method = Column(String(10), comment="请求方法")
    path = Column(String(255), comment="请求路径")
    ip_address = Column(String(50), comment="IP地址")
    user_agent = Column(Text, comment="用户代理", nullable=True)
    os = Column(String(50), comment="操作系统", nullable=True)
    browser = Column(String(50), comment="浏览器", nullable=True)
    location = Column(String(100), comment="地理位置", nullable=True)
    request_params = Column(JSON, comment="请求参数")
    response_data = Column(JSON, comment="响应数据")
    status_code = Column(Integer, comment="状态码")
    execution_time = Column(Integer, comment="执行耗时(ms)")
    created_at = Column(DateTime, default=datetime.now)
