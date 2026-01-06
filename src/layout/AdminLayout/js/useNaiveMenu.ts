import type { IRouteItem } from 'types/vue-router'
import type { Component, VNodeChild } from 'vue'
import { NEllipsis } from 'naive-ui'
import { computed, h } from 'vue'
import { useIconRenderer } from '@/hooks/useIconRenderer'
// import { useMenuStore } from '@/store/modules/menu'

// 定义 Naive UI 菜单需要的类型
interface INaiveMenuOption {
  label: string | (() => VNodeChild)
  key: string
  route: string // 自定义字段，方便查找
  icon?: () => Component
  children?: INaiveMenuOption[]
}

export function useNaiveMenu() {
  const menuStore = useMenuStore()

  // 递归转换函数：RouteItem -> NaiveMenuOption
  function transformRouteToOption(routes: IRouteItem[]): INaiveMenuOption[] {
    const list: INaiveMenuOption[] = []

    routes.forEach((menu) => {
      if (menu.meta?.hideInMenu)
        return

      // 1. 递归处理子集
      let children: INaiveMenuOption[] | undefined
      if (menu.children?.length) {
        const childOptions = transformRouteToOption(menu.children)
        if (childOptions.length > 0) {
          children = childOptions
        }
      }

      // 2. 处理 Label 渲染 (核心 UI 逻辑)
      let menuLabel
      if (menu.meta?.link) {
        // 外部链接
        menuLabel = () => h('a', {
          href: menu.meta.link,
          target: '_blank',
          rel: 'noopener noreferrer',
          onClick: e => e.stopPropagation(), // 防止触发路由跳转
        }, { default: () => menu.meta?.title })
      }
      else if (!menu.path || menu.path === '#') {
        // 分组标题
        menuLabel = () => h('span', null, { default: () => menu.meta?.title })
      }
      else {
        // 普通菜单 - 使用 NaiveUI 的省略组件
        menuLabel = () => h(NEllipsis, null, { default: () => menu.meta?.title })
      }

      list.push({
        label: menuLabel,
        key: menu.meta?.id as string,
        route: menu.path,
        icon: useIconRenderer(menu.meta?.icon as string || 'i-mdi-dots-horizontal'),
        children,
      })
    })

    return list
  }

  // 计算属性：当 Store 中的原始数据变化时，自动重新生成 UI 结构
  const naiveMainMenus = computed(() => {
    return transformRouteToOption(menuStore.mainMenus)
  })

  const naiveSubMenus = computed(() => {
    return transformRouteToOption(menuStore.subMenusRaw)
  })

  return {
    naiveMainMenus,
    naiveSubMenus,
  }
}
