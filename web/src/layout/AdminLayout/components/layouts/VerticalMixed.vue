<script setup lang="ts">
import Sider from '../modules/Sider/index.vue'
import SubMenu from '../modules/Sider/SubMenu.vue'
import Header from '../modules/Header/index.vue'
import TabsView from '../modules/TabsView/index.vue'
import AppMain from '../common/AppMain.vue'
import CONFIG from '@/settings'

const tabsViewStore = useTabsViewStore()
const globalStore = useGlobalStore()

// 显隐逻辑可以移入组件内部、通过 props 接收
const isMaxComputed = computed(() => tabsViewStore.getIsMaximized)
const isShowTabsComputed = computed(() => !isMaxComputed.value && CONFIG.tabbar.enable)
</script>

<template>
    <div class="wh-full flex">
        <!-- 侧边栏 -->
        <Sider v-show="!isMaxComputed" />
        <!-- 右边菜单 -->
        <SubMenu v-show="!isMaxComputed" />

        <!-- 最右边内容 -->
        <div class="min-h-0 min-w-0 flex flex-1 flex-col bg-[var(--custom-admin-content-color)]"
            :native-scrollbar="false">
            <!-- 头部 -->
            <Header v-show="!isMaxComputed" :show-sider="false" />
            <!-- 标签页 -->
            <TabsView v-show="isShowTabsComputed" />
            <!-- 主要内容区 -->
            <AppMain :show-tabs="isShowTabsComputed" />
        </div>
    </div>
</template>