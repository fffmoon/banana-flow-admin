<script setup lang="ts">
import CONFIG from '@/settings'
import AppMain from '../common/AppMain.vue'
import TopHeader from '../modules/Header/TopHeader.vue'
import SubMenu from '../modules/Sider/SubMenu.vue'
import TabsView from '../modules/TabsView/index.vue'

const tabsViewStore = useTabsViewStore()

const isMaxComputed = computed(() => tabsViewStore.getIsMaximized)
const isShowTabsComputed = computed(() => !isMaxComputed.value && CONFIG.tabbar.enable)
</script>

<template>
  <div class="wh-full flex flex-col">
    <!-- 头部 -->
    <TopHeader v-show="!isMaxComputed" />

    <!-- 中间内容 -->
    <div class="min-h-0 min-w-0 flex flex-1">
      <!-- 左侧菜单 -->
      <SubMenu v-show="!isMaxComputed" :show-title="false" />

      <div
        class="min-h-0 min-w-0 flex flex-1 flex-col bg-[var(--custom-admin-content-color)]"
        :native-scrollbar="false"
      >
        <!-- 标签页 -->
        <TabsView v-show="isShowTabsComputed" />
        <!-- 主要内容区 -->
        <AppMain :show-tabs="isShowTabsComputed" />
      </div>
    </div>
  </div>
</template>
