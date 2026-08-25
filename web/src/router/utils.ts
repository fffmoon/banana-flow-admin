import type { IFlatRouteItem, IRouteDataRaw, IRouteItem, IRouteMeta } from 'types/vue-router'
import type {
  RouteRecordRaw,
} from 'vue-router'

type AsyncComponentLoader = () => Promise<{ default: Component }>

const viewModules = import.meta.glob('@/views/**/*.vue')
const layoutModules = import.meta.glob('@/layout/**/*.vue')
const modules = { ...viewModules, ...layoutModules }

/**
 * @author Qing
 * @description 动态导入组件
 * @date 2025-01-10 13:33:45
 */
export function loadView(view: string, componentName?: string): () => Promise<Component> {
  // 处理 componentPath 前缀/后缀，容错
  let cleanPath = view
  if (cleanPath.startsWith('/'))
    cleanPath = cleanPath.slice(1) // 去掉开头的 /
  if (cleanPath.startsWith('src/'))
    cleanPath = cleanPath.replace('src/', '')

  // 尝试几种可能的后缀
  const possiblePaths = [
    `/src/${cleanPath}.vue`,
    `/src/${cleanPath}.tsx`,
    `/src/${cleanPath}/index.vue`,
    `/src/views/${cleanPath}.vue`,
    `/src/views/${cleanPath}.tsx`,
    `/src/views/${cleanPath}/index.vue`,
  ]

  const finalPath = possiblePaths.find(p => p in modules)

  /* // DOTO：后续添加如果没找到，尝试模糊匹配
  if (!finalPath) {
    // 降级处理
  } */

  if (!finalPath) {
    console.error(`路由组件 ${view} 未找到，尝试寻找路径: ${possiblePaths.join(' 或 ')}`)
    return () => import('@/views/exception/index.vue')
  }

  return () => {
    const moduleLoader = modules[finalPath!] as unknown as AsyncComponentLoader
    return moduleLoader().then((component: { default: Component }) => {
      if (componentName) {
        (component.default as { name?: string }).name = componentName
      }
      return component
    })
  }
}

/**
 * 将路径转换为大驼峰命名
 */
export function pathToName(url: string) {
  const str = url
    // 处理路径分隔符和连字符
    .split(/[/-]/g)
    // 处理每部分命名
    .map(part =>
      part
        // 首字母大写
        .replace(/^./, c => c.toUpperCase())
        // 处理特殊符号后的字母大写（如 user_name → UserName）
        .replace(/[^a-z0-9]+(.)/gi, (_, c) => c.toUpperCase()),
    )
    .join('')

  return str
}

/**
 * 需要时转换为 RouteRecordRaw
 */
export function toRouteRecordRaw(route: IRouteItem): RouteRecordRaw {
  return route as unknown as RouteRecordRaw
}

/**
 * @author Qing
 * @description 规范化路径：去除多余斜杠并处理末尾斜杠
 * @param {string} path - 需要处理的路径
 * @param {boolean} keepTrailingSlash - 是否保留末尾斜杠，默认不保留
 * @returns {string} - 处理后的路径
 */
export function normalizePath(path, keepTrailingSlash = false) {
  if (!path)
    return ''

  // 处理根路径特殊情况
  if (path === '/')
    return '/'

  // 替换连续的斜杠为单个斜杠
  let normalized = path.replace(/\/+/g, '/')

  // 处理末尾斜杠
  if (!keepTrailingSlash) {
    normalized = normalized.replace(/\/+$/, '')
  }
  else if (!normalized.endsWith('/')) {
    // 如果需要保留末尾斜杠但没有，则添加
    normalized += '/'
  }

  // 如果中间有#号，去掉#号
  normalized = normalized.replace(/#+/g, '')

  return normalized
}

/**
 * @author Qing
 * @description 生成Meta
 * @date 2025-01-10 14:57:32
 */
export function generateMeta(path: string, route: IRouteDataRaw): IRouteMeta {
  return {
    title: route.title,
    path,
    icon: route.icon,
    id: route.id,
    name: route.name,
    auth: route.auth === undefined ? [] : route.auth,
    keepAlive: route.keepAlive === undefined ? false : route.keepAlive,
    hideInMenu: route.hideInMenu === undefined ? false : route.hideInMenu,
    singleMenu: route.singleMenu === undefined ? false : route.singleMenu,
    link: route.link,
    hideBreadcrumb: route.hideBreadcrumb === undefined ? false : route.hideBreadcrumb,
    isLogin: route.isLogin === undefined ? false : route.isLogin,
    query: route.query === undefined ? {} : route.query,
  }
}

/**
 * @author Qing
 * @description 计算完整路径（用于meta和生成名称）
 * @date 2025-01-10 14:57:32
 */
export function generateFullPath(path: string, parentPath: string): string {
  if (!path)
    return parentPath
  if (path.startsWith('http'))
    return path // 外链
  if (path.startsWith('/'))
    return normalizePath(path)
  return normalizePath(`${parentPath}/${path}`)
}

/**
 * @author Qing
 * @description 将嵌套路由结构拍扁为扁平数组
 * @param routes 嵌套路由数组
 * @param parents 父路由ID路径（内部递归使用）
 * @param depth 当前路由深度（内部递归使用）
 * @returns 扁平化路由数组
 */
export function flattenRoutes(
  routes: IRouteItem[],
  parents: string[] = [],
  depth: number = 0,
): IFlatRouteItem[] {
  const flatRoutes: IFlatRouteItem[] = []

  for (const route of routes) {
    // 创建当前路由的扁平对象
    const currentRoute: IFlatRouteItem = {
      id: route.meta.id as string,
      raw: route,
      parents: [...parents],
      depth,
    }

    flatRoutes.push(currentRoute)

    // 处理子路由
    const { children } = route
    if (children && children.length > 0) {
      const nextParents = [...parents]
      if (route.meta.id) {
        nextParents.push(route.meta.id)
      }
      const childrenRoutes = flattenRoutes(children, nextParents, depth + 1)
      flatRoutes.push(...childrenRoutes)
    }
  }

  return flatRoutes
}

/**
 * @author Qing
 * @description 根据路由ID查找路由
 * @param routes 路由数组
 * @param id 路由ID
 * @returns 找到的路由对象或 undefined
 */
export function findRouterById(routes: IRouteItem[], id: string) {
  if (!id)
    return undefined
  const flatRoutes = flattenRoutes(routes)
  return flatRoutes.find(item => item.id === id)
}

/**
 * @author Qing
 * @description 根据路由ID查找路由的顶部父路由
 * @param routes 路由数组
 * @param id 路由ID
 * @returns 找到的路由对象的id或者null
 */
export function getRouterTopParent(routes: IRouteItem[], id: string) {
  const router = findRouterById(routes, id)
  if (!router || router.parents.length === 0)
    return null
  return router.parents[0]
}
