// --- 类型定义 ---

// 角色类型
export interface Role {
  id: string
  roleName: string
  roleCode: string
  sort: number
  status: boolean
  menuIds?: string[] // 后端 list 接口返回时带有此字段
  isSystem: boolean
  roleLevel: number
  canEdit?: boolean
}

export type RoleCreateParams = Omit<Role, 'id' | 'menuIds' | 'isSystem'>
export type RoleUpdateParams = Partial<RoleCreateParams>

// --- 角色管理 API ---

export function getRoleList() {
  return request<Role[]>({
    url: '/api/v1/roles',
    method: 'GET',
  })
}

export function createRole(data: RoleCreateParams) {
  return request<Role>({
    url: '/api/v1/roles',
    method: 'POST',
    data,
  })
}

export function updateRole(id: string, data: RoleUpdateParams) {
  return request<Role>({
    url: `/api/v1/roles/${id}`,
    method: 'PUT',
    data,
  })
}

export function deleteRole(id: string) {
  return request<any>({
    url: `/api/v1/roles/${id}`,
    method: 'DELETE',
  })
}

// 分配菜单权限
export function updateRoleMenus(roleId: string, menuIds: string[]) {
  return request<any>({
    url: `/api/v1/roles/${roleId}/menus`,
    method: 'PUT',
    data: { menuIds },
  })
}
