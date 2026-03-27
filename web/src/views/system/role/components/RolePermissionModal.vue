<template>
    <NModal v-model:show="showModal" title="分配菜单权限" preset="card" class="w-600px">
        <div class="h-400px overflow-y-auto border border-gray-100 rounded p-2">
            <NSpin :show="loading">
                <!-- 
                    关键设置：
                    1. :cascade="false" -> 关闭默认的级联，完全由代码控制
                    2. @update:checked-keys -> 绑定自定义处理函数
                -->
                <NTree 
                    block-line 
                    :cascade="false" 
                    checkable 
                    :data="treeData" 
                    :checked-keys="checkedKeys" 
                    key-field="id"
                    label-field="title" 
                    :default-expand-all="true" 
                    @update:checked-keys="handleCheck" 
                />
            </NSpin>
        </div>
        <template #footer>
            <BSpace justify="end">
                <NButton @click="showModal = false">取消</NButton>
                <NButton type="primary" :loading="submitting" @click="handleSubmit">保存权限</NButton>
            </BSpace>
        </template>
    </NModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeOption } from 'naive-ui'
import { listToTree } from '../../menu/js/utils'
import type { IRouteDataRaw } from 'types/vue-router' 

const emit = defineEmits(['success'])
const message = useMessage()

const showModal = ref(false)
const submitting = ref(false)
const loading = ref(false)
const roleId = ref('')
const treeData = ref<TreeOption[]>([])

// 保存原始扁平数据，用于查找父子关系
const flatMenuList = ref<IRouteDataRaw[]>([])

// 当前选中的 keys
const checkedKeys = ref<string[]>([])

async function open(id: string, currentMenuIds: string[] = []) {
    roleId.value = id
    showModal.value = true
    // 打开时，需要确保数据的完整性（如果后端只存了子节点，回显时要把父节点也勾上）
    // 如果后端存的是全量数据，直接赋值即可
    checkedKeys.value = currentMenuIds 
    await fetchMenuTree()
}

async function fetchMenuTree() {
    if (treeData.value.length > 0) return 
    loading.value = true
    try {
        const { data } = await API.system.getMenuList()
        flatMenuList.value = data || [] // 保存扁平数据
        treeData.value = listToTree(data) as unknown as TreeOption[]
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

/**
 * 核心逻辑：自定义勾选处理
 * keys: 勾选操作后的新 keys 列表（此时已经是 NaiveUI根据 cascade=false 计算后的结果，即只包含点击的那一项变化）
 * option: 选中的节点对象（数组）
 * meta: 包含 { node, action: 'check' | 'uncheck' }，非常有用的元数据
 */
function handleCheck(keys: string[], _option: TreeOption[], meta: { node: TreeOption, action: 'check' | 'uncheck' }) {
    const currentNodeId = meta.node.id as string
    
    // 创建一个 Set 方便操作
    let newCheckedKeys = new Set(keys)

    if (meta.action === 'check') {
        // 【场景 1：勾选】
        // 规则：勾选子节点 -> 必须自动勾选所有父级
        // 规则：勾选父节点 -> 不影响子节点（默认行为，无需额外代码）
        
        let parentId = findParentId(currentNodeId)
        while (parentId) {
            newCheckedKeys.add(parentId)
            parentId = findParentId(parentId) // 继续向上找爷爷节点
        }
    } else if (meta.action === 'uncheck') {
        // 【场景 2：取消勾选】
        // 规则：取消父节点 -> 必须自动取消所有子节点
        // 原因：如果父节点没选中，子节点选中在逻辑上是不成立的（或者会导致下次点击时父节点又被强制选中）
        
        const childrenIds = getAllDescendantIds(currentNodeId)
        childrenIds.forEach(childId => {
            newCheckedKeys.delete(childId)
        })
    }

    // 更新视图
    checkedKeys.value = Array.from(newCheckedKeys)
}

/**
 * 辅助函数：在扁平数据中查找父级ID
 */
function findParentId(id: string): string | undefined {
    const item = flatMenuList.value.find(i => i.id === id)
    return item?.parentId || undefined
}

/**
 * 辅助函数：获取某个节点的所有后代ID（递归）
 */
function getAllDescendantIds(id: string): string[] {
    const result: string[] = []
    // 找到直接子级
    const children = flatMenuList.value.filter(item => item.parentId === id)
    
    children.forEach(child => {
        result.push(child.id)
        // 递归找孙子级
        result.push(...getAllDescendantIds(child.id))
    })
    
    return result
}

async function handleSubmit() {
    submitting.value = true
    try {
        // 因为 handleCheck 已经在实时维护父子关系了
        // 所以这里直接提交 checkedKeys 即可，它已经包含了所有必要的父节点 ID
        await API.system.roles.updateRoleMenus(roleId.value, checkedKeys.value)
        message.success('权限分配成功')
        showModal.value = false
        emit('success')
    } catch (error) {
        console.error(error)
    } finally {
        submitting.value = false
    }
}

defineExpose({ open })
</script>