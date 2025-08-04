/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-01-10 12:33:10
 * @LastEditTime: 2025-03-01 16:23:27
 */

import type { IRouteDataRaw } from 'types/vue-router'

/**
 * 获取路由配置
 */
export function getRoutes() {
  return request<IRouteDataRaw[]>({
    url: '/api/getRoutes',
    method: 'GET',
  })
}

/**
 * 获取路由版本号
 */
export function getRouteVersion() {
  return request<string>({
    url: '/api/getRouteVersion',
    method: 'GET',
  })
}
