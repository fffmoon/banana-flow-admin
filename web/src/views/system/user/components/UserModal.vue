<template>
    <NModal v-model:show="showModal" :title="modalTitle" preset="card" class="w-600px">
        <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="80px"
            require-mark-placement="right-hanging">
            <NFormItem label="用户名" path="username">
                <NInput v-model:value="formModel.username" :disabled="isEdit" placeholder="请输入登录账号" />
            </NFormItem>

            <NFormItem label="昵称" path="nickname">
                <NInput v-model:value="formModel.nickname" placeholder="请输入用户昵称" />
            </NFormItem>

            <NFormItem label="密码" path="password" :required="!isEdit">
                <NInput v-model:value="formModel.password" type="password" show-password-on="mousedown"
                    :placeholder="isEdit ? '留空则不修改密码' : '请输入初始密码'" />
            </NFormItem>

            <NFormItem label="手机号" path="mobilePhone">
                <NInput v-model:value="formModel.mobilePhone" placeholder="请输入11位手机号" />
            </NFormItem>

            <NFormItem label="邮箱" path="email">
                <NInput v-model:value="formModel.email" placeholder="example@domain.com" />
            </NFormItem>

            <NFormItem label="性别" path="gender">
                <NRadioGroup v-model:value="formModel.gender" name="genderGroup">
                    <NRadio :value="1">男</NRadio>
                    <NRadio :value="2">女</NRadio>
                    <NRadio :value="0">未知</NRadio>
                </NRadioGroup>
            </NFormItem>

            <NFormItem label="角色" path="roleIds">
                <NSelect v-model:value="formModel.roleIds" multiple :options="roleOptions" placeholder="请选择角色" />
            </NFormItem>

            <NFormItem label="状态" path="isActive">
                <NSwitch v-model:value="formModel.isActive">
                    <template #checked>启用</template>
                    <template #unchecked>停用</template>
                </NSwitch>
            </NFormItem>
        </NForm>

        <template #footer>
            <BSpace justify="end">
                <NButton @click="showModal = false">取消</NButton>
                <NButton type="primary" :loading="submitting" @click="handleSubmit">确认</NButton>
            </BSpace>
        </template>
    </NModal>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { type FormInst, type FormRules } from 'naive-ui'
import { Role } from '@apis/modules/system/roles/api'
import { User } from '@apis/modules/system/users/api'
// import { type User, type Role, getUserList, createUser, updateUser, getRoleList } from '@/api/modules/system/'

const emit = defineEmits(['success'])
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const showModal = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editId = ref('')

// 角色选项数据
interface RoleOption extends Role {
    label: string
    value: string
    disabled: boolean
}
const roleOptions = ref<RoleOption[]>([])

interface UserFormState {
    username: string
    nickname: string
    password: string
    mobilePhone: string
    gender: number
    email: string
    isActive: boolean
    roleIds: string[]
}

const initialForm: UserFormState = {
    username: '',
    nickname: '',
    password: '',
    mobilePhone: '',
    gender: 0,
    email: '',
    isActive: true,
    roleIds: [],
}

const formModel = reactive<UserFormState>({ ...initialForm })

const rules: FormRules = {
    username: { required: true, message: '请输入用户名', trigger: 'blur' },
    // password 校验逻辑不在这里处理
    roleIds: { type: 'array', required: false, message: '请选择角色', trigger: 'change' },
    mobilePhone: [
        { required: false },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: ['blur', 'input'] }
    ],
    email: [
        { required: false },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'input'] }
    ]
}

const modalTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

/**
 * 初始化角色列表
 */
async function fetchRoles() {
    const { data } = await API.system.roles.getRoleList()
    if (data && data.length) {
        roleOptions.value = data.map((item) => ({
            ...item,
            label: item.roleName,
            value: item.id,
            disabled: !item.canEdit,
        }))
    }
}

/**
 * 
 * @param row 当前行数据
 * @param allRoles 也可以从父组件传进来，这里选择内部获取
 */
async function open(row?: User) {
    showModal.value = true
    await fetchRoles()

    if (row) {
        isEdit.value = true
        editId.value = row.id
        // 回显数据
        Object.assign(formModel, {
            username: row.username,
            nickname: row.nickname || '',
            mobilePhone: row.mobilePhone || '',
            gender: row.gender ?? 0,
            email: row.email || '',
            isActive: row.isActive,
            password: '', // 编辑时不回显密码
            // 这里有个逻辑：row.roles 返回的是 ['admin'] key 数组，但编辑接口需要 ID。
            // 所以我们需要通过 key 反查 ID，或者后端 UserResponse 最好同时返回 roleIds。
            // 由于后端 UserResponse 只返回了 keys，我们需要在前端做一次映射。
            roleIds: maproleCodesToIds(row.roles.map(r => r.roleCode))
        })
    } else {
        isEdit.value = false
        editId.value = ''
        Object.assign(formModel, { ...initialForm })
    }
}

/**
 * 辅助函数：将 roleCode 转换为 roleId
 */
function maproleCodesToIds(keys: string[]): string[] {
    if (!keys || !keys.length) return []
    return roleOptions.value
        .filter(r => keys.includes(r.roleCode))
        .map(r => r.id)
}

async function handleSubmit() {
    // 手动校验密码（仅新增时）
    if (!isEdit.value && !formModel.password) {
        message.error('请输入初始密码')
        return
    }

    formRef.value?.validate(async (errors) => {
        if (!errors) {
            submitting.value = true
            try {
                const params = { ...formModel }
                if (isEdit.value && !params.password) {
                    delete (params as any).password
                }

                if (isEdit.value) {
                    await API.system.users.updateUser(editId.value, params)
                    message.success('更新成功')
                } else {
                    await API.system.users.createUser(params)
                    message.success('创建成功')
                }
                showModal.value = false
                emit('success')
            } catch (error) {
                console.error(error)
            } finally {
                submitting.value = false
            }
        }
    })
}

defineExpose({ open })
</script>