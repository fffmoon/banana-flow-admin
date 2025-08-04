import type {
  IDirectoryItem,
  IDirId,
  ImageFile,
} from './type'
import request from '@apis/request'

enum Api {
  DirectoryCreate = '/api/image-management/directory/create',
  GetDirectoryStructure = '/api/image-management/getDirectoryStructure',
  DirectoryDelete = '/api/image-management/directory/delete',
  DirectoryRename = '/api/image-management/directory/renamed',
  ImagesUpload = '/api/image-management/images/upload',
  ImagesMove = '/api/image-management/images/move',
  DirectoryMove = '/api/image-management/directory/move',
  ImageRename = '/api/image-management/images/renamed',
  ImagesDelete = '/api/image-management/images/delete',
  GetStructureById = '/api/image-management/getDirectoryStructureById',
  GetTreeStructures = '/api/image-management/getTreeDirectoryStructures',
  GetRootDirId = '/api/image-management/getRootDirectoryId',
}

// 创建目录
export function createDirectory(data: { name: string, dirId: IDirId }) {
  return request<IDirectoryItem>({
    url: Api.DirectoryCreate,
    method: 'post',
    data,
  })
}

// 获取目录结构（分页）
export function getDirectoryStructure(params: {
  dirId: IDirId
  searchName: string
  page: number
  pageSize: number
}) {
  return request<PaginationResponse<IDirectoryItem[]>>({
    url: Api.GetDirectoryStructure,
    method: 'get',
    params,
  })
}

// 删除目录
export function deleteDirectory(dirId: number) {
  return request({
    url: Api.DirectoryDelete,
    method: 'delete',
    data: { dirId },
  })
}

// 重命名目录
export function renameDirectory(data: { dirId: IDirId, name: string }) {
  return request<IDirectoryItem>({
    url: Api.DirectoryRename,
    method: 'put',
    data,
  })
}

// 上传图片（需处理文件上传）
export function uploadImages(data: { dirId?: IDirId, file: File }) {
  const formData = new FormData()
  formData.append('file', data.file)
  if (data.dirId)
    formData.append('dirId', data.dirId.toString())

  return request<ImageFile[]>({
    url: Api.ImagesUpload,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 移动图片
export function moveImages(data: { imagesId: IDirId, dirId: IDirId }) {
  return request({
    url: Api.ImagesMove,
    method: 'put',
    data,
  })
}

// 移动目录
export function moveDirectory(data: { dirId: IDirId, targetDirId: IDirId }) {
  return request<IDirectoryItem>({
    url: Api.DirectoryMove,
    method: 'put',
    data,
  })
}

// 重命名图片
export function renameImage(data: { imagesId: IDirId, name: string }) {
  return request<ImageFile>({
    url: Api.ImageRename,
    method: 'put',
    data,
  })
}

// 删除图片
export function deleteImages(imagesId: number) {
  return request({
    url: Api.ImagesDelete,
    method: 'delete',
    data: { imagesId },
  })
}

// 通过ID获取目录链
export function getDirectoryStructureById(dirId: number) {
  return request<IDirectoryItem[]>({
    url: Api.GetStructureById,
    method: 'get',
    params: { dirId },
  })
}

// 获取完整树形目录结构
export function getTreeDirectoryStructures() {
  return request<IDirectoryItem[]>({
    url: Api.GetTreeStructures,
    method: 'get',
  })
}

// 获取根目录ID
export function getRootDirectoryId() {
  return request<IDirId>({
    url: Api.GetRootDirId,
    method: 'get',
  })
}
