/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-26 23:25:21
 * @LastEditTime: 2025-07-31 13:23:12
 */
import type { IRouteDataRaw, IRouteItem } from 'types/vue-router'
import { API } from '@apis/index'
import { setupDynamicRoutes } from '@/router'
import { findRouterById } from '@/router/utils'
import { Storage } from '@/utils/storage/Storage'

interface AsyncRouteState {
  // 是否载入过路由
  routesLoaded: boolean
  // 当前缓存的路由列表
  keepAliveRouterList: string[]
  // 路由菜单，原始数据
  menus: IRouteDataRaw[]
  // 处理过后的路由菜单
  routerMenus: IRouteItem[]
  // 路由版本号
  routesVersion: string | null
  // 上次更新时间
  lastUpdated: number
}

export const useAsyncRouteStore = defineStore('asyncRoute', {
  state: (): AsyncRouteState => ({
    routesLoaded: false,
    keepAliveRouterList: Storage.get('keepAliveRouterList', []),
    menus: Storage.get('menus', []),
    routerMenus: [],
    routesVersion: Storage.get('routesVersion', null),
    lastUpdated: 0,
  }),
  getters: {
    getKeepAliveRouterList(): AsyncRouteState['keepAliveRouterList'] {
      return this.keepAliveRouterList
    },
  },
  actions: {
    setRoutesLoaded(value: boolean) {
      this.routesLoaded = value
    },
    setRoutesVersion(version: string) {
      this.routesVersion = version
      Storage.set('routesVersion', version)
    },
    clearRoutesVersion() {
      this.routesVersion = null
      Storage.remove('routesVersion')
    },
    setMenus(menus: IRouteDataRaw[]) {
      this.menus = menus
      Storage.set('menus', menus)
    },
    setRouterMenus(menus: IRouteItem[]) {
      this.routerMenus = menus
    },
    // 添加路由缓存
    addKeepAlive(id: string) {
      const route = findRouterById(this.routerMenus, id)
      if (!route)
        return
      if (!this.keepAliveRouterList.includes(route.raw.name)) {
        this.keepAliveRouterList.push(route.raw.name)
      }
    },
    // 删除路由缓存
    removeKeepAlive(id: string) {
      const route = findRouterById(this.routerMenus, id)
      if (!route)
        return
      this.keepAliveRouterList = this.keepAliveRouterList.filter(n => n !== route.raw.name)
    },
    /**
     * @description 处理路由，将后台的原始路由数据转化为前端可用的路由
     * @author Qing
     * @param {IRouteDataRaw[]} menus 原始路由数据
     * @param {string} version 路由的版本号
     * @date 2025-07-30 13:58:34
     */
    async handleRouterMenu(menus: IRouteDataRaw[], version: string) {
      this.setMenus(menus)
      this.setRoutesVersion(version)
      this.setRoutesLoaded(true)
      setupDynamicRoutes(menus)
    },
    // 卸载路由
    async removeAllRoutes() {
      this.setMenus([])
      this.clearRoutesVersion()
      setupDynamicRoutes()
    },
    // 检查路由版本是否需要更新
    async checkRoutesUpdate() {
      // 初始加载
      if (!this.routesVersion)
        return true

      // 10分钟内不重复检查
      if (Date.now() - this.lastUpdated < (1000 * 60) * 10)
        return false
      this.lastUpdated = Date.now()
      try {
        const { data } = await API.system.getRouteVersion()
        return data !== this.routesVersion
      }
      catch (error) {
        console.error(`获取路由版本号失败。错误详情：${error}`)
        return false
      }
    },
    /**
     * @description 获取主页的路由id
     * @author Qing
     * @return {*}
     * @date 2025-05-07 09:57:50
     */
    getHomeRouteId() {
      if (this.routerMenus.length === 0) {
        return null
      }
      const firstRouter = this.routerMenus[0]
      if (!firstRouter.children || firstRouter.children.length === 0) {
        return firstRouter.meta.id
      }
      return firstRouter.children[0].meta.id
    },
  },
})
