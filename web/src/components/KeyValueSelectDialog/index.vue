<template>
    <!-- 触发区域：点击插槽内容打开弹窗 -->
    <div @click="handleOpen" class="inline-block w-full">
        <slot></slot>
    </div>

    <NModal v-model:show="showModal" preset="card" :title="title || '参数配置'" class="w-600px" :bordered="false"
        size="small">
        <div class="py-2">
            <n-dynamic-input v-model:value="kvList" preset="pair" key-placeholder="参数名 (Key)"
                value-placeholder="参数值 (Value)">
                <template #action="{ index, create, remove }">
                    <div class="flex items-center ml-2">
                        <n-button size="tiny" circle type="error" secondary @click="remove(index)">
                            <template #icon>
                                <div class="i-mdi-minus" />
                            </template>
                        </n-button>
                        <n-button size="tiny" circle type="primary" secondary class="ml-1" @click="create(index)">
                            <template #icon>
                                <div class="i-mdi-plus" />
                            </template>
                        </n-button>
                    </div>
                </template>
            </n-dynamic-input>

            <div v-if="kvList.length === 0" class="text-center text-gray-400 py-4 text-xs">
                暂无参数，点击上方添加按钮新增
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <n-button size="small" @click="showModal = false">取消</n-button>
                <n-button size="small" type="primary" @click="handleConfirm">确定</n-button>
            </div>
        </template>
    </NModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NModal, NDynamicInput, NButton } from 'naive-ui'

interface KeyValuePair {
    key: string
    value: string
}

// 接收一个对象，例如 { id: '1', type: '2' }
const props = defineProps<{
    value?: Record<string, string> | null
    title?: string
}>()

const emit = defineEmits(['update:value', 'confirm'])

const showModal = ref(false)
const kvList = ref<KeyValuePair[]>([])

/**
 * 将对象转换为数组供 DynamicInput 使用
 */
const objectToArray = (obj: Record<string, string> | null | undefined): KeyValuePair[] => {
    if (!obj || Object.keys(obj).length === 0) {
        return [{ key: '', value: '' }]
    }
    return Object.entries(obj).map(([key, value]) => ({
        key,
        value: String(value) // 确保 value 是字符串
    }))
}

/**
 * 打开弹窗
 */
const handleOpen = () => {
    // 深拷贝并转换格式，避免直接修改 props
    kvList.value = objectToArray(props.value)
    showModal.value = true
}

/**
 * 确认保存
 */
const handleConfirm = () => {
    // 1. 过滤掉 Key 为空的无效项
    const validList = kvList.value.filter(item => item.key && item.key.trim() !== '')

    // 2. 将数组转换回对象
    const resultObject: Record<string, string> = {}
    validList.forEach(item => {
        resultObject[item.key.trim()] = item.value.trim()
    })

    // 3. 如果是空对象，根据你的业务需求，可以传 null 或者 {}，这里传 null 代表无数据
    const finalValue = Object.keys(resultObject).length > 0 ? resultObject : null

    emit('update:value', finalValue)
    emit('confirm')
    showModal.value = false
}
</script>