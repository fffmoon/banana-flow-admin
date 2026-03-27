<script setup lang="ts">
import { h, ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    NButton, NTag, NPopconfirm, NForm, NFormItem, NInput, NSelect, NDataTable, NCard,
    type DataTableColumns, type PaginationProps, useDialog
} from 'naive-ui'
import { API } from '@/api'
import type { NotificationItem } from '@/api/modules/account/notification/api'
import DetailModal from './components/DetailModal.vue'
import moment from 'moment'
import TabLayout, { type TabItem } from '@/layout/ContentLayout/TabLayout/index.vue'
import { useMessageStore } from '@/store/modules/message'

const message = useMessage()
const dialog = useDialog()
const messageStore = useMessageStore()
const route = useRoute()
const router = useRouter()

// #region ➤ 状态定义
const activeTab = ref(0) // 0: 未读, 1: 已读
const tabList: TabItem<number>[] = [
    { id: 0, label: '未读消息' },
    { id: 1, label: '已读消息' }
]

const loading = ref(false)
const tableData = ref<NotificationItem[]>([])
const detailModalRef = ref<InstanceType<typeof DetailModal> | null>(null)

// 搜索表单
const searchForm = reactive({
    title: '',
    publisherName: '',
    noticeType: 0
})

const noticeTypeOptions = [
    { label: '全部', value: 0 },
    { label: '通知', value: 1 },
    { label: '公告', value: 2 },
    { label: '私信', value: 3 }
]

const pagination = reactive<PaginationProps>({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
    prefix: ({ itemCount }) => `共 ${itemCount} 条`
})
// #endregion

// #region ➤ 表格配置

const getNoticeTypeMeta = (type: number) => {
    const map: Record<number, { text: string; type: 'info' | 'warning' | 'success' | 'default' }> = {
        1: { text: '通知', type: 'info' },
        2: { text: '公告', type: 'warning' },
        3: { text: '私信', type: 'success' }
    }
    return map[type] || { text: '未知', type: 'default' }
}

const columns = computed<DataTableColumns<NotificationItem>>(() => [
    {
        title: '类型',
        key: 'noticeType',
        width: 80,
        align: 'center',
        render: (row) => {
            const meta = getNoticeTypeMeta(row.noticeType)
            return h(NTag, { type: meta.type, size: 'small', bordered: false }, { default: () => meta.text })
        }
    },
    {
        title: '标题',
        key: 'title',
        width: 200,
        ellipsis: { tooltip: true }
    },
    {
        title: '内容',
        key: 'content',
        minWidth: 300,
        render: (row) => {
            // 未读状态下脱敏显示
            if (activeTab.value === 0) {
                return '******'
            }
            return h('span', { class: 'text-gray-500 truncate block' }, row.content || '')
        }
    },
    {
        title: '发布人',
        key: 'publisherName',
        width: 120,
        render: (row) => row.publisherName || '系统'
    },
    {
        title: '时间',
        key: 'createTime',
        width: 180,
        render: (row) => moment(row.createTime).format('YYYY-MM-DD HH:mm:ss')
    },
    {
        title: '操作',
        key: 'actions',
        width: 150,
        fixed: 'right',
        align: 'center',
        render(row) {
            const actions = []
            // 查看详情
            actions.push(
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'primary',
                        text: true,
                        onClick: () => handleViewDetail(row.id)
                    },
                    { default: () => '查看', icon: () => h('div', { class: 'i-mdi-eye-outline' }) }
                )
            )
            // 仅在“已读”列表显示删除按钮
            if (activeTab.value === 1) {
                actions.push(
                    h(
                        NPopconfirm,
                        { onPositiveClick: () => handleDelete(row) },
                        {
                            default: () => '确认删除该条消息吗？',
                            trigger: () => h(
                                NButton,
                                { size: 'small', type: 'error', text: true, class: 'ml-3' },
                                { default: () => '删除', icon: () => h('div', { class: 'i-mdi-trash-can-outline' }) }
                            )
                        }
                    )
                )
            }
            return h('div', actions)
        }
    }
])

// #endregion

// #region ➤ 业务逻辑

async function fetchData() {
    loading.value = true
    try {
        const isRead = activeTab.value === 1

        const { data } = await API.account.notification.getList({
            page: pagination.page || 1,
            size: pagination.pageSize || 10,
            isRead: isRead,
            title: searchForm.title || undefined,
            publisherName: searchForm.publisherName || undefined,
            noticeType: searchForm.noticeType === 0 ? undefined : searchForm.noticeType
        })

        tableData.value = data.data
        pagination.itemCount = data.pagination.total
        pagination.page = data.pagination.page
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

function handleSearch() {
    pagination.page = 1
    fetchData()
}

function handleReset() {
    searchForm.title = ''
    searchForm.publisherName = ''
    searchForm.noticeType = 0
    handleSearch()
}

// 查看详情
async function handleViewDetail(id: number) {
    detailModalRef.value?.open({ id })
    await API.account.notification.readOne(id)
    messageStore.getUnreadCount()
    if (activeTab.value === 0) {
        fetchData()
    }
}

// 全部已读
function handleReadAll() {
    dialog.warning({
        title: '确认操作',
        content: '确定要将所有未读消息标记为已读吗？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
            try {
                await API.account.notification.readAll()
                message.success('操作成功')
                handleSearch()
                messageStore.getUnreadCount()
            } catch (error) {
                console.error(error)
            }
        }
    })
}

// 删除消息
async function handleDelete(row: NotificationItem) {
    try {
        await API.account.notification.deleteOne(row.id)
        message.success('删除成功')
        fetchData()
        if (!row.isRead) {
            messageStore.getUnreadCount()
        }
    } catch (error) {
        console.error(error)
    }
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

// 监听 Tab 切换，刷新数据
watch(activeTab, () => {
    // 仅重置分页
    pagination.page = 1
    fetchData()
})

onMounted(() => {
    fetchData()
})
// #endregion

// #region ➤ 检查URL时候携带
// ================================================

// 检查 URL 参数并自动打开详情
function checkQueryId() {
    const id = route.query.id ? Number(route.query.id) : null
    if (id) {
        handleViewDetail(id)
    }
    router.replace({ query: { ...route.query, id: undefined } })
}


// 监听路由 query 变化
watch(() => route.query.id, (newVal) => {
    if (newVal) {
        checkQueryId()
    }
})

onMounted(async () => {
    checkQueryId()
})

// #endregion 检查URL时候携带

</script>

<template>
    <TabLayout v-model:value="activeTab" :tabs="tabList">
        <div class="h-full flex flex-col">
            <BSpace vertical class="wh-full">
                <!-- 头部搜索栏 -->
                <NCard class="title">
                    <NForm class="flex flex-wrap gap-y-[--space-md]" inline label-width="auto" :show-feedback="false"
                        label-placement="left" :model="searchForm">
                        <NFormItem label="标题">
                            <NInput v-model:value="searchForm.title" placeholder="输入标题搜索" clearable
                                @keyup.enter="handleSearch" />
                        </NFormItem>
                        <NFormItem label="发布人">
                            <NInput v-model:value="searchForm.publisherName" placeholder="输入发布人搜索" clearable
                                @keyup.enter="handleSearch" />
                        </NFormItem>
                        <NFormItem label="类型">
                            <NSelect v-model:value="searchForm.noticeType" :options="noticeTypeOptions" placeholder="全部"
                                class="w-120px" />
                        </NFormItem>

                        <!-- 搜索/重置按钮组 -->
                        <NFormItem class="ml-auto">
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
                    <BSpace vertical class="wh-full">
                        <!-- 操作栏 -->
                        <BSpace v-if="activeTab === 0">
                            <NButton type="primary" secondary :disabled="tableData.length === 0" @click="handleReadAll">
                                <template #icon>
                                    <div class="i-mdi-playlist-check" />
                                </template>
                                全部已读
                            </NButton>
                        </BSpace>
                        <!-- 占位 -->
                        <div v-else class="h-1"></div>

                        <div class="flex-1 overflow-hidden mt-2">
                            <NDataTable remote ref="tableRef" :columns="columns" :data="tableData" :loading="loading"
                                striped :pagination="pagination" :row-key="(row) => row.id" flex-height class="h-full"
                                @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
                        </div>
                    </BSpace>
                </NCard>
            </BSpace>
        </div>

        <!-- 详情弹窗 -->
        <DetailModal ref="detailModalRef" />
    </TabLayout>
</template>
