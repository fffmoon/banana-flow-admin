/*
 * @Author: Qing
 * @Description: 异步路由 Store (Pinia Setup Store 模式)
 * @Date: 2025-02-26 23:25:21
 * @LastEditTime: 2025-07-31 13:23:12
 */

import type { IRouteDataRaw, IRouteItem } from 'types/vue-router'
import { API } from '@apis/index'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { setupDynamicRoutes } from '@/router'
import { localRoutesData } from '@/router/modules/localRoutes'
import { findRouterById } from '@/router/utils'
import { Storage } from '@/utils/storage/Storage'

export const useAsyncRouteStore = defineStore('asyncRoute', () => {
  // #region ➤ state
  // ================================================

  // 是否载入过路由
  const routesLoaded = ref(false)

  // 当前缓存的路由列表
  const keepAliveRouterList = ref<string[]>(Storage.get('keepAliveRouterList', []))

  // 路由菜单，用于 UI 展示 (侧边栏)
  const menus = ref<IRouteDataRaw[]>([])

  // 路由菜单，用于存储后端返回的原始数据 (Raw Data)
  const backendMenuList = ref<IRouteDataRaw[]>(Storage.get('backendMenuList', []))

  // 处理过后的路由菜单 (Vue Router 可用的结构)
  const routerMenus = ref<IRouteItem[]>([])

  // 路由版本号
  const routesVersion = ref<string | null>(Storage.get('routesVersion', null))

  // 上次更新时间
  const lastUpdated = ref(0)

  // #endregion state

  // #region ➤ actions
  // ================================================
  /**
   * 内部方法：执行合并与挂载逻辑
   * 无论是从 API 获取还是从缓存恢复，最终都走这里
   */
  function _generateRoutesAndMount() {
    // 本地静态配置 + 当前存储的后端数据
    const mergedMenus = [...localRoutesData, ...backendMenuList.value]

    // 更新用于展示的 menus
    menus.value = mergedMenus

    // 挂载路由
    setupDynamicRoutes(mergedMenus)
    routesLoaded.value = true
  }
  /**
   * 添加路由缓存
   */
  function addKeepAlive(id: string) {
    const route = findRouterById(routerMenus.value, id)
    if (!route || !route.raw.name)
      return

    if (!keepAliveRouterList.value.includes(route.raw.name)) {
      keepAliveRouterList.value.push(route.raw.name)
    }
  }

  /**
   * 删除路由缓存
   */
  function removeKeepAlive(id: string) {
    const route = findRouterById(routerMenus.value, id)
    if (!route || !route.raw.name)
      return

    keepAliveRouterList.value = keepAliveRouterList.value.filter(n => n !== route.raw.name)
  }

  /**
   * 处理后端返回的路由
   */
  async function handleRouterMenu(backendData: IRouteDataRaw[], version: string) {
    backendMenuList.value = backendData
    routesVersion.value = version

    // 触发合并挂载
    _generateRoutesAndMount()
  }

  /**
   * 初始化路由 (页面刷新/F5 时调用)
   */
  async function initRoutes() {
    if (routesLoaded.value)
      return

    // 触发合并挂载 (复用 Storage 里的 backendMenuList)
    _generateRoutesAndMount()
  }

  /**
   * 仅加载本地路由 (开发环境/兜底)
   */
  async function initLocalRoutes() {
    if (routesLoaded.value)
      return
    await handleRouterMenu([], 'local-dev-v1')
  }

  /**
   * 卸载路由
   */
  async function removeAllRoutes() {
    backendMenuList.value = []
    menus.value = []
    routesVersion.value = null
    // routesLoaded.value = false // 视业务需求，卸载后是否重置 loaded 状态
    setupDynamicRoutes([]) // 传入空数组即卸载
  }

  /**
   * 检查路由版本是否需要更新
   */
  async function checkRoutesUpdate() {
    // 环境变量通常是字符串，严谨判断
    if (!import.meta.env.VITE_DYNAMIC_ROUTE_SW)
      return false

    // 初始加载，无需更新，但视为已最新
    if (!routesVersion.value)
      return true

    // 10分钟内不重复检查
    const now = Date.now()
    if (now - lastUpdated.value < 1000 * 60 * 10) {
      return false
    }

    lastUpdated.value = now

    try {
      const { data } = await API.system.getRouteVersion()
      return data !== routesVersion.value
    }
    catch (error) {
      console.error(`获取路由版本号失败: ${error}`)
      return false
    }
  }

  /**
   * 获取主页路由
   * 跳过 hidden 的路由
   */
  function getHomeRoute() {
    if (routerMenus.value.length === 0)
      return null

    // 查找第一个不在菜单隐藏的路由
    const firstValidRoute = routerMenus.value.find(item => !item.meta?.hideInMenu)

    if (!firstValidRoute)
      return null

    // 如果该路由没有子路由，直接返回 ID
    if (!firstValidRoute.children || firstValidRoute.children.length === 0) {
      return firstValidRoute
    }

    // 如果有子路由，寻找第一个合法的子路由
    const validChild = firstValidRoute.children.find(child => !child.meta?.hideInMenu)
    return validChild || firstValidRoute
  }

  // #endregion actions

  // #region ➤ persistence
  // ================================================

  // 监听 menus 变化，自动存入 Storage
  watch(backendMenuList, (val) => {
    Storage.set('backendMenuList', val)
  }, { deep: true })

  // 监听 version 变化
  watch(routesVersion, (val) => {
    if (val)
      Storage.set('routesVersion', val)
    else Storage.remove('routesVersion')
  })

  // 监听 keepAlive 变化
  watch(keepAliveRouterList, (val) => {
    Storage.set('keepAliveRouterList', val)
  }, { deep: true })

  // #endregion

  return {
    // State
    routesLoaded,
    keepAliveRouterList,
    menus,
    backendMenuList,
    routerMenus,
    routesVersion,

    // Actions
    setRouterMenus: (val: IRouteItem[]) => { routerMenus.value = val },
    addKeepAlive,
    removeKeepAlive,
    handleRouterMenu,
    initRoutes,
    initLocalRoutes,
    removeAllRoutes,
    checkRoutesUpdate,
    getHomeRoute,
  }
})
