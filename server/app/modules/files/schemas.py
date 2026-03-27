from pydantic import Field, ConfigDict
from app.common.schemas.response import CamelCaseModel


class FileResponse(CamelCaseModel):
    """
    上传成功响应
    """

    id: int = Field(..., description="文件ID")
    file_name: str = Field(..., description="原始文件名")
    file_url: str = Field(..., description="文件访问链接")
    file_size: int = Field(..., description="文件大小(字节)")

    model_config = ConfigDict(from_attributes=True)
