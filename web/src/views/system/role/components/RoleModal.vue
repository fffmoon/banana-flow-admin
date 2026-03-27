<template>
    <NModal v-model:show="showModal" :title="modalTitle" preset="card" class="w-600px">
        <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="100px"
            require-mark-placement="right-hanging">
            <NFormItem label="角色名称" path="roleName">
                <NInput v-model:value="formModel.roleName" placeholder="例如：产品经理" />
            </NFormItem>

            <NFormItem label="权限标识" path="roleCode">
                <NInput v-model:value="formModel.roleCode" :disabled="isEdit && formModel.roleCode === 'admin'"
                    placeholder="例如：product_manager" />
                <template #feedback>
                    <span class="text-xs text-gray-400">可以是角色名称的英文或者拼音，如：admin</span>
                </template>
            </NFormItem>

            <NFormItem label="权限等级" path="roleLevel">
                <NInputNumber v-model:value="formModel.roleLevel" :min="0" class="w-full" />
            </NFormItem>

            <NFormItem label="显示排序" path="sort">
                <NInputNumber v-model:value="formModel.sort" :min="0" class="w-full" />
            </NFormItem>

            <NFormItem label="状态" path="status">
                <NSwitch v-model:value="formModel.status">
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
import type { Role, RoleCreateParams } from '@/api/modules/system/roles/api'

const emit = defineEmits(['success'])
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const showModal = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editId = ref('')

// 表单初始状态
const initialForm = {
    roleName: '',
    roleCode: '',
    sort: 0,
    status: true,
    roleLevel: 10,
}

const formModel = reactive({ ...initialForm })

const rules: FormRules = {
    roleName: { required: true, message: '请输入角色名称', trigger: 'blur' },
    roleCode: { required: true, message: '请输入权限标识', trigger: 'blur' },
    sort: { type: 'number', required: true, message: '请输入排序', trigger: 'blur' }
}

const modalTitle = computed(() => (isEdit.value ? '编辑角色' : '新增角色'))

function open(row?: Role) {
    showModal.value = true
    if (row) {
        isEdit.value = true
        editId.value = row.id
        Object.assign(formModel, {
            roleName: row.roleName,
            roleCode: row.roleCode,
            sort: row.sort,
            status: row.status,
            roleLevel: row.roleLevel
        })
    } else {
        isEdit.value = false
        editId.value = ''
        Object.assign(formModel, { ...initialForm })
    }
}

async function handleSubmit() {
    formRef.value?.validate(async (errors) => {
        if (!errors) {
            submitting.value = true
            try {
                if (isEdit.value) {
                    await API.system.roles.updateRole(editId.value, formModel)
                    message.success('更新成功')
                } else {
                    await API.system.roles.createRole(formModel)
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