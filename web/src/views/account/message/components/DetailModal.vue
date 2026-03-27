<script setup lang="ts">
import { ref, computed } from 'vue'
import { NModal, NButton, NTag } from 'naive-ui'
import type { NotificationItem } from '@/api/modules/account/notification/api'
import moment from 'moment'
import { NOTIFICATION_TYPE_META } from '@/constants'

const show = ref(false)
const currentId = ref<number | null>(null)
const currentNotice = ref<NotificationItem | null>(null)

// 格式化时间
const formattedTime = computed(() => {
    if (!currentNotice.value?.createTime) return ''
    return moment(currentNotice.value.createTime).format('YYYY-MM-DD HH:mm')
})

// 获取标签样式
const typeMeta = computed(() => {
    const type = currentNotice.value?.noticeType
    const meta = NOTIFICATION_TYPE_META.find(item => item.id === type)
    return meta || NOTIFICATION_TYPE_META[0]
})

function open(params: { id: number }) {
    currentId.value = params.id
    show.value = true
    getData(currentId.value)
}

function getData(id: number) {
    API.account.notification.getDetail(id).then(res => {
        currentNotice.value = res.data
    })
}

defineExpose({ open })
</script>

<template>
    <n-modal v-model:show="show" preset="card" class="w-600px" :bordered="false" title="消息详情">

        <!-- 主体内容 -->
        <div>
            <!-- 标题 -->
            <div class="flex items-start justify-between gap-4">
                <h3 class="text-xl font-bold text-gray-800 leading-tight">
                    {{ currentNotice?.title }}
                </h3>
                <n-tag :type="typeMeta.type" size="small" round :bordered="false" class="flex-shrink-0">
                    <template #icon>
                        <div :class="typeMeta.icon" />
                    </template>
                    {{ typeMeta.label }}
                </n-tag>
            </div>
            <!-- 元数据行 -->
            <div class="flex items-center gap-6 mt-3 text-gray-400 text-sm">
                <div class="flex items-center gap-1.5">
                    <div class="i-mdi-account-circle-outline text-lg" />
                    <span>{{ currentNotice?.publisherName || '系统通知' }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <div class="i-mdi-clock-time-four-outline text-lg" />
                    <span>{{ formattedTime }}</span>
                </div>
            </div>

            <!-- 分割线 -->
            <div class="w-full h-1px bg-gray-100 my-5"></div>

            <!-- 内容区域 -->
            <div
                class="p-4 bg-gray-50 rounded-lg text-gray-700 text-base leading-7 whitespace-pre-wrap break-words min-h-120px">
                {{ currentNotice?.content }}
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end">
                <n-button @click="show = false" size="medium">关闭</n-button>
            </div>
        </template>
    </n-modal>
</template>