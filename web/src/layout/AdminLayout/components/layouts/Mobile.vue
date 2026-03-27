<script setup lang="ts">
import Header from '../modules/Header/index.vue'
import TabsView from '../modules/TabsView/index.vue'
import AppMain from '../common/AppMain.vue'
import DrawerSider from '../modules/Sider/DrawerSider.vue'
import CONFIG from '@/settings'

const tabsViewStore = useTabsViewStore()

const isMaxComputed = computed(() => tabsViewStore.getIsMaximized)
const isShowTabsComputed = computed(() => !isMaxComputed.value && CONFIG.tabbar.enable)
</script>

<template>
    <div class="wh-full flex">
        <div class="min-h-0 min-w-0 flex flex-1 flex-col bg-[var(--custom-admin-content-color)]"
            :native-scrollbar="false">
            <!-- 头部 -->
            <Header v-show="!isMaxComputed" :show-sider="true" />

            <TabsView v-show="isShowTabsComputed" />

            <AppMain :show-tabs="isShowTabsComputed" />
        </div>
        <!-- 移动端抽屉 -->
        <DrawerSider />
    </div>
</template>