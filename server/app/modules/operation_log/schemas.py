from typing import Optional, Any
from datetime import datetime
from app.common.schemas.response import CamelCaseModel


class OperationLogCreate(CamelCaseModel):
    user_id: Optional[int]
    username: Optional[str]
    module: str
    action: str
    method: str
    path: str
    ip_address: str
    user_agent: Optional[str] = None
    os: Optional[str] = None
    browser: Optional[str] = None
    location: Optional[str] = None
    request_params: Optional[Any]
    response_data: Optional[Any]
    status_code: int
    execution_time: int


class OperationLogOut(OperationLogCreate):
    id: int
    created_at: datetime


class OperationLogQuery(CamelCaseModel):
    """操作日志查询参数"""

    username: Optional[str] = None
    module: Optional[str] = None
    status_code: Optional[int] = None  # 200 为成功，500 为失败
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class OperationLogResponse(CamelCaseModel):
    """列表展示字段"""

    id: int
    user_id: Optional[int]
    username: str
    module: str
    action: str
    method: str
    path: str
    ip_address: str
    user_agent: Optional[str] = None
    os: Optional[str] = None
    browser: Optional[str] = None
    location: Optional[str] = None
    status_code: int
    execution_time: int
    created_at: datetime
    request_params: Optional[dict] = None
    response_data: Optional[dict] = None

    class Config:
        from_attributes = True
