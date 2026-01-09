import type { IRouteItem } from 'types/vue-router'
import type { Component, VNodeChild } from 'vue'
import { NEllipsis } from 'naive-ui'
import { computed, h } from 'vue'
import { useIconRenderer } from '@/hooks/useIconRenderer'
import { useMenuStore } from '@/store/modules/menu'

interface INaiveMenuOption {
  label: string | (() => VNodeChild)
  key: string
  route: string
  icon?: () => Component
  children?: INaiveMenuOption[]
}

export function useNaiveMenu() {
  const menuStore = useMenuStore()

  function transformRouteToOption(routes: IRouteItem[]): INaiveMenuOption[] {
    const list: INaiveMenuOption[] = []

    routes.forEach((menu) => {
      if (menu.meta?.hideInMenu)
        return

      // 如果配置了 singleMenu，强制不渲染 children，把它当做叶子节点
      const isSingle = menu.meta?.singleMenu

      let children: INaiveMenuOption[] | undefined
      if (!isSingle && menu.children?.length) {
        const childOptions = transformRouteToOption(menu.children)
        if (childOptions.length > 0) {
          children = childOptions
        }
      }

      // Label 渲染逻辑
      let menuLabel
      if (menu.meta?.link) {
        menuLabel = () => h('a', {
          href: menu.meta.link,
          target: '_blank',
          rel: 'noopener noreferrer',
          onClick: e => e.stopPropagation(),
        }, { default: () => menu.meta?.title })
      }
      else if (!menu.path || menu.path === '#') {
        menuLabel = () => h('span', null, { default: () => menu.meta?.title })
      }
      else {
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

  // 单栏模式：使用完整的菜单树
  const naiveAllMenus = computed(() => {
    return transformRouteToOption(menuStore.allMenus)
  })

  // 双栏模式：侧边栏使用 mixedExtraMenus
  const naiveMixSubMenus = computed(() => {
    return transformRouteToOption(menuStore.mixedExtraMenus)
  })

  return {
    naiveAllMenus,
    naiveMixSubMenus,
  }
}
