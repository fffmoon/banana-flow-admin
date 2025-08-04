<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-31 18:49:58
 * @LastEditTime: 2025-08-01 17:03:24
-->
<script lang='ts' setup>
import type { IRouteDataRaw, IRouteItem } from 'types/vue-router'
import { usePageJump } from '@/hooks/usePageJump'
import { router } from '@/router'
import { RedirectLayoutName, RedirectName } from '@/router/modules/fixedRoutes'
import { findRouterById, getRouterTopParent } from '@/router/utils'
import CONFIG from '@/settings'
import SubMenu from './SubMenu/index.vue'

interface IProps {
  // 是否显示折叠
  collapsed?: boolean
  // 隐藏菜单按钮
  hiddenMenuButton?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits(['toggleCollapsed', 'updateActiveMenuKey', 'updateSubMenuStatus'])
const route = useRoute()
const asyncRouteStore = useAsyncRouteStore()
const { goToShouldConfirm } = usePageJump(router)
const { t } = useLocale()

// #region ➤ 主菜单、一级菜单
// ================================================
// #
// Qing 2025-02-28 20:02:24
// ================================================

// 主菜单的id、一级菜单的id
const activeMainMenuId = ref<IRouteDataRaw['id'] | null>(null)
const subMenus = ref<IRouteItem[]>([])

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
    activeMainMenuId.value = topId
    subMenus.value = []
    return
  }
  activeMainMenuId.value = topId
  subMenus.value = menu.raw.children || []
}, { immediate: true })

// 主菜单列表
const mainMenuListComputed = computed(() => {
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
        activeMainMenuId.value = menu.meta?.id as string
        subMenus.value = menu.children || []
        emits('updateActiveMenuKey', { key: menu.meta?.id as string })
      },
    })
  }
  else {
    activeMainMenuId.value = menu.meta?.id as string
    subMenus.value = menu.children || []
  }
}
// #endregion
</script>

<template>
  <div class="sider-container h-100vh flex">
    <!-- 左边菜单 -->
    <div
      class="h-full flex flex-col b-r-1px b-r-[var(--custom-border-color)] b-r-solid"
      :style="{ width: `${CONFIG.menu.mainMenuWidth}px` }"
    >
      <!-- LOGE -->
      <div class="h-[var(--header-height)] w-full flex-center select-none">
        <!-- @/assets/logo.png -->
        <img
          draggable="false" class="h-40px w-40px cursor-pointer" src="https://img.dashixiong.asia/2025/04/7467aed7bd9c2a21ea4bcaf0916ae782.png"
          :alt="t('app.title')" :title="t('app.title')" @click="goToShouldConfirm('/')"
        />
      </div>
      <!-- 菜单 -->
      <BScrollbar class="flex-1" content-class=" h-full flex flex-1 flex-col gap-y-[var(--space-sm)] overflow-auto p-x-2">
        <div
          v-for="menu in mainMenuListComputed" :key="menu.meta?.id"
          class="group active:btn-active flex flex-center flex-col base-ani cursor-pointer select-none gap-4px rounded-[var(--custom-border-radius)] hover:btn-hover py-[var(--space-md)] color-[var(--custom-text-color-2)]"
          :class="{ '!btn-select': activeMainMenuId === menu.meta?.id }" @click="handleMainMenuClick(menu)"
        >
          <div
            class="icon-base--md transition-transform! duration-248! ease-in-out! group-hover:scale-115!"
            :class="menu.meta?.icon || 'i-mdi-dots-horizontal'"
          />
          <div class="text font-size-[var(--custom-font-size-medium)]">
            {{ menu.meta?.title }}
          </div>
        </div>
      </BScrollbar>
    </div>
    <!-- 右边菜单 -->
    <SubMenu
      :menus="subMenus" :collapsed="props.collapsed" :hidden-menu-button="props.hiddenMenuButton"
      @update-active-menu-key="(key) => emits('updateActiveMenuKey', key)"
      @update-sub-menu-status="(status) => emits('updateSubMenuStatus', status)"
      @toggle-collapsed="(collapsed) => emits('toggleCollapsed', collapsed)"
    />
  </div>
</template>
