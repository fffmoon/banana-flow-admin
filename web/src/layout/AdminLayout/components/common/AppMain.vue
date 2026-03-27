<!-- components/common/AppMain.vue -->
<script setup lang="ts">
import { useGlobalStore } from '@/store/modules/global'
import { useAsyncRouteStore } from '@/store/modules/asyncRoute'
import { RouteLocationNormalizedLoaded } from 'vue-router'

const globalStore = useGlobalStore()
const asyncRouteStore = useAsyncRouteStore()

const wrapperMap = new Map<string, Component>()

/**
 * 动态组件包装器
 */
const wrapComponent = (component: Component, route: RouteLocationNormalizedLoaded) => {
    if (!component) return

    // 获取当前路由生成的唯一 Name
    const wrapperName = route.name as string
    if (!wrapperName) return component

    // 如果已经包装过，直接返回缓存。TODO：热更新时可能需要特殊处理
    if (wrapperMap.has(wrapperName)) {
        return wrapperMap.get(wrapperName)!
    }

    // 创建包装组件
    const wrapper = {
        name: wrapperName,
        render: () => h(component)
    }

    // 存入缓存
    wrapperMap.set(wrapperName, wrapper)
    return wrapper
}

defineProps<{
    showTabs?: boolean
}>()
</script>

<template>
    <div class="min-h-0 w-full flex-1 px-[var(--admin-content-padding)] pb-[var(--admin-content-padding)]"
        :class="{ 'pt-[var(--admin-content-padding)]': !showTabs }">
        <BScrollbar>
            <RouterView v-slot="{ Component, route: routerRoute }">
                <Transition :name="globalStore.getTransitionName" mode="out-in" appear>
                    <KeepAlive :include="asyncRouteStore.keepAliveRouterList">
                        <component :is="wrapComponent(Component, routerRoute)" :key="routerRoute.name" />
                    </KeepAlive>
                </Transition>
            </RouterView>
        </BScrollbar>
    </div>
</template>