<!-- src/layout/AdminLayout/index.vue -->
<script setup lang="ts">
import type { IWaterMarkOptions } from '@/directive/vBetterWaterMark/type'
import { defineAsyncComponent, computed, watch, ref, provide } from 'vue'

import SearchModalProvider from './components/features/SearchModal/SearchModalProvider.vue'
import ThemeSetting from './components/features/ThemeSetting/index.vue'
import SettingBtn from './components/features/SettingBtn/index.vue'
import ExitMaximizationButton from './components/features/ExitMaximization/index.vue'
import { themeLoadingStyles } from './components/features/NetworkRequest'

const LayoutMobile = defineAsyncComponent(() => import('./components/layouts/Mobile.vue'))
const LayoutVerticalMixed = defineAsyncComponent(() => import('./components/layouts/VerticalMixed.vue'))
const LayoutClassic = defineAsyncComponent(() => import('./components/layouts/Classic.vue'))
const LayoutSidebar = defineAsyncComponent(() => import('./components/layouts/Sidebar.vue'))

const globalStore = useGlobalStore()
const watermarkStore = useWatermarkStore()
const networkRequestStore = useNetworkRequestStore()
const tabsViewStore = useTabsViewStore()
const menuStore = useMenuStore()
const route = useRoute()
const { isTablet, isDesktop, screenInfo, isMobile } = useResponsive()

watch(
  () => route.fullPath,
  () => menuStore.syncMenuWithRoute(route),
  { immediate: true }
)

// 屏幕尺寸变化时自动展开菜单
watch(() => screenInfo.value, () => {
  if (isTablet.value || isDesktop.value) {
    menuStore.toggleCollapsed(false)
  }
})

// 动态选择布局组件
const currentLayout = computed(() => {
  // 移动端优先
  if (isTablet.value || isMobile.value) {
    return LayoutMobile
  }

  // 根据配置返回对应 PC 端布局
  switch (globalStore.menu.mode) {
    case 'vertical-mixed': return LayoutVerticalMixed
    case 'classic': return LayoutClassic
    case 'sidebar': return LayoutSidebar
    default: return LayoutVerticalMixed
  }
})

// #region ➤ 全局功能配置
// ================================================

const isMaxComputed = computed(() => tabsViewStore.getIsMaximized)

// Loading 组件
const loadingComponent = computed(() =>
  themeLoadingStyles.find(item => item.value === networkRequestStore.getThemeLoadingStyle)?.component
)

// 主题设置 Provider
const themeSettingRef = ref<InstanceType<typeof ThemeSetting> | null>(null)
function openThemeSetting() {
  themeSettingRef.value?.toggleDialog(true)
}
provide(ThemeSettingKey, { openThemeSetting })

// 水印配置
const markOptions = computed((): IWaterMarkOptions => {
  return Object.assign({}, { show: '', content: '' }, watermarkStore.watermarkConfig)
})

// #endregion 全局功能配置
</script>

<template>
  <SearchModalProvider>
    <div v-waterMark="markOptions" class="wh-full">

      <!-- 动态渲染当前布局 -->
      <component :is="currentLayout" />

      <!-- 全局功能 -->
      <SettingBtn />
      <ThemeSetting ref="themeSettingRef" />
      <component :is="loadingComponent" />
      <ExitMaximizationButton v-show="isMaxComputed" />

    </div>
  </SearchModalProvider>
</template>