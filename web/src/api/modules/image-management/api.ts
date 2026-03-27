import type {
  IDirectoryItem,
  IDirId,
  ImageFile,
} from './type'
import request from '@apis/request'

// 获取根目录ID
export function getRootDirectoryId() {
  return request<IDirId>({
    url: '/api/v1/image-management/directories/root',
    method: 'get',
  })
}

// 获取目录结构（分页混合数据）
export function getDirectoryStructure(params: {
  dirId?: IDirId
  searchName?: string
  page?: number
  pageSize?: number
}) {
  return request<PaginationResponse<IDirectoryItem[]>>({
    url: '/api/v1/image-management/directories/content',
    method: 'get',
    // FastAPI GET请求的Query参数默认是蛇形命名(snake_case)，在这里做一层转换适配
    params: {
      dir_id: params.dirId,
      search_name: params.searchName,
      page: params.page,
      page_size: params.pageSize,
    },
  })
}

// 通过ID获取目录链（面包屑）
export function getDirectoryStructureById(dirId: number) {
  return request<IDirectoryItem[]>({
    url: `/api/v1/image-management/directories/${dirId}/structure`,
    method: 'get',
  })
}

// 获取完整树形目录结构
export function getTreeDirectoryStructures() {
  return request<IDirectoryItem[]>({
    url: '/api/v1/image-management/directories/tree',
    method: 'get',
  })
}

// 创建目录
export function createDirectory(data: { name: string, dirId: IDirId }) {
  return request<void>({
    url: '/api/v1/image-management/directories',
    method: 'post',
    data, // 后端使用的是 CamelCaseModel，自动兼容前端的驼峰命名
  })
}

// 重命名目录
export function renameDirectory(data: { dirId: IDirId, name: string }) {
  return request<void>({
    url: '/api/v1/image-management/directories/rename',
    method: 'put',
    data,
  })
}

// 移动目录
export function moveDirectory(data: { dirId: IDirId, targetDirId: IDirId }) {
  return request<void>({
    url: '/api/v1/image-management/directories/move',
    method: 'put',
    data,
  })
}

// 删除目录
export function deleteDirectory(dirId: number) {
  return request<void>({
    url: `/api/v1/image-management/directories/${dirId}`,
    method: 'delete',
  })
}

// 上传图片（需处理文件上传）
export function uploadImages(data: { dirId?: IDirId, file: File }) {
  const formData = new FormData()
  formData.append('file', data.file)
  if (data.dirId) {
    formData.append('dirId', data.dirId.toString())
  }

  return request<void>({
    url: '/api/v1/image-management/images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 重命名图片
export function renameImage(data: { imagesId: IDirId, name: string }) {
  return request<void>({
    url: '/api/v1/image-management/images/rename',
    method: 'put',
    data,
  })
}

// 移动图片
export function moveImages(data: { imagesId: IDirId, dirId: IDirId }) {
  return request<void>({
    url: '/api/v1/image-management/images/move',
    method: 'put',
    data,
  })
}

// 删除图片
export function deleteImages(imagesId: number) {
  return request<void>({
    url: `/api/v1/image-management/images/${imagesId}`,
    method: 'delete',
  })
}
