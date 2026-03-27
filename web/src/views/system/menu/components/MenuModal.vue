<template>
    <NModal v-model:show="showModal" :title="modalTitle" preset="card" class="w-800px">
        <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="100px"
            require-mark-placement="right-hanging">

            <!-- 1. 菜单类型选择 -->
            <NFormItem label="类型" path="type">
                <NRadioGroup v-model:value="formModel.type" name="type">
                    <NRadioButton :value="1">菜单</NRadioButton>
                    <NRadioButton :value="2">权限</NRadioButton>
                </NRadioGroup>
            </NFormItem>

            <!-- 2. 通用字段 -->
            <NGrid :cols="2" :x-gap="24">
                <NFormItemGi label="上级节点" path="parentId">
                    <NTreeSelect v-model:value="formModel.parentId" :options="treeOptions" key-field="id"
                        label-field="title" placeholder="留空则为顶级" clearable filterable
                        :disabled="isEdit && !!formModel.children?.length" />
                </NFormItemGi>
                <NFormItemGi label="显示标题" path="title">
                    <NInput v-model:value="formModel.title"
                        :placeholder="formModel.type === 1 ? '例如：系统管理' : '例如：新增用户'" />
                </NFormItemGi>
            </NGrid>

            <NGrid :cols="2" :x-gap="24">
                <NFormItemGi label="显示排序" path="sort">
                    <NInputNumber v-model:value="formModel.sort" class="w-full" :min="0" />
                </NFormItemGi>
            </NGrid>

            <template v-if="formModel.type === 2">
                <NGrid :cols="2" :x-gap="24">
                    <NFormItemGi label="权限标识" path="code">
                        <NInput v-model:value="formModel.code" placeholder="例如：system:user:create" />
                    </NFormItemGi>
                </NGrid>
            </template>

            <!-- 3. 菜单专属字段 (type === 1) -->
            <template v-if="formModel.type === 1">
                <NGrid :cols="2" :x-gap="24">
                    <NFormItemGi label="图标" path="icon">
                        <IconSelector v-model:value="formModel.icon" :options="routeIcons" />
                    </NFormItemGi>

                    <NFormItemGi label="链接地址" path="path">
                        <NInput v-model:value="formModel.path" placeholder="例如：user 或 /system/user" />
                    </NFormItemGi>
                </NGrid>

                <NGrid :cols="2" :x-gap="24">
                    <NFormItemGi label="组件路径" path="componentPath">
                        <NInput v-model:value="formModel.componentPath" placeholder="例如：views/system/user/index" />
                    </NFormItemGi>

                    <NFormItemGi label="组件参数" path="query">

                        <KeyValueSelectDialog v-model:value="formModel.query" title="配置路由参数">
                            <!-- 插槽内容：只读的 Input，用于展示 JSON 预览 -->
                            <NInput :value="queryDisplayString" placeholder="点击配置参数 (Key-Value)" readonly
                                class="cursor-pointer">
                                <template #suffix>
                                    <div class="i-mdi-code-json text-gray-400"></div>
                                </template>
                            </NInput>
                        </KeyValueSelectDialog>
                    </NFormItemGi>
                </NGrid>

                <NCollapse arrow-placement="right">
                    <NCollapseItem title="高级设置" name="advanced">
                        <div class="pt-4 px-2 bg-gray-50 rounded mb-4 border border-gray-100">
                            <NGrid :cols="1" :x-gap="24">
                                <NFormItemGi label="路由名称" path="name">
                                    <div class="flex items-center gap-2 w-full">
                                        <NInput v-model:value="formModel.name" :disabled="!formModel.isCustomName"
                                            :placeholder="formModel.isCustomName ? '请输入自定义路由名称' : '系统自动生成'" />

                                        <NTooltip trigger="hover">
                                            <template #trigger>
                                                <NButton :type="!formModel.isCustomName ? 'primary' : 'default'"
                                                    :quaternary="formModel.isCustomName" size="small"
                                                    @click="toggleCustomName">
                                                    <template #icon>
                                                        <div v-if="!formModel.isCustomName" class="i-mdi-lock"></div>
                                                        <div v-else class="i-mdi-lock-open-variant"></div>
                                                    </template>
                                                </NButton>
                                            </template>
                                            {{ !formModel.isCustomName ? '系统生成模式 (点击切换自定义)' : '自定义模式 (点击切换自动)' }}
                                        </NTooltip>
                                    </div>
                                    <template #feedback>
                                        <span class="text-xs text-gray-400" v-if="!formModel.isCustomName">
                                            路由名称一般不需要配置，系统会根据路径自动生成。
                                        </span>
                                    </template>
                                </NFormItemGi>

                                <NFormItemGi label="重定向" path="redirect">
                                    <NInput v-model:value="formModel.redirect" placeholder="可选：重定向地址" />
                                </NFormItemGi>
                            </NGrid>

                            <NFormItem label="功能配置">
                                <BSpace size="large" wrap>
                                    <NCheckbox v-model:checked="formModel.hideInMenu">隐藏菜单</NCheckbox>
                                    <NCheckbox v-model:checked="formModel.keepAlive">页面缓存</NCheckbox>
                                    <NCheckbox v-model:checked="formModel.singleMenu">单级菜单</NCheckbox>
                                    <NCheckbox v-model:checked="formModel.hideBreadcrumb">隐藏面包屑</NCheckbox>
                                    <!-- <NCheckbox v-model:checked="formModel.isLogin">需要登录</NCheckbox> -->
                                </BSpace>
                            </NFormItem>
                        </div>
                    </NCollapseItem>
                </NCollapse>
            </template>

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
import { ref, computed, reactive, watch } from 'vue'
import { type FormInst, type FormRules, NRadioGroup, NRadioButton, NCollapse, NCollapseItem } from 'naive-ui'
import type { MenuCreateParams } from '@/api/modules/system/api'
import { routeIcons } from '@/router/routeIcons'
import KeyValueSelectDialog from '@/components/KeyValueSelectDialog/index.vue'

const emit = defineEmits(['success'])
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const showModal = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editId = ref<string>('')
const randomSuffix = ref('')

// 数据源
const treeOptions = ref<IRouteDataRaw[]>([])
const flatOptions = ref<IRouteDataRaw[]>([])

// 初始表单数据
interface MenuFormState extends MenuCreateParams {
    isCustomName: boolean
}

const initialForm: MenuFormState = {
    parentId: null,
    title: '',
    name: '',
    path: '',
    componentPath: '',
    icon: '',
    sort: 1,
    keepAlive: true,
    hideInMenu: false,
    hideBreadcrumb: false,
    permanent: false,
    singleMenu: false,
    redirect: '',
    type: 1,
    code: '',
    isLogin: true,
    isCustomName: false,
    query: {},
}

const formModel = reactive<MenuFormState>({ ...initialForm })

// 计算属性，用于在 Input 中展示对象的字符串形式
const queryDisplayString = computed(() => {
    if (!formModel.query || Object.keys(formModel.query).length === 0) {
        return ''
    }
    // 展示为紧凑的 JSON 字符串，例如 {"id":"1"}
    return JSON.stringify(formModel.query)
})

// 规则验证
const rules = computed<FormRules>(() => {
    const commonRules = {
        title: { required: true, message: '请输入标题', trigger: 'blur' },
    }

    if (formModel.type === 1) {
        return {
            ...commonRules,
            name: {
                required: true,
                message: '请输入路由名称',
                trigger: ['blur', 'change'],
            },
            componentPath: {
                pattern: /^[a-zA-Z0-9/_-]+$/,
                message: '路径仅允许英文、数字、"-"、"_" 和 "/"',
                trigger: ['blur', 'input']
            }
        }
    } else if (formModel.type === 2) {
        return {
            ...commonRules,
            code: { required: true, message: '请输入权限标识', trigger: 'blur' },
        }
    } else {
        return commonRules
    }
})

const modalTitle = computed(() => {
    const action = isEdit.value ? '编辑' : '新增'
    const typeText = formModel.type === 1 ? '菜单' : '权限'
    return `${action}${typeText}`
})


/**
 * 递归获取所有父级的 path
 */
function getParentPaths(parentId: string | null): string[] {
    if (!parentId) return []
    // 从扁平数据中找父级
    const parent = flatOptions.value.find(item => item.id === parentId)
    if (!parent) return []
    // 递归向上 + 当前父级path
    return [...getParentPaths(parent.parentId || null), parent.path]
}

/**
 * 字符串转 PascalCase
 */
function toPascalCase(str: string): string {
    if (!str) return ''
    // 移除开头的 / 或空格，处理 - 分隔符
    const cleanStr = str.replace(/^\/+/, '').replace(/:/g, '')
    const parts = cleanStr.split(/[-/]/).filter(Boolean)
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

/**
 * 生成系统唯一名称
 * 逻辑：递归父级Path + 当前Path -> PascalCase -> + "_" + 随机ID(open时生成)
 */
function updateSystemName() {
    // 只有在非自定义模式且是菜单类型时才生成
    if (formModel.isCustomName || formModel.type !== 1) return

    // 1. 获取路径链 (父级 -> ... -> 当前)
    const paths = [...getParentPaths(formModel.parentId as string)]

    // 2. 加入当前路径
    if (formModel.path) {
        paths.push(formModel.path)
    }

    // 3. 转换为 PascalCase 并拼接
    // 例如 paths=['system', 'user'] -> SystemUser
    const namePrefix = paths.map(p => toPascalCase(p)).join('')

    // 4. 拼接随机后缀 (使用预生成的 randomSuffix)
    formModel.name = `${namePrefix}_${randomSuffix.value}`
}

// 监听影响名称生成的字段
watch(
    [() => formModel.path, () => formModel.parentId],
    () => {
        updateSystemName()
    }
)

// 切换类型时处理
watch(() => formModel.type, (newType) => {
    if (newType === 1 && !formModel.isCustomName) {
        // 如果切回菜单类型且是自动模式，重新计算（如果已有路径）
        updateSystemName()
    }
})

// 切换 自定义/自动 模式
const toggleCustomName = () => {
    formModel.isCustomName = !formModel.isCustomName
    if (!formModel.isCustomName) {
        // 切换回自动模式，立即重新生成
        updateSystemName()
    }
}

// --- 打开模态框 ---

function open(treeData: IRouteDataRaw[], flatData: IRouteDataRaw[], row?: any, parentId?: string) {
    treeOptions.value = treeData
    flatOptions.value = flatData
    showModal.value = true

    if (row) {
        // --- 编辑模式 ---
        isEdit.value = true
        editId.value = row.id
        const { children, id, ...rest } = row
        Object.assign(formModel, { ...initialForm, ...rest })

        // 1. 强制使用后台返回的 isCustomName
        formModel.isCustomName = !!row.isCustomName

        // 2. 处理随机后缀
        if (!formModel.isCustomName && formModel.name) {
            // 如果是自动生成模式，尝试从现有name中提取后缀，防止编辑时后缀变动
            const parts = formModel.name.split('_')
            // 如果符合 xxx_xxxxxx 格式，取最后一部分作为 suffix
            if (parts.length > 1) {
                randomSuffix.value = parts[parts.length - 1]
            } else {
                // 如果格式不符，重新生成一个新的
                randomSuffix.value = generatedId(6)
            }
        } else {
            // 自定义模式或无名字，生成新的备用
            randomSuffix.value = generatedId(6)
        }

        if (!formModel.type) formModel.type = 1


        // 如果后端返回的是 JSON 字符串，需要解析成对象
        if (typeof row.query === 'string' && row.query) {
            try {
                formModel.query = JSON.parse(row.query)
            } catch (e) {
                // 兼容旧数据（如果是 url string 格式），尝试解析，或者置空
                console.warn('Query 解析失败，重置为空', e)
                formModel.query = {}
            }
        } else {
            // 如果后端直接返回对象
            formModel.query = row.query
        }
    } else {
        // --- 新增模式 ---
        isEdit.value = false
        editId.value = ''
        Object.assign(formModel, { ...initialForm })

        // 1. 初始化 parentId
        if (parentId) {
            formModel.parentId = parentId
        }

        // 2. 生成随机ID (在打开时生成，此时 path 为空，name 暂为空)
        randomSuffix.value = generatedId(6)

        // 3. 确保默认为自动模式
        formModel.isCustomName = false

        formModel.query = {}
    }
}

async function handleSubmit() {
    formRef.value?.validate(async (errors) => {
        if (!errors) {
            // 最后校验：自动模式下，如果name为空（可能只填了path但watch没触发?），手动触发一次
            if (formModel.type === 1 && !formModel.isCustomName && !formModel.name) {
                updateSystemName()
            }

            submitting.value = true
            try {
                const submitData = { ...formModel }

                // 清理按钮类型的冗余数据
                if (submitData.type === 2) {
                    submitData.path = ''
                    submitData.componentPath = ''
                    submitData.name = ''
                    submitData.redirect = ''
                    submitData.icon = ''
                    submitData.keepAlive = false
                    submitData.hideInMenu = true
                    submitData.isCustomName = false
                }

                if (isEdit.value) {
                    await API.system.updateMenu(editId.value, submitData)
                    message.success('更新成功')
                } else {
                    await API.system.createMenu(submitData)
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