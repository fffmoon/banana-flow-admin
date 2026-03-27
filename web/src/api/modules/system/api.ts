/*
 * @Author: Qing
 * @Description:系统相关 API
 * @Date: 2025-01-10 12:33:10
 * @LastEditTime: 2025-03-01 16:23:27
 */

import type { IRouteDataRaw } from 'types/vue-router'

// 创建参数，排除ID
export type MenuCreateParams = Omit<IRouteDataRaw, 'id'>

// 更新参数
export type MenuUpdateParams = Partial<IRouteDataRaw>

/**
 * 获取路由配置
 */
export function getRoutes() {
  return request<IRouteDataRaw[]>({
    url: '/api/getRoutes',
    method: 'GET',
  })
}

interface IRouteVersionResponse {
  version: string
}

/**
 * 获取路由版本号
 */
export function getRouteVersion() {
  return request<IRouteVersionResponse>({
    url: '/api/v1/auth/version',
    method: 'GET',
  })
}

/**
 * 创建菜单
 */
export function createMenu(data: MenuCreateParams) {
  return request<IRouteDataRaw>({
    url: '/api/v1/permissions',
    method: 'POST',
    data,
  })
}

/**
 * 更新菜单
 */
export function updateMenu(menuId: string, data: MenuUpdateParams) {
  return request<IRouteDataRaw>({
    url: `/api/v1/permissions/${menuId}`,
    method: 'PUT',
    data,
  })
}

/**
 * 删除菜单
 */
export function deleteMenu(menuId: string) {
  return request<any>({
    url: `/api/v1/permissions/${menuId}`,
    method: 'DELETE',
  })
}

/**
 * 获取菜单列表 (扁平结构，前端组装树)
 */
export function getMenuList() {
  return request<IRouteDataRaw[]>({
    url: '/api/v1/permissions',
    method: 'GET',
  })
}
