import type { IRouteDataRaw, IRouteItem } from 'types/vue-router'
import type { VNodeChild } from 'vue'
import { NEllipsis } from 'naive-ui'
import { router } from '@/router'
import { RedirectLayoutName, RedirectName } from '@/router/modules/fixedRoutes'
import { findRouterById, flattenRoutes, getRouterTopParent } from '@/router/utils'

export function useMenuData() {
  const route = useRoute()
  const asyncRouteStore = useAsyncRouteStore()
  const { goToShouldConfirm } = usePageJump(router)
  // 主菜单的id、一级菜单的id
  const currentMainMenuId = ref<IRouteDataRaw['id'] | null>(null)
  const subMenus = ref<IRouteItem[]>([])

  // 主菜单列表
  const mainMenus = computed(() => {
    return asyncRouteStore.routerMenus.filter(ro => !ro.meta?.hideInMenu)
  })

  // 主菜单点击
  function handleMainMenuClick(menu: IRouteItem) {
    if (menu.meta?.singleMenu) {
      // 如果是单列菜单，直接跳转到第一个子路由或重定向路径
      let path
      if (menu.redirect) {
        path = menu.redirect
      }
      else if (menu.children && menu.children.length > 0) {
        path = menu.children[0].path
      }
      else {
        path = menu.path
      }
      goToShouldConfirm(path, {
        successCallback: () => {
          currentMainMenuId.value = menu.meta?.id as string
          subMenus.value = menu.children || []
        },
      })
    }
    else {
      currentMainMenuId.value = menu.meta?.id as string
      subMenus.value = menu.children || []
    }
  }

  // 监听路由变化，更新菜单选项
  watch(() => route.fullPath, () => {
    const id = route.meta.id as string
    const topId = getRouterTopParent(asyncRouteStore.routerMenus, id)
    if (!topId)
      return
    const menu = findRouterById(asyncRouteStore.routerMenus, topId)
    if (!menu)
      return
    // 如果当前页面是重定向页面，则返回之前的菜单，不向上汇报高度。
    if ((menu.raw.name === RedirectName || menu.raw.name === RedirectLayoutName)) {
      return
    }
    // 如果是单列菜单或没有子菜单，返回空数组
    if (menu.raw.meta?.singleMenu || !menu.raw.children?.length) {
      // console.log('如果是单列菜单或没有子菜单，返回空数组',);
      currentMainMenuId.value = topId
      subMenus.value = []
      return
    }
    currentMainMenuId.value = topId
    subMenus.value = menu.raw.children || []
  }, { immediate: true })

  /* 子菜单 */

  interface ICustomMenuOption {
    label: string | (() => VNodeChild)
    key: string
    route: string
    icon: () => Component
    children?: ICustomMenuOption[]
    activeMenu?: string
  }

  // 生成菜单选项，提供给我的菜单组件使用
  function generateMenuFromRoutes(menus: IRouteItem[]): ICustomMenuOption[] {
    const list: ICustomMenuOption[] = []
    menus.forEach((menu) => {
      if (menu.meta.hideInMenu)
        return

      // 处理子菜单
      let children: ICustomMenuOption[] | undefined

      // 如果不是单列菜单且有子路由，则处理子菜单
      if (menu.children && menu.children.length > 0) {
        // 过滤并生成子菜单
        const childMenus = generateMenuFromRoutes(menu.children)
        // 只有当有可见子菜单时才设置children
        if (childMenus.length > 0) {
          children = childMenus
        }
      }

      // 菜单标签
      let menuLabel

      // 处理外部链接
      // console.log('76', menu.meta?.link)
      if (menu.meta?.link) {
        menuLabel = () => h(
          'a',
          {
            href: menu.meta?.link || menu.path,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          { default: () => menu.meta?.title },
        )
      }
      // 处理分组菜单
      else if (!menu.path || menu.path === '#' || menu.path === '') {
        menuLabel = () => h('span', {}, { default: () => menu.meta?.title })
      }
      // 普通菜单项
      else {
        menuLabel = () => h(
          NEllipsis,
          {
            class: 'cursor-pointer',
          },
          { default: () => menu.meta?.title },
        )
      }

      // 构建菜单选项
      const option: ICustomMenuOption = {
        label: menuLabel,
        key: menu.meta?.id as string,
        route: menu.path,
        icon: useIconRenderer(menu.meta?.icon as string || 'i-mdi-dots-horizontal'),
        children,
      }

      // 添加额外属性
      if (menu.meta?.activeMenu) {
        option.activeMenu = menu.meta.activeMenu
      }
      list.push(option)
    })
    return list
  }

  const processedSubMenus = computed(() => {
    const list = generateMenuFromRoutes(subMenus.value)
    // console.info('生成子菜单', list)
    return list
  })

  // 用于高亮当前菜单
  const currentSubMenuId = ref('')

  // 更新菜单
  function updateActiveMenuFromRoute() {
    if (!route || !route.meta)
      return

    const id = route.meta.id as string
    // 如果是重定向路由，直接返回
    if (id === 'redirect-dynamic-route')
      return

    // 检查当前路由是否有指定的激活菜单
    const activeMenu = route.meta.activeMenu as string
    if (activeMenu) {
      // 查找对应的菜单项
      const menuItem = findMenuItemByPath(processedSubMenus.value, activeMenu)
      if (menuItem) {
        currentSubMenuId.value = menuItem.key
        return
      }
    }

    // 默认使用当前路由ID
    currentSubMenuId.value = id
  }

  /**
   * 根据path路径查找到菜单项，并且返回菜单项
   */
  function findMenuItemByPath(menuItems: ICustomMenuOption[], path: string): ICustomMenuOption | null {
    for (const item of menuItems) {
      if (item.route === path) {
        return item
      }
      if (item.children) {
        const found = findMenuItemByPath(item.children, path)
        if (found)
          return found
      }
    }
    return null
  }

  watchEffect(() => {
    updateActiveMenuFromRoute()
  })

  // 更新激活菜单
  function updateActiveSubMenuId(k: string) {
    // console.info('更新激活菜单', k)
    const fla = flattenRoutes(subMenus.value)
    const findRes = fla.find(item => item.raw.meta?.id === k)
    if (!findRes) {
      console.error('未找到路由', k)
      return
    }

    // 处理外部链接
    if (findRes.raw.meta?.link) {
      return
    }
    // 处理普通路由跳转
    goToShouldConfirm(findRes.raw.path, {
      successCallback: () => {
        currentSubMenuId.value = k
      },
    })
  }

  // #endregion 次要菜单

  // 是否折叠
  const collapsed = ref(false)

  // 切换折叠状态
  function toggleCollapsed(state: boolean) {
    collapsed.value = state
  }

  return {
    mainMenus,
    subMenus,
    currentMainMenuId,
    currentSubMenuId,
    processedSubMenus,
    handleMainMenuClick,
    updateActiveSubMenuId,
    updateActiveMenuFromRoute,
    collapsed,
    toggleCollapsed,
  }
}
