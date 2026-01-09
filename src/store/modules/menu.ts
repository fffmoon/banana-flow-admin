import type { IRouteItem } from 'types/vue-router'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { usePageJump } from '@/hooks/usePageJump'
import { router } from '@/router'
import { RedirectLayoutName, RedirectName } from '@/router/modules/fixedRoutes'
import { findRouterById, flattenRoutes, getRouterTopParent } from '@/router/utils'
import CONFIG from '@/settings'
import { useAsyncRouteStore } from '@/store/modules/asyncRoute'

export const useMenuStore = defineStore('menu', () => {
  const asyncRouteStore = useAsyncRouteStore()
  const { goToShouldConfirm } = usePageJump(router)

  // #region ➤ state
  const collapsed = ref(false)

  // 当前高亮的菜单 Key
  const activeMenuKey = ref<string>('')

  // 双栏模式，当前选中的一级菜单 ID
  const currentMixMainId = ref<string>('')

  // 双栏模式，当前显示的二级菜单列表
  const mixedExtraMenus = ref<IRouteItem[]>([])

  // 移动端抽屉显示状态
  const mobileDrawerVisible = ref(false)

  // #endregion

  // #region ➤ getters

  // 完整菜单树
  const allMenus = computed(() => {
    return asyncRouteStore.routerMenus.filter(ro => !ro.meta?.hideInMenu)
  })

  // 双栏模式 - 顶部一级菜单
  const mixMainMenus = computed(() => {
    return allMenus.value // 后续扩展
  })

  // 计算侧边栏宽度
  const currentWidth = computed(() => `${collapsed.value ? CONFIG.menu.collapsedWidth : CONFIG.menu.subMenuWidth}px`)

  // #endregion

  // #region ➤ actions

  function toggleCollapsed(state?: boolean) {
    collapsed.value = state ?? !collapsed.value
  }

  function setMobileDrawer(state: boolean) {
    mobileDrawerVisible.value = state
  }

  /**
   * 统一路由同步逻辑
   */
  function syncMenuWithRoute(route: any) {
    if (route.name === RedirectName || route.name === RedirectLayoutName)
      return

    const id = route.meta?.id as string
    if (!id)
      return

    // --- 计算高亮 Key ---
    // 优先取 meta.activeMenu，其次判断是否属于 singleMenu 的子级，最后取自身 ID
    let targetKey = route.meta?.activeMenu || id

    // 查找当前路由在路由表中的完整信息，用于判断 singleMenu
    const allRoutesFlat = flattenRoutes(asyncRouteStore.routerMenus)
    const currentRouteItem = allRoutesFlat.find(item => item.raw.meta?.id === id)

    // 如果当前路由的父级是 singleMenu，则高亮必须强制指向父级 ID
    // 这样 Sidebar 渲染父级节点时，才能匹配上 active-key
    if (currentRouteItem) {
      const parentId = getRouterTopParent(asyncRouteStore.routerMenus, id)
      if (!parentId)
        return
      const parentMenu = findRouterById(asyncRouteStore.routerMenus, parentId)

      // 如果顶层父级是 singleMenu，且当前不在 Mixed 模式的顶部点击场景
      if (parentMenu && parentMenu.raw.meta?.singleMenu) {
        targetKey = parentMenu.raw.meta?.id as string
      }
    }

    activeMenuKey.value = targetKey

    // --- 处理双栏模式 ---
    const topId = getRouterTopParent(asyncRouteStore.routerMenus, id) || id

    // 防止重复计算
    if (currentMixMainId.value !== topId) {
      currentMixMainId.value = topId
      const menu = findRouterById(asyncRouteStore.routerMenus, topId)

      // 如果是 singleMenu 或者是没有子级的菜单，混合模式的侧边栏应为空
      if (!menu || menu.raw.meta?.singleMenu || !menu.raw.children?.length) {
        mixedExtraMenus.value = []
      }
      else {
        mixedExtraMenus.value = menu.raw.children || []
      }
    }
  }

  /** 点击主菜单 (双栏模式顶部) */
  function clickMixMainMenu(menu: IRouteItem) {
    const menuId = menu.meta?.id as string

    // 如果是单个菜单，直接跳转
    if (menu.meta?.singleMenu) {
      const path = menu.redirect || menu.path
      goToShouldConfirm(path as string, {
        successCallback: () => {
          currentMixMainId.value = menuId
          mixedExtraMenus.value = []
          mobileDrawerVisible.value = false
        },
      })
    }
    else {
      // 展开子菜单
      currentMixMainId.value = menuId
      mixedExtraMenus.value = menu.children || []
      // DOTO: 后续可以扩展自动跳转到第一个子菜单
    }
  }

  /** 点击菜单项 (通用) */
  function clickMenu(key: string) {
    const fla = flattenRoutes(asyncRouteStore.routerMenus)
    const findRes = fla.find(item => item.raw.meta?.id === key)

    if (!findRes || findRes.raw.meta?.link)
      return

    goToShouldConfirm(findRes.raw.path, {
      successCallback: () => {
        activeMenuKey.value = key
        mobileDrawerVisible.value = false
      },
    })
  }

  // #endregion

  return {
    collapsed,
    activeMenuKey,
    currentMixMainId,
    mobileDrawerVisible,
    currentWidth,
    allMenus, // 单栏模式用
    mixMainMenus, // 双栏模式顶部用
    mixedExtraMenus, // 双栏模式侧边用
    setMobileDrawer,
    toggleCollapsed,
    clickMixMainMenu,
    clickMenu,
    syncMenuWithRoute,
  }
})
