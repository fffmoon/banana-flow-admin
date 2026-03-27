<script setup lang="ts" generic="T extends string | number">
import { computed } from 'vue'
import { NCard, NTabs, NTab } from 'naive-ui'
import useScreen from '@/hooks/useResponsive'

export interface TabItem<V = string | number> {
    id: V
    label: string
}

interface Props {
    tabs: TabItem<T>[]
    value: T
}

interface Emits {
    (e: 'update:value', value: T): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeTab = computed({
    get: () => props.value,
    set: (val) => emit('update:value', val)
})

</script>

<template>
    <div class="wh-full">
        <n-card class="wh-full" content-style="height: 100%; width: 100%; ">
            <div class="wh-full flex transition-all flex-col">
                <!-- Tabs 区域 -->
                <div class="shrink-0 border-gray-100 border-b">
                    <n-tabs v-model:value="activeTab" placement="top" type="line" class="h-full" :animated="true">
                        <n-tab v-for="item in tabs" :key="item.id" :name="item.id">
                            {{ item.label }}
                        </n-tab>
                    </n-tabs>
                </div>

                <!-- 内容插槽区域 -->
                <div class="flex-1 min-w-0 min-h-0 overflow-hidden relative">
                    <div class="wh-full py-5">
                        <slot />
                    </div>
                </div>
            </div>
        </n-card>
    </div>
</template>

<style scoped>
:deep(.n-tabs-rail) {
    height: 100%;
}
</style>