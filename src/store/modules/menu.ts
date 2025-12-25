import type { IRouteDataRaw, IRouteItem } from 'types/vue-router'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { usePageJump } from '@/hooks/usePageJump'
import { router } from '@/router'
import { RedirectLayoutName, RedirectName } from '@/router/modules/fixedRoutes'
import { findRouterById, flattenRoutes, getRouterTopParent } from '@/router/utils'
import { useAsyncRouteStore } from '@/store/modules/asyncRoute'

export const useMenuStore = defineStore('menu', () => {
  const asyncRouteStore = useAsyncRouteStore()
  const { goToShouldConfirm } = usePageJump(router)

  // #region ➤ state
  // ================================================
  // #
  // Qing 2025-12-25 10:33:38
  // ================================================

  const collapsed = ref(false) // 侧边栏折叠状态
  const currentMainMenuId = ref<IRouteDataRaw['id'] | null>(null) // 当前激活的一级菜单ID
  const currentSubMenuId = ref<string>('') // 当前激活的子菜单ID（用于高亮）

  // 缓存当前的子菜单列表，原始数据格式
  const subMenusRaw = ref<IRouteItem[]>([])

  // #region ➤ getters

  // ================================================
  // #
  // Qing 2025-12-25 10:34:19
  // ================================================

  // 主菜单列表 (从 asyncRouteStore 过滤)
  const mainMenus = computed(() => {
    return asyncRouteStore.routerMenus.filter(ro => !ro.meta?.hideInMenu)
  })

  // #endregion getters

  // #region ➤ actions
  // ================================================
  // #
  // Qing 2025-12-25 10:34:46
  // ================================================

  /** 切换折叠状态 */
  function toggleCollapsed(state?: boolean) {
    collapsed.value = state ?? !collapsed.value
  }

  /** 点击主菜单，处理混合导航逻辑 */
  function clickMainMenu(menu: IRouteItem) {
    // 逻辑复刻：如果是单列菜单，直接跳转
    if (menu.meta?.singleMenu) {
      let path = menu.path
      if (menu.redirect)
        path = menu.redirect as string
      else if (menu.children?.length)
        path = menu.children[0].path

      goToShouldConfirm(path, {
        successCallback: () => {
          setMainMenu(menu.meta?.id as string)
        },
      })
    }
    else {
      // 仅仅切换显示的子菜单，不跳转
      setMainMenu(menu.meta?.id as string)
    }
  }

  /** 设置当前主菜单，并计算对应的子菜单列表 */
  function setMainMenu(id: string) {
    currentMainMenuId.value = id
    // 从路由表中查找对应的子菜单
    const menu = mainMenus.value.find(item => item.meta?.id === id)
    subMenusRaw.value = menu?.children || []
  }

  /** 点击子菜单，跳转逻辑 */
  function clickSubMenu(key: string) {
    console.log('点击子菜单', key)
    const fla = flattenRoutes(subMenusRaw.value)
    const findRes = fla.find(item => item.raw.meta?.id === key)

    if (!findRes)
      return
    if (findRes.raw.meta?.link)
      return // 外部链接通常在渲染层处理，这里忽略或直接打开

    goToShouldConfirm(findRes.raw.path, {
      successCallback: () => {
        currentSubMenuId.value = key
      },
    })
  }

  /** 根据当前 URL 同步菜单状态 */
  function syncMenuWithRoute(route: any) {
    console.log('根据当前 URL 同步菜单状态')
    const id = route.meta.id as string
    if (!id)
      return

    // 1. 处理高亮子菜单 ID
    // 优先使用 meta.activeMenu，否则使用当前 ID
    const activeMenu = route.meta.activeMenu as string
    currentSubMenuId.value = activeMenu || id

    // 2. 处理主菜单归属 (自下而上查找)
    // 如果是重定向页面，不处理
    if (route.name === RedirectName || route.name === RedirectLayoutName)
      return

    const topId = getRouterTopParent(asyncRouteStore.routerMenus, id)
    if (!topId)
      return

    // 如果当前主菜单已经是这个，就不重复计算了
    if (currentMainMenuId.value === topId)
      return

    const menu = findRouterById(asyncRouteStore.routerMenus, topId)
    if (!menu)
      return

    // 如果是单列菜单，清空子菜单
    if (menu.raw.meta?.singleMenu || !menu.raw.children?.length) {
      currentMainMenuId.value = topId
      subMenusRaw.value = []
    }
    else {
      currentMainMenuId.value = topId
      subMenusRaw.value = menu.raw.children || []
    }
  }

  // #endregion actions

  return {
    collapsed,
    currentMainMenuId,
    currentSubMenuId,
    mainMenus,
    subMenusRaw,
    toggleCollapsed,
    clickMainMenu,
    clickSubMenu,
    syncMenuWithRoute,
  }
})
