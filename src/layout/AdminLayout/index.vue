<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-01-26 21:22:26
 * @LastEditTime: 2025-07-21 14:45:24
-->
<script setup lang="ts">
import type { IWaterMarkOptions } from '@/directive/vBetterWaterMark/type'
import CONFIG from '@/settings'
import { useMenuStore } from '@/store/modules/menu'
import DrawerSider from './components/DrawerSider/index.vue'
import ExitMaximizationButton from './components/ExitMaximizationButton/index.vue'
import Header from './components/Header/index.vue'
import { themeLoadingStyles } from './components/NetworkRequest'
import SettingBtn from './components/SettingBtn/index.vue'
import Sider from './components/Sider/index.vue'
import SubMenu from './components/SubMenu/index.vue'
import TabsView from './components/TabsView/index.vue'
import ThemeSetting from './components/ThemeSetting/index.vue'

import TopHeader from './components/TopHeader/index.vue'

const asyncRouteStore = useAsyncRouteStore()
const globalStore = useGlobalStore()
const watermarkStore = useWatermarkStore()
const networkRequestStore = useNetworkRequestStore()
const tabsViewStore = useTabsViewStore()
const { isTablet, isDesktop, screenInfo, isMobile } = useResponsive()
const menuStore = useMenuStore()
const route = useRoute()

// 监听路由，同步 Store 状态
watch(
  () => route.fullPath,
  () => {
    menuStore.syncMenuWithRoute(route)
  },
  { immediate: true },
)

// 是否最大化
const isMaxComputed = computed(() => tabsViewStore.getIsMaximized)

// #region ➤ 页面元素显隐
// ================================================

const isShowSiderComputed = computed(() => {
  const isDesk = isTablet.value || isDesktop.value
  return isDesk && !isMaxComputed.value
})

const isShowHeaderComputed = computed(() => {
  return !isMaxComputed.value
})

// 移动端模式下的抽屉按钮
const isShowSiderBtnComputed = computed(() => {
  return isTablet.value || isMobile.value
})

const isShowTabsComputed = computed(() => {
  const isDesk = isTablet.value || isDesktop.value
  return isDesk && !isMaxComputed.value && CONFIG.tabbar.enable
})

// #endregion 页面元素显隐

// #region ➤ 侧边栏
// ================================================

// 是否显示侧边栏

watch(() => screenInfo.value, () => {
  if (isTablet.value || isDesktop.value) {
    menuStore.toggleCollapsed(false)
  }
})

const drawerSiderRef = ref<InstanceType<typeof DrawerSider> | null>(null)
// 提供给子组件的方法
function toggleDrawer(value?: boolean) {
  drawerSiderRef.value?.toggleVisible(value)
}
// #endregion 侧边栏

// #region ➤ 载入效果
// ================================================

const loadingComponent = computed(() => themeLoadingStyles.find(item => item.value === networkRequestStore.getThemeLoadingStyle)?.component)

// #endregion 载入效果

// #region ➤ 偏好设置
// ================================================
const themeSettingRef = ref<InstanceType<typeof ThemeSetting> | null>(null)

function openThemeSetting() {
  if (!themeSettingRef.value)
    return
  themeSettingRef.value.toggleDialog(true)
}

provide(ThemeSettingKey, { openThemeSetting })

// #endregion 偏好设置

// 全局水印
const markOptions = computed((): IWaterMarkOptions => {
  return Object.assign({}, { show: '', content: '' }, watermarkStore.watermarkConfig)
})
</script>

<template>
  <div v-waterMark="markOptions" class="wh-full">
    <!-- 移动端 -->
    <div v-if="isTablet || isMobile" class="wh-full flex">
      <!-- 内容 -->
      <div
        class="min-h-0 min-w-0 flex flex-1 flex-col bg-[var(--custom-admin-content-color)]"
        :native-scrollbar="false"
      >
        <!-- 头部 -->
        <Header v-show="isShowHeaderComputed" :show-sider="isShowSiderBtnComputed" @toggle-drawer="toggleDrawer" />
        <!-- 标签页 -->
        <TabsView v-show="isShowTabsComputed" />
        <!-- 内容 -->
        <div
          class="min-h-0 w-full flex-1 px-[var(--admin-content-padding)] pb-[var(--admin-content-padding)]"
          :class="{ 'pt-[var(--admin-content-padding)]': !isShowTabsComputed }"
        >
          <BScrollbar>
            <RouterView v-slot="{ Component, route }">
              <!-- 扩展多种路由切换动画，使用 Transition 后，页面需要保持单根 -->
              <Transition :name="globalStore.getTransitionName" mode="out-in" appear>
                <KeepAlive :include="asyncRouteStore.keepAliveRouterList">
                  <component :is="Component" :key="route.name" />
                </KeepAlive>
              </Transition>
            </RouterView>
          </BScrollbar>
        </div>
      </div>
    </div>
    <!-- 桌面端 -->
    <div v-else-if="globalStore.menu.mode === 'vertical-mixed'" class="wh-full flex">
      <!-- 侧边栏 -->
      <Sider v-show="isShowSiderComputed" />
      <!-- 右边菜单 -->
      <SubMenu v-show="isShowSiderComputed" />
      <!-- 内容 -->
      <div
        class="min-h-0 min-w-0 flex flex-1 flex-col bg-[var(--custom-admin-content-color)]"
        :native-scrollbar="false"
      >
        <!-- 头部 -->
        <Header v-show="isShowHeaderComputed" :show-sider="isShowSiderBtnComputed" @toggle-drawer="toggleDrawer" />
        <!-- 标签页 -->
        <TabsView v-show="isShowTabsComputed" />
        <!-- 内容 -->
        <div
          class="min-h-0 w-full flex-1 px-[var(--admin-content-padding)] pb-[var(--admin-content-padding)]"
          :class="{ 'pt-[var(--admin-content-padding)]': !isShowTabsComputed }"
        >
          <BScrollbar>
            <RouterView v-slot="{ Component, route }">
              <!-- 扩展多种路由切换动画，使用 Transition 后，页面需要保持单根 -->
              <Transition :name="globalStore.getTransitionName" mode="out-in" appear>
                <KeepAlive :include="asyncRouteStore.keepAliveRouterList">
                  <component :is="Component" :key="route.name" />
                </KeepAlive>
              </Transition>
            </RouterView>
          </BScrollbar>
        </div>
      </div>
    </div>
    <!-- 顶部模式 top -->
    <div v-else-if="globalStore.menu.mode === 'classic'" class="wh-full flex flex-col">
      <!-- 头部 -->
      <TopHeader></TopHeader>
      <!-- 内容 -->
      <div class="min-h-0 min-w-0 flex flex-1">
        <!-- 右边菜单 -->
        <SubMenu v-show="isShowSiderComputed" :show-title="false" />
        <div class="min-h-0 min-w-0 flex flex-1 flex-col">
          <!-- 标签页 -->
          <TabsView v-show="isShowTabsComputed" />
          <!-- 内容 -->
          <div
            class="min-h-0 w-full flex-1 px-[var(--admin-content-padding)] pb-[var(--admin-content-padding)]"
            :class="{ 'pt-[var(--admin-content-padding)]': !isShowTabsComputed }"
          >
            <BScrollbar>
              <RouterView v-slot="{ Component, route }">
                <!-- 扩展多种路由切换动画，使用 Transition 后，页面需要保持单根 -->
                <Transition :name="globalStore.getTransitionName" mode="out-in" appear>
                  <KeepAlive :include="asyncRouteStore.keepAliveRouterList">
                    <component :is="Component" :key="route.name" />
                  </KeepAlive>
                </Transition>
              </RouterView>
            </BScrollbar>
          </div>
        </div>
      </div>
    </div>
    <!-- 移动端抽屉 -->
    <DrawerSider ref="drawerSiderRef" />
    <!-- 设置 -->
    <SettingBtn></SettingBtn>
    <!-- 主题设置 -->
    <ThemeSetting ref="themeSettingRef" />
    <!-- 载入效果 -->
    <component :is="loadingComponent" />
    <!-- 最大化退出按钮 -->
    <ExitMaximizationButton v-show="isMaxComputed"></ExitMaximizationButton>
  </div>
</template>
