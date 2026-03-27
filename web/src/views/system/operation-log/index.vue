<template>
    <BSpace vertical class="wh-full">
        <NCard class="title">
            <NForm class="flex flex-wrap gap-y-[--space-md]" inline label-width="auto" :show-feedback="false"
                label-placement="left" :model="searchForm">
                <NFormItem label="操作人员">
                    <NInput v-model:value="searchForm.username" placeholder="请输入用户名" clearable
                        @keyup.enter="handleSearch" />
                </NFormItem>
                <NFormItem label="业务模块">
                    <NInput v-model:value="searchForm.module" placeholder="请输入模块名" clearable
                        @keyup.enter="handleSearch" />
                </NFormItem>
                <NFormItem label="状态">
                    <NSelect v-model:value="searchForm.statusCode" :options="statusOptions" placeholder="请选择"
                        class="w-120px" clearable />
                </NFormItem>
                <NFormItem label="时间范围">
                    <NDatePicker v-model:value="timeRange" type="datetimerange" clearable />
                </NFormItem>

                <!-- 按钮组自动靠右 -->
                <NFormItem :style="{ marginLeft: 'auto' }">
                    <BSpace>
                        <NButton type="primary" :loading="loading" @click="handleSearch">
                            <template #icon>
                                <div class="i-mdi-magnify" />
                            </template>
                            搜索
                        </NButton>
                        <NButton :disabled="loading" @click="handleReset">
                            <template #icon>
                                <div class="i-mdi-refresh" />
                            </template>
                            重置
                        </NButton>
                    </BSpace>
                </NFormItem>
            </NForm>
        </NCard>

        <!-- 表格区域 -->
        <NCard class="body flex-1">
            <div class="flex-1 overflow-hidden h-full">
                <NDataTable remote ref="tableRef" :columns="columns" :data="tableData" :loading="loading" striped
                    :pagination="pagination" :row-key="(row) => row.id" flex-height class="h-full"
                    @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
            </div>
        </NCard>

        <!-- 详情弹窗 -->
        <LogDetailModal ref="detailModalRef" />
    </BSpace>
</template>

<script setup lang="ts">
import { h, ref, reactive, onMounted } from 'vue'
import { NTag, NButton, type DataTableColumns, type PaginationProps } from 'naive-ui'
import type { OperationLog } from '@/api/modules/system/operation-log/api'
import LogDetailModal from './components/LogDetailModal.vue'
import moment from 'moment'

const loading = ref(false)
const tableData = ref<OperationLog[]>([])
const detailModalRef = ref<InstanceType<typeof LogDetailModal> | null>(null)
const timeRange = ref<[number, number] | null>(null)

const searchForm = reactive({
    username: '',
    module: '',
    statusCode: null as number | null
})

const statusOptions = [
    { label: '成功', value: 200 },
    { label: '异常', value: 500 }
]

const pagination = reactive<PaginationProps>({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
    prefix: ({ itemCount }) => `共 ${itemCount} 条`
})

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

const columns: DataTableColumns<OperationLog> = [
    { title: 'ID', key: 'id', width: 70, align: 'center', render: (row) => h(NTag, { size: 'small', bordered: false }, { default: () => row.id }) },
    { title: '操作人', key: 'username', width: 100 },
    { title: '业务模块', key: 'module', width: 100, render: (row) => h(NTag, { type: 'info', size: 'small', bordered: false }, { default: () => row.module }) },
    { title: '操作动作', key: 'action', width: 120 },
    { title: '请求方式', key: 'method', width: 90, align: 'center', render: (row) => h(NTag, { type: getMethodColor(row.method), size: 'small', bordered: false }, { default: () => row.method }) },
    { title: 'IP 地址', key: 'ipAddress', width: 130 },
    {
        title: '状态',
        key: 'statusCode',
        width: 80,
        align: 'center',
        render: (row) => h(NTag, { type: row.statusCode === 200 ? 'success' : 'error', size: 'small' }, { default: () => row.statusCode === 200 ? '成功' : '失败' })
    },
    {
        title: '耗时',
        key: 'executionTime',
        width: 90,
        align: 'center',
        render: (row) => h('span', { class: row.executionTime > 500 ? 'text-red-500' : 'text-green-600' }, `${row.executionTime}ms`)
    },
    { title: '操作时间', key: 'createdAt', width: 170, render: (row) => h('span', { class: '' }, `${moment(row.createdAt).format('YYYY-MM-DD HH:mm:ss')}`) },
    {
        title: '操作',
        key: 'actions',
        width: 80,
        fixed: 'right',
        align: 'center',
        render(row) {
            return h(
                NButton,
                { size: 'small', type: 'primary', text: true, onClick: () => detailModalRef.value?.open(row) },
                { default: () => '详情', icon: () => h('div', { class: 'i-mdi-eye-outline' }) }
            )
        }
    }
]

async function fetchData() {
    loading.value = true
    try {
        const params = {
            page: pagination.page,
            size: pagination.pageSize,
            username: searchForm.username || undefined,
            module: searchForm.module || undefined,
            statusCode: searchForm.statusCode || undefined,
            startTime: timeRange.value ? new Date(timeRange.value[0]).toISOString() : undefined,
            endTime: timeRange.value ? new Date(timeRange.value[1]).toISOString() : undefined,
        }

        const { data } = await API.system.operationLog.getLogList(params)

        tableData.value = data.data || []
        pagination.itemCount = data.pagination.total || 0
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

function handleSearch() {
    pagination.page = 1
    fetchData()
}

function handleReset() {
    searchForm.username = ''
    searchForm.module = ''
    searchForm.statusCode = null
    timeRange.value = null
    handleSearch()
}

function handlePageChange(page: number) {
    pagination.page = page
    fetchData()
}

function handlePageSizeChange(pageSize: number) {
    pagination.pageSize = pageSize
    pagination.page = 1
    fetchData()
}

onMounted(() => fetchData())
</script>