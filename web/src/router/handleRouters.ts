/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-09-03 09:42:22
 * @LastEditTime: 2025-10-25 22:05:17
 */
import type { IRouteDataRaw, IRouteItem } from 'types/vue-router'
import type { App } from 'vue'
import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import { DEFAULT_ROUTER_COMPONENT_PATH, DEFAULT_ROUTER_LAYOUT_COMPONENT_PATH } from '@/constants'
import { fixedRoutes } from './modules/fixedRoutes'
import { createRouterGuards } from './routerGuards'
import { generateFullPath, generateMeta, loadView, normalizePath, toRouteRecordRaw } from './utils'

export const routes: Array<IRouteItem> = []

// 定义 404 路由配置
const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/exception/index.vue'),
  meta: {
    id: 'not-found',
    title: '页面未找到',
    hideInMenu: true,
  },
}

/**
 * @author Qing
 * @description 创建路由
 * @date 2025-01-10 15:02:56
 */
export const router = createRouter({
  /* history: createWebHashHistory(''), // hash */
  history: createWebHistory(import.meta.env.BASE_URL), // history
  routes: routes.map(route => toRouteRecordRaw(route)),
})

/**
 * @author Qing
 * @description 挂载路由
 * @date 2025-01-10 14:56:59
 */
export function setupRouter(app: App) {
  // 挂载
  app.use(router)
  // 创建路由守卫
  createRouterGuards(router)
}

/**
 * @author Qing
 * @description 使用递归处理后端返回的路由数据
 * @date 2025-01-10 13:34:34
 */
export function generateRoutes(routes: IRouteDataRaw[], parentPath = '', level = 0): IRouteItem[] {
  return routes.map((route) => {
    const fullPath = generateFullPath(route.path, parentPath)
    const name = route.name || route.id
    /**
     * route.componentPath 为空的情况下
     * - 如果是一级路由，则使用默认布局组件
     * - 如果不是一级路由，则使用空组件
     */
    let componentPath: Component | null = null
    if (route.componentPath) {
      componentPath = loadView(route.componentPath)
    }
    else {
      componentPath = level === 0 ? loadView(DEFAULT_ROUTER_LAYOUT_COMPONENT_PATH) : null
    }
    const item: IRouteItem = {
      name,
      path: fullPath,
      component: componentPath,
      meta: generateMeta(fullPath, route),
    }
    // 处理重定向
    if (route.redirect && typeof route.redirect === 'string') {
      item.redirect = route.redirect.startsWith('/') ? route.redirect : normalizePath(`${fullPath}/${route.redirect}`)
    }
    // 处理子路由
    if (route.children && route.children.length > 0) {
      // 如果没有设置重定向，默认重定向到第一个子路由
      if (!item.redirect) {
        // 过滤掉path等于#和path不存在的路由
        const validChildren = route.children.filter(child =>
          child.path !== undefined // 必须存在 path 字段
          && child.path !== '#' // 排除#
          && child.path !== null, // 排除null
        )
        if (validChildren.length > 0) {
          const firstChild = validChildren[0]
          const firstChildPath = firstChild.path as string
          const redirectPath = firstChildPath.startsWith('/') ? firstChildPath : normalizePath(`${fullPath}/${firstChildPath}`)
          if (firstChild.query && Object.keys(firstChild.query).length > 0) {
            item.redirect = {
              path: redirectPath,
              query: firstChild.query,
            }
          }
          else {
            item.redirect = redirectPath
          }
        }
      }
      // 当只有一个子路由且该子路由的path为空字符串时，标记为单列菜单
      if (route.children[0].hideInMenu && route.children[0].path === '') {
        item.meta.singleMenu = true
      }
      // 递归处理子路由
      item.children = generateRoutes(route.children, fullPath, level + 1)
    }
    return item
  })
}

/**
 * @author Qing
 * @description 添加动态路由
 * @date 2025-01-10 14:57:32
 */
export function setupDynamicRoutes(data: IRouteDataRaw[] = []) {
  try {
    // 卸载所有路由
    removeAllRoutes()
    // 处理路由数据
    const accessRoutes = generateRoutes(data)
    const routermenus = [...accessRoutes, ...fixedRoutes]
    const asyncRouteStore = useAsyncRouteStore()
    asyncRouteStore.setRouterMenus(routermenus)
    console.info('输出路由数据：', routermenus)
    // 动态添加路由
    routermenus.forEach((route) => {
      // 判断是否已有该路由
      if (route.name && !router.hasRoute(route.name)) {
        router.addRoute(toRouteRecordRaw(route))
      }
    })
    // 最后添加 404 路由，如果 404 路由在一开始就存在，它会"吞噬"掉尚未加载的动态路由的匹配。最佳实践是：只有当所有合法路由都无法匹配时，才添加 404 路由。
    if (!router.hasRoute('NotFound')) {
      router.addRoute(toRouteRecordRaw(notFoundRoute as any))
    }
  }
  catch (error) {
    console.error('加载动态路由失败:', error)
    window.$message.error(`加载动态路由失败${error}`)
    throw error
  }
}

/**
 * @author Qing
 * @description 卸载所有路由，不移除固定路由
 * @date 2025-01-10 14:57:32
 */
export function removeAllRoutes() {
  const routes = router.getRoutes()
  routes.forEach((route) => {
    if (route.name && !route.meta.constant) {
      router.removeRoute(route.name)
    }
  })
}
