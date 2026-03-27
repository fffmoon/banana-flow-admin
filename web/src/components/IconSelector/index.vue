<template>
    <NPopover trigger="click" placement="bottom-start" :width="300" @update:show="handleShow">
        <template #trigger>
            <NInput :value="value" placeholder="点击选择图标" readonly class="cursor-pointer" @clear="handleClear" clearable>
                <template #prefix>
                    <!-- 如果有选中值，显示预览；否则显示默认图标或留空 -->
                    <div v-if="value" :class="value" class="text-18px" />
                    <div v-else class="i-mdi-image-filter-center-focus text-18px text-gray-400" />
                </template>
                <template #suffix>
                    <div class="i-mdi-chevron-down text-gray-400" />
                </template>
            </NInput>
        </template>

        <!-- 弹出层内容 -->
        <div class="flex flex-col gap-2">
            <!-- 搜索框 -->
            <NInput v-model:value="searchText" placeholder="搜索图标..." size="small" clearable>
                <template #prefix>
                    <div class="i-mdi-magnify text-gray-400" />
                </template>
            </NInput>

            <!-- 图标网格 -->
            <NScrollbar style="max-height: 260px">
                <div v-if="filteredIcons.length > 0" class="grid grid-cols-6 gap-2 p-1">
                    <div v-for="icon in filteredIcons" :key="icon"
                        class="flex items-center justify-center p-2 rounded cursor-pointer transition-colors border border-transparent hover:bg-gray-100 hover:border-primary"
                        :class="{ 'bg-blue-50 border-blue-500 text-blue-600': icon === value }" :title="icon"
                        @click="handleSelect(icon)">
                        <div :class="icon" class="text-2xl" />
                    </div>
                </div>
                <!-- 无数据状态 -->
                <div v-else class="py-4 text-center text-gray-400 text-sm">
                    未找到相关图标
                </div>
            </NScrollbar>
        </div>
    </NPopover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NPopover, NInput, NScrollbar } from 'naive-ui'

// Props 定义
interface Props {
    value?: string
    options: string[] // 接收外部传入的图标数组
}

const props = withDefaults(defineProps<Props>(), {
    value: '',
    options: () => []
})

const emit = defineEmits(['update:value', 'change'])

const searchText = ref('')

// 打开弹窗时清空搜索
function handleShow(show: boolean) {
    if (show) {
        searchText.value = ''
    }
}

// 过滤图标
const filteredIcons = computed(() => {
    if (!searchText.value) return props.options
    const lowerText = searchText.value.toLowerCase()
    return props.options.filter(icon =>
        icon.toLowerCase().includes(lowerText)
    )
})

// 选择图标
function handleSelect(icon: string) {
    emit('update:value', icon)
    emit('change', icon)
    // NPopover 默认点击内容不会关闭，如果需要点击即关闭，、需要使用 manual 模式控制 show
}

// 清除图标
function handleClear() {
    emit('update:value', '')
    emit('change', '')
}
</script>

<style scoped>
</style>