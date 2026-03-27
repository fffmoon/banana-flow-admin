from typing import List, Optional

from pydantic import ConfigDict, Field

from app.common.schemas.response import CamelCaseModel

# ---------- 请求模型 ----------


class CreateDirReq(CamelCaseModel):
    name: str = Field(..., description="目录名称")
    dir_id: Optional[int] = Field(None, description="父目录ID")


class RenameDirReq(CamelCaseModel):
    dir_id: int = Field(..., description="目录ID")
    name: str = Field(..., description="新名称")


class MoveDirReq(CamelCaseModel):
    dir_id: int = Field(..., description="要移动的目录ID")
    target_dir_id: int = Field(..., description="目标父目录ID")


class RenameImageReq(CamelCaseModel):
    images_id: int = Field(..., description="图片记录ID")
    name: str = Field(..., description="新名称")


class MoveImageReq(CamelCaseModel):
    images_id: int = Field(..., description="要移动的图片ID")
    dir_id: int = Field(..., description="目标目录ID")


# ---------- 响应模型 ----------


class DirectoryItemRes(CamelCaseModel):
    """统一的文件/文件夹响应体"""

    id: int = Field(..., description="唯一标识")
    name: str = Field(..., description="名称")
    type: str = Field(..., description="类型: folder 或 file")
    file_path: Optional[str] = Field(None, description="文件访问URL(图片预览)")
    file_type: Optional[str] = Field(None, description="MIME类型")
    date: str = Field(..., description="创建日期")
    light_name: Optional[str] = Field(None, description="高亮名称(用于搜索)")
    children: Optional[List["DirectoryItemRes"]] = Field(
        None, description="子目录(树形结构用)"
    )

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_union_row(cls, row) -> "DirectoryItemRes":
        """工厂方法：从原生联合查询行中提取并组装"""
        return cls(
            id=row.id,
            name=row.name,
            light_name=row.name,
            type=row.type,
            file_path=row.file_path,
            file_type=row.file_type,
            date=row.create_time.strftime("%Y-%m-%d %H:%M:%S")
            if row.create_time
            else "",
        )
