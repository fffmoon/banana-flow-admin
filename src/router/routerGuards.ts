/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-09-03 09:42:22
 * @LastEditTime: 2025-10-25 22:04:06
 */
import type { Router } from 'vue-router'
import CONFIG from '@/settings'

export function createRouterGuards(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    // 开始加载条
    if (CONFIG.app.enableProgress) {
      const loadingBar = window.$loadingBar
      loadingBar.start()
    }
    // 设置标题
    if (CONFIG.app.enableDynamicTitle) {
      document.title = (to?.meta?.title as string) || document.title
    }
    // 动态路由
    const userStore = useUserStore()
    const asyncRouteStore = useAsyncRouteStore()
    // 如果没有载入过路由，先载入一次路由
    if (!asyncRouteStore.routesLoaded) {
      await asyncRouteStore.initRoutes()
      return next({
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true,
      })
    }
    // 如果是系统错误，则直接放行
    if (to.name === 'ServerError') {
      return next()
    }
    // 如果需要更新，则从接口获取路由，如果获取更新失败，则跳转到错误页面
    const needUpdate = await asyncRouteStore.checkRoutesUpdate()
    if (needUpdate) {
      try {
        await userStore.getPermMenu()
        return next({
          path: to.path,
          query: to.query,
          hash: to.hash,
          replace: true,
        })
      }
      catch (error) {
        console.error(error)
        return next({
          name: 'ServerError',
          query: {
            msg: '获取权限菜单失败，这通常是网络问题，请点击重试',
          },
        })
      }
    }
    // 当用户进入 / 页面，如果用户没有token，则前往登录页面，如果用户有token，则前往路由第一个。
    if (to.path === '/') {
      if (!userStore.getToken) {
        next({ path: '/user/login' })
      }
      else {
        next({ path: asyncRouteStore.getHomeRoute()?.path || asyncRouteStore.routerMenus[0].path || '/' })
      }
    }
    // 权限路由
    // 如果路由需要权限验证，并且用户没有token，则前往登录页
    if (to.meta?.isLogin) {
      if (!userStore.getToken) {
        console.info('无权访问，跳回登录页')
        next({ path: '/user/login' })
      }
    }
    next()
  })

  router.afterEach((to) => {
    // 将需要缓存的页面添加到缓存中，只有meta.keepAlive为true的页面才会被缓存
    const asyncRouteStore = useAsyncRouteStore()
    if (to.name && to.meta?.keepAlive) {
      if (!asyncRouteStore.keepAliveRouterList.find(i => i === to.meta.id)) {
        asyncRouteStore.addKeepAlive(to.meta?.id as string)
      }
    }
    // 结束加载条
    if (CONFIG.app.enableProgress) {
      const loadingBar = window.$loadingBar
      loadingBar.finish()
    }
  })

  router.onError(() => {
    // 结束加载条并显示错误
    if (CONFIG.app.enableProgress) {
      const loadingBar = window.$loadingBar
      loadingBar.error()
    }
  })
}
