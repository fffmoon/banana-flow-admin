<template>
    <BSpace vertical class="wh-full">
        <!-- 搜索 -->
        <NCard class="title">
            <NForm class="flex flex-wrap gap-y-[--space-md]" inline label-width="auto" :show-feedback="false"
                label-placement="left" :model="searchForm">
                <NFormItem label="用户名">
                    <NInput v-model:value="searchForm.username" placeholder="输入用户名搜索" clearable
                        @keyup.enter="handleSearch" />
                </NFormItem>
                <NFormItem label="手机号">
                    <NInput v-model:value="searchForm.mobilePhone" placeholder="输入手机号搜索" clearable
                        @keyup.enter="handleSearch" />
                </NFormItem>
                <NFormItem label="状态">
                    <NSelect v-model:value="searchForm.isActive" :options="userOptions" placeholder="全部" clearable
                        class="w-120px" />
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

        <!-- 表格 -->
        <NCard class="body flex-1">
            <BSpace vertical class="wh-full">
                <BSpace>
                    <NButton v-perm="'system:users:create'" type="primary" @click="handleAdd">
                        <template #icon>
                            <div class="i-mdi-plus" />
                        </template>
                        新增用户
                    </NButton>
                </BSpace>

                <div class="flex-1 overflow-hidden mt-2">
                    <NDataTable remote ref="tableRef" :columns="columns" :data="tableData" :loading="loading" striped
                        :pagination="pagination" :row-key="(row) => row.id" flex-height class="h-full"
                        @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
                </div>
            </BSpace>
        </NCard>

        <UserModal ref="modalRef" @success="fetchData" />
    </BSpace>
</template>

<script setup lang="ts">
import { h, ref, reactive, onMounted } from 'vue'
import { NTag, NSwitch, NAvatar, type DataTableColumns, type PaginationProps, NButton, NPopconfirm, NText } from 'naive-ui'
import { type User, getUserList, updateUser } from '@/api/modules/system/users/api'
import UserModal from './components/UserModal.vue'
const message = useMessage()


interface UserList extends User {
    // 最高权限
    roleLevel: number
}

const loading = ref(false)
const tableData = ref<UserList[]>([])
const modalRef = ref<InstanceType<typeof UserModal> | null>(null)
const userStore = useUserStore()

// 状态选项
const userOptions = [{ label: '启用', value: true }, { label: '停用', value: false }]

const searchForm = reactive({
    username: '',
    mobilePhone: '',
    isActive: null as boolean | null
})

const pagination = reactive<PaginationProps>({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50]
})

// Columns
const columns: DataTableColumns<UserList> = [
    {
        title: '头像',
        key: 'avatar',
        width: 80,
        align: 'center',
        render(row) {
            return h(NAvatar, {
                round: true,
                size: 'small',
                src: row.avatar,
                fallbackSrc: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg' // 默认头像
            })
        }
    },
    { title: '用户名', key: 'username', width: 120, ellipsis: { tooltip: true } },
    { title: '昵称', key: 'nickname', width: 120, ellipsis: { tooltip: true } },
    {
        title: '性别',
        key: 'gender',
        width: 80,
        align: 'center',
        render(row) {
            const genderMap: Record<number, { text: string, type: 'default' | 'info' | 'error' }> = {
                0: { text: '未知', type: 'default' },
                1: { text: '男', type: 'info' },
                2: { text: '女', type: 'error' }
            }
            const conf = genderMap[row.gender ?? 0] || genderMap[0]

            return h(NTag, { type: conf.type, size: 'small', bordered: false }, { default: () => conf.text })
        }
    },
    { title: '手机号', key: 'mobilePhone', width: 130, ellipsis: { tooltip: true } },
    { title: '邮箱', key: 'email', width: 200, ellipsis: { tooltip: true } },
    {
        title: '角色',
        key: 'roles',
        render(row) {
            if (!row.roles || !row.roles.length) return h(NTag, { size: 'small' }, { default: () => '无' })
            const roleMap = { 0: 'error', 1: 'warning' }
            return h('div', { class: 'flex gap-1 flex-wrap' },
                row.roles.map(role =>
                    h(NTag, { type: roleMap[role.roleLevel] || 'info', size: 'small' }, { default: () => role.roleName })
                )
            )
        }
    },
    {
        title: '状态',
        key: 'isActive',
        width: 100,
        render(row) {
            // 不可以操作自己的角色
            const isSelf = userStore.getUserInfo?.id === row.id
            // 不可以操作权限等级比自己高的角色
            const hasPermission = userStore.compareRoleLevel(row.roleLevel)
            const disabled = !hasPermission || isSelf || !userStore.hasPerms('system:users:update')
            return h(NSwitch, {
                value: row.isActive,
                disabled: disabled,
                loading: false,
                'onUpdate:value': (value: boolean) => handleStatusChange(row, value)
            }, { checked: () => '启用', unchecked: () => '停用' })
        }
    },
    {
        title: '操作',
        key: 'actions',
        width: 150,
        fixed: 'right',
        render(row) {
            // 不可以操作自己的角色
            const isSelf = userStore.getUserInfo?.id === row.id
            // 不可以操作权限等级比自己高的角色
            const hasPermission = userStore.compareRoleLevel(row.roleLevel)
            const disabled = !hasPermission || isSelf
            return h(
                'div',
                { class: 'flex gap-2' },
                [
                    userStore.hasPerms('system:users:update') ? h(
                        NButton,
                        {
                            size: 'small',
                            type: 'primary',
                            text: true,
                            disabled: disabled,
                            onClick: () => handleEdit(row)
                        },
                        { default: () => '编辑', icon: () => h('div', { class: 'i-mdi-file-edit-outline' }) }
                    ) : null,
                    userStore.hasPerms('system:users:delete') ? h(
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


async function handleDelete(row: User) {
    try {
        await API.system.users.deleteUser(row.id)
        message.success('删除成功')
        fetchData()
    } catch (error) {
        console.error(error)
    }
}

async function fetchData() {
    loading.value = true
    try {
        const { data } = await getUserList({
            page: pagination.page || 1,
            size: pagination.pageSize || 10,
            username: searchForm.username || undefined,
            mobilePhone: searchForm.mobilePhone || undefined,
            isActive: searchForm.isActive ?? undefined
        })

        tableData.value = data.data.map(item => ({
            ...item,
            roleLevel: item.roles.length ? Math.min(...item.roles.map((role) => role.roleLevel)) : 999
        }))
        pagination.itemCount = data.pagination.total
        pagination.page = data.pagination.page
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
    searchForm.mobilePhone = ''
    searchForm.isActive = null
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

async function handleStatusChange(row: User, value: boolean) {
    try {
        // 乐观更新
        row.isActive = value
        await updateUser(row.id, { isActive: value })
        message.success(value ? '已启用' : '已停用')
    } catch (error) {
        row.isActive = !value // 失败回滚
    }
}

function handleAdd() {
    modalRef.value?.open()
}

function handleEdit(row: User) {
    modalRef.value?.open(row)
}

onMounted(() => {
    fetchData()
})
</script>
