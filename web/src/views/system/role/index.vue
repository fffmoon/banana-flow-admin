<template>
    <BSpace vertical class="wh-full">
        <!-- 搜索栏 -->
        <NCard class="title">
            <NForm class="flex flex-wrap gap-y-[--space-md]" inline label-width="auto" :show-feedback="false"
                label-placement="left" :model="searchForm">
                <NFormItem label="角色名称">
                    <NInput v-model:value="searchForm.roleName" placeholder="输入名称搜索" clearable
                        @keyup.enter="handleSearch" />
                </NFormItem>
                <NFormItem label="权限标识">
                    <NInput v-model:value="searchForm.roleCode" placeholder="输入字符搜索" clearable
                        @keyup.enter="handleSearch" />
                </NFormItem>
                <NFormItem class="ml-auto">
                    <BSpace>
                        <NButton type="primary" @click="handleSearch">
                            <template #icon>
                                <div class="i-mdi-magnify" />
                            </template>
                            搜索
                        </NButton>
                        <NButton @click="handleReset">
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
                <BSpace>
                    <NButton v-perm="'system:roles:create'" type="primary" @click="handleAdd">
                        <template #icon>
                            <div class="i-mdi-plus" />
                        </template>
                        新增角色
                    </NButton>
                </BSpace>

                <div class="flex-1 overflow-hidden mt-2">
                    <NDataTable remote ref="tableRef" :columns="columns" :data="paginatedData" :loading="loading"
                        striped :pagination="pagination" :row-key="(row) => row.id" flex-height class="h-full"
                        @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
                </div>
            </BSpace>
        </NCard>

        <!-- 弹窗组件 -->
        <RoleModal ref="modalRef" @success="fetchData" />
        <RolePermissionModal ref="permModalRef" @success="fetchData" />
    </BSpace>
</template>

<script setup lang="ts">
import { h, ref, reactive, onMounted, computed } from 'vue'
import { NTag, NSwitch, NButton, NPopconfirm, type DataTableColumns, type PaginationProps } from 'naive-ui'
import type { Role } from '@/api/modules/system/roles/api'
import RoleModal from './components/RoleModal.vue'
import RolePermissionModal from './components/RolePermissionModal.vue'
import { use } from 'echarts'

const loading = ref(false)
const allTableData = ref<Role[]>([]) // 存放后端返回的所有数据
const modalRef = ref<InstanceType<typeof RoleModal> | null>(null)
const permModalRef = ref<InstanceType<typeof RolePermissionModal> | null>(null)
const message = useMessage()
const userStore = useUserStore()

// 搜索表单
const searchForm = reactive({
    roleName: '',
    roleCode: ''
})

// 分页配置
const pagination = reactive<PaginationProps>({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
    prefix: ({ itemCount }) => `共 ${itemCount} 条`
})

/**
 * 假分页核心逻辑：计算属性
 * 根据 allTableData 和 pagination 计算当前页显示的数据
 */
const paginatedData = computed(() => {
    const start = (pagination.page! - 1) * pagination.pageSize!
    const end = start + pagination.pageSize!
    return allTableData.value.slice(start, end)
})

// Columns 定义
const columns: DataTableColumns<Role> = [
    { title: '角色名称', key: 'roleName', width: 150 },
    { title: '权限标识', key: 'roleCode', width: 150, render: (row) => h(NTag, { type: 'info', size: 'small' }, { default: () => row.roleCode }) },
    { title: '系统角色', key: 'isSystem', width: 100, render: (row) => h(NTag, { type: row.isSystem ? 'warning' : 'info', size: 'small' }, { default: () => row.isSystem ? '是' : '否' }), align: 'center' },
    { title: '权限等级', key: 'roleLevel', width: 100, render: (row) => h(NTag, { type: 'info', size: 'small' }, { default: () => row.roleLevel }), align: 'center' },
    {
        title: '状态',
        key: 'status',
        width: 100,
        render(row) {
            // 不可以操作自己的角色
            const isSelf = userStore.getUserInfo?.roles?.findIndex((item) => item.roleCode === row.roleCode) !== -1
            // 不可以操作权限等级比自己高的角色
            const hasPermission = userStore.compareRoleLevel(row.roleLevel)
            const disabled = !hasPermission || isSelf || !userStore.hasPerms('system:roles:update')
            return h(NSwitch, {
                value: row.status,
                disabled: disabled,
                'onUpdate:value': (value: boolean) => handleStatusChange(row, value)
            }, { checked: () => '启用', unchecked: () => '停用' })
        }
    },
    { title: '排序', key: 'sort', width: 80, render: (row) => h(NTag, { size: 'small' }, { default: () => row.sort }), align: 'center' },
    {
        title: '操作',
        key: 'actions',
        width: 250,
        fixed: 'right',
        render(row) {
            // 不可以操作自己的角色
            const isSelf = userStore.getUserInfo?.roles?.findIndex((item) => item.roleCode === row.roleCode) !== -1
            // 不可以操作权限等级比自己高的角色
            const hasPermission = userStore.compareRoleLevel(row.roleLevel)
            const disabled = !hasPermission || isSelf

            return h(
                'div',
                { class: 'flex gap-2' },
                [
                    userStore.hasPerms('system:roles:assign_menus') ? h(
                        NButton,
                        {
                            size: 'small',
                            type: 'primary',
                            secondary: true,
                            disabled: disabled,
                            onClick: () => handlePermission(row)
                        },
                        { default: () => '分配权限', icon: () => h('div', { class: 'i-mdi-shield-account-outline' }) }
                    ) : null,
                    userStore.hasPerms('system:roles:update') ? h(
                        NButton,
                        {
                            size: 'small',
                            type: 'info',
                            text: true,
                            disabled: disabled,
                            onClick: () => handleEdit(row)
                        },
                        { default: () => '编辑', icon: () => h('div', { class: 'i-mdi-file-edit-outline' }) }
                    ) : null,
                    userStore.hasPerms('system:roles:delete') ? h(
                        NPopconfirm,
                        {
                            onPositiveClick: () => handleDelete(row)
                        },
                        {
                            default: () => '确认删除该角色吗？',
                            trigger: () => h(
                                NButton,
                                {
                                    size: 'small',
                                    type: 'error',
                                    text: true,
                                    disabled: disabled,
                                },
                                { default: () => '删除', icon: () => h('div', { class: 'i-mdi-trash-can-outline' }) }
                            )
                        }
                    ) : null
                ]
            )
        }
    }
]

// --- API 操作 ---

async function fetchData() {
    loading.value = true
    try {
        const { data } = await API.system.roles.getRoleList()

        // 前端过滤（如果需要前端搜索）
        let filteredData = data || []
        if (searchForm.roleName) {
            filteredData = filteredData.filter(item => item.roleName.includes(searchForm.roleName))
        }
        if (searchForm.roleCode) {
            filteredData = filteredData.filter(item => item.roleCode.includes(searchForm.roleCode))
        }

        allTableData.value = filteredData
        pagination.itemCount = filteredData.length

        // 如果当前页超过总页数，重置到第一页
        const maxPage = Math.ceil(filteredData.length / pagination.pageSize!)
        if (pagination.page! > maxPage && maxPage > 0) {
            pagination.page = 1
        }
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
    searchForm.roleName = ''
    searchForm.roleCode = ''
    handleSearch()
}

// 假分页 - 页码改变
function handlePageChange(page: number) {
    pagination.page = page
}

// 假分页 - 条数改变
function handlePageSizeChange(pageSize: number) {
    pagination.pageSize = pageSize
    pagination.page = 1
}

// 状态切换
async function handleStatusChange(row: Role, value: boolean) {
    try {
        row.status = value // 乐观更新
        await API.system.roles.updateRole(row.id, { status: value })
        message.success(value ? '已启用' : '已停用')
    } catch (error) {
        row.status = !value // 回滚
    }
}

function handleAdd() {
    modalRef.value?.open()
}

function handleEdit(row: Role) {
    modalRef.value?.open(row)
}

function handlePermission(row: Role) {
    // 后端 List 接口应该已经返回了 menuIds，如果没有，这里需要单独调接口获取
    // 假设 API 返回结构中有 menuIds
    const currentMenus = row.menuIds || []
    permModalRef.value?.open(row.id, currentMenus)
}

async function handleDelete(row: Role) {
    try {
        await API.system.roles.deleteRole(row.id)
        message.success('删除成功')
        fetchData()
    } catch (error) {
        console.error(error)
    }
}

onMounted(() => {
    fetchData()
})
</script>
