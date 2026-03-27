<template>
    <NModal v-model:show="showModal" title="审计日志详情" preset="card" class="w-800px">
        <NDescriptions label-placement="left" :column="2" bordered label-class="w-100px">
            <NDescriptionsItem label="操作人员">{{ detail.username }} (ID: {{ detail.userId }})</NDescriptionsItem>
            <NDescriptionsItem label="所属模块">{{ detail.module }}</NDescriptionsItem>
            <NDescriptionsItem label="操作描述">{{ detail.action }}</NDescriptionsItem>
            <NDescriptionsItem label="请求方式">
                <NTag size="small" :type="getMethodColor(detail.method)" secondary>{{ detail.method }}</NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="请求路径" :span="2">
                <code class="text-blue-600 bg-blue-50 px-1">{{ detail.path }}</code>
            </NDescriptionsItem>
            <NDescriptionsItem label="IP 地址">{{ detail.ipAddress }}</NDescriptionsItem>
            <NDescriptionsItem label="执行耗时">{{ detail.executionTime }} ms</NDescriptionsItem>
            <NDescriptionsItem label="状态码">
                <NTag :type="detail.statusCode === 200 ? 'success' : 'error'" size="small">
                    {{ detail.statusCode }}
                </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="操作时间">{{ detail.createdAt }}</NDescriptionsItem>

            <NDescriptionsItem label="请求参数" :span="2">
                <div class="bg-gray-800 p-3 rounded-md max-h-120px overflow-y-auto mt-1 shadow-inner">
                    <pre class="text-xs text-gray-100 font-mono">{{ formatJson(detail.requestParams) }}</pre>
                </div>
            </NDescriptionsItem>

            <NDescriptionsItem label="响应体" :span="2">
                <div class="bg-gray-800 p-3 rounded-md max-h-200px overflow-y-auto mt-1 shadow-inner">
                    <pre class="text-xs text-green-400 font-mono">{{ formatJson(detail.responseData) }}</pre>
                </div>
            </NDescriptionsItem>
        </NDescriptions>

        <template #footer>
            <BSpace justify="end">
                <NButton @click="showModal = false">确定</NButton>
            </BSpace>
        </template>
    </NModal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { OperationLog } from '@/api/modules/system/operation-log/api'

const showModal = ref(false)
const detail = reactive<Partial<OperationLog>>({})

function open(row: OperationLog) {
    Object.assign(detail, row)
    showModal.value = true
}

function formatJson(json: any) {
    if (!json) return 'N/A'
    return JSON.stringify(json, null, 2)
}

function getMethodColor(method: string | undefined) {
    const METHOD_COLOR_MAP = {
        GET: 'success',
        POST: 'warning',
        PUT: 'info',
        DELETE: 'error'
    }
    if (!method) return 'default'
    return METHOD_COLOR_MAP[method] || 'default'
}
defineExpose({ open })
</script>