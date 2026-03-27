// --- 类型定义 ---

import type { Role } from '../roles/api'

// 用户类型
export interface User {
  id: string
  username: string
  nickname?: string
  email?: string
  isActive: boolean
  isSuperuser: boolean
  avatar?: string
  roles: Role[]
  createTime?: string
  mobilePhone?: string
  gender?: 0 | 1 | 2
}

export interface UserCreateParams {
  username: string
  password: string
  email?: string
  nickname?: string
  isActive?: boolean
  roleIds?: string[] // 创建时关联角色ID
}

export interface UserUpdateParams {
  email?: string
  nickname?: string
  isActive?: boolean
  password?: string // 留空不修改
  roleIds?: string[]
}

// --- 用户管理 API ---

// 查询用户
interface UserListRequest {
  page: number
  size: number
  username?: string
  mobilePhone?: string
  isActive?: boolean
}

export function getUserList(params: UserListRequest) {
  return request<PaginationResponse<User[]>>({
    url: '/api/v1/users',
    method: 'GET',
    params,
  })
}

export function createUser(data: UserCreateParams) {
  return request<User>({
    url: '/api/v1/users',
    method: 'POST',
    data,
  })
}

export function updateUser(id: string, data: UserUpdateParams) {
  return request<User>({
    url: `/api/v1/users/${id}`,
    method: 'PUT',
    data,
  })
}

// 用户分配角色（虽然 updateUser 也可以传 roleIds，但有些场景可能单独使用）
export function assignUserRoles(userId: string, roleIds: string[]) {
  return request<any>({
    url: `/api/v1/users/${userId}/roles`,
    method: 'PUT',
    data: { roleIds },
  })
}

// 删除用户（逻辑删除）
export function deleteUser(id: string) {
  return request<any>({
    url: `/api/v1/users/${id}`,
    method: 'DELETE',
  })
}
