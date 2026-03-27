<template>
  <BSpace vertical class="wh-full">
    <!-- 顶部搜索区域 -->
    <NCard class="title">
      <NForm class="flex flex-wrap gap-y-[--space-md]" inline label-width="auto" :show-feedback="false"
        label-placement="left" :model="searchForm">
        <NFormItem label="关键词">
          <NInput v-model:value="searchForm.keyword" placeholder="支持标题、权限、路径" clearable
            @update:value="onKeywordInput" />
        </NFormItem>
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

    <NCard class="body flex-1">
      <BSpace vertical class="wh-full">
        <!-- 操作栏 -->
        <BSpace>
          <NButton v-perm="'system:menu:create'" type="primary" @click="handleAdd">
            <template #icon>
              <div class="i-mdi-plus" />
            </template>
            新增菜单
          </NButton>
          <NButton @click="toggleExpandAll" :disabled="expandAllLoading">
            <template #icon>
              <div :class="isExpandAll ? 'i-mdi-arrow-collapse-vertical' : 'i-mdi-arrow-expand-vertical'" />
            </template>
            {{ isExpandAll ? '折叠所有' : '展开所有' }}
          </NButton>
        </BSpace>

        <!-- 表格 -->
        <div class="flex-1 overflow-hidden mt-2">
          <NDataTable ref="tableRef" :columns="columns" :data="displayTreeData" :loading="loading" striped
            :row-key="(row) => row.id" v-model:expanded-row-keys="expandedKeys" flex-height :style="{ height: '100%' }"
            class="h-full" />
        </div>
      </BSpace>
    </NCard>

    <MenuModal ref="modalRef" @success="fetchData" />
  </BSpace>
</template>

<script setup lang="ts">
import { h, ref, onMounted, reactive, computed, nextTick } from 'vue'
import { NButton, NTag, useDialog, type DataTableColumns, NHighlight, NTooltip, NEllipsis } from 'naive-ui'
import type { IRouteDataRaw } from 'types/vue-router'
import MenuModal from './components/MenuModal.vue'
import { listToTree } from './js/utils'

const loading = ref(false)
const flatData = ref<IRouteDataRaw[]>([])
const expandedKeys = ref<string[]>([])
const isExpandAll = ref(false)
const searchForm = reactive({ keyword: '' })
const modalRef = ref<InstanceType<typeof MenuModal> | null>(null)
const dialog = useDialog()
const message = useMessage()
const userStore = useUserStore()
// 展开所有的loading
const expandAllLoading = ref(false)

// 递归获取所有子节点的 ID (包含自身)
function getAllIds(nodes: IRouteDataRaw[], result: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      result.push(node.id)
      getAllIds(node.children, result)
    }
  }
  return result
}

// 核心过滤逻辑
const displayTreeData = computed(() => {
  const keyword = searchForm.keyword.trim().toLowerCase()
  const tree = listToTree(flatData.value)
  if (!keyword) return tree

  function filterTree(nodes: IRouteDataRaw[]): IRouteDataRaw[] {
    const filtered: IRouteDataRaw[] = []
    for (const node of nodes) {
      const isMatch = (node.title && node.title.toLowerCase().includes(keyword)) ||
        (node.name && node.name.toLowerCase().includes(keyword)) ||
        (node.path && node.path.toLowerCase().includes(keyword)) ||
        (node.code && node.code.toLowerCase().includes(keyword)) ||
        (node.componentPath && node.componentPath.toLowerCase().includes(keyword))

      let childrenMatchNodes: IRouteDataRaw[] = []
      if (node.children) childrenMatchNodes = filterTree(node.children)

      if (isMatch || childrenMatchNodes.length > 0) {
        const newNode = { ...node, children: childrenMatchNodes.length > 0 ? childrenMatchNodes : undefined }
        filtered.push(newNode)
      }
    }
    return filtered
  }
  return filterTree(tree)
})

const columns: DataTableColumns<IRouteDataRaw> = [
  {
    title: '菜单标题',
    key: 'title',
    width: 220,
    fixed: 'left',
    className: 'flex w-full',
    render(row) {
      const iconNode = row.icon
        ? h('div', { class: `${row.icon} text-18px mr-2` })
        : null

      const titleNode = h(NHighlight, {
        text: row.title,
        patterns: [searchForm.keyword],
      })

      return h(
        NEllipsis,
        {
          style: 'max-width: 100%;'
        },
        { default: () => [iconNode, titleNode] }
      )
    }
  },
  {
    title: '类型',
    key: 'type',
    width: 80,
    render(row) {
      const typeTag = row.type === 2
        ? h(NTag, { type: 'success', size: 'small' }, { default: () => '权限' })
        : h(NTag, { type: 'primary', size: 'small' }, { default: () => '菜单' })
      return h('div', { class: 'w-full items-center', style: { verticalAlign: 'middle' } }, [typeTag])
    },
    align: 'center',
  },
  {
    title: '权限标识',
    key: 'code',
    width: 180,
    ellipsis: { tooltip: true },
    render(row) {
      return h(NHighlight, { text: row.code || '--', patterns: [searchForm.keyword] })
    }
  },
  {
    title: '链接地址',
    key: 'path',
    width: 150,
    ellipsis: { tooltip: true },
    render(row) {
      if (row.type === 2) return '--'
      return h(NHighlight, { text: row.path, patterns: [searchForm.keyword] })
    }
  },
  {
    title: '组件路径',
    key: 'componentPath',
    width: 200,
    ellipsis: { tooltip: true },
    render(row) {
      return h(NHighlight, { text: row.componentPath || '--', patterns: [searchForm.keyword] })
    }
  },
  {
    title: '排序',
    key: 'sort',
    width: 80,
    render: (row) => h(NTag, { size: 'small' }, { default: () => row.sort }),
    align: 'center'
  },
  {
    title: '配置',
    key: 'status',
    width: 200,
    render(row) {
      if (row.type === 2) {
        return h(NTag, { size: 'small', bordered: false }, { default: () => '权限控制' })
      }
      return h('div', { class: 'flex gap-2 flex-wrap' }, [
        row.hideInMenu ? h(NTag, { type: 'warning', size: 'small', bordered: false }, { default: () => '隐藏' }) : null,
        row.keepAlive ? h(NTag, { type: 'success', size: 'small', bordered: false }, { default: () => '缓存' }) : null,
        // !row.isLogin ? h(NTag, { type: 'info', size: 'small', bordered: false }, { default: () => '免登' }) : null,
        row.hideBreadcrumb ? h(NTag, { color: { color: '#f9f9f9', textColor: '#999' }, size: 'small', bordered: false }, { default: () => '无面包屑' }) : null
      ])
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render(row) {
      return h('div', { class: 'flex gap-2' }, [
        row.type === 1 && userStore.hasPerms('system:menu:create') ? h(
          NButton,
          { size: 'small', type: 'primary', text: true, onClick: () => handleAddSub(row) },
          { default: () => '新增', icon: () => h('i', { class: 'i-mdi-plus' }) }
        ) : null,
        userStore.hasPerms('system:menu:update') ? h(
          NButton,
          { size: 'small', type: 'info', text: true, onClick: () => handleEdit(row) },
          { default: () => '编辑', icon: () => h('i', { class: 'i-mdi-file-edit-outline' }) }
        ) : null,
        userStore.hasPerms('system:menu:delete') ? h(
          NButton,
          { size: 'small', type: 'error', text: true, onClick: () => handleDelete(row) },
          { default: () => '删除', icon: () => h('i', { class: 'i-mdi-delete-outline' }) }
        ) : null,
      ])
    }
  }
]


async function fetchData() {
  loading.value = true
  try {
    const { data } = await API.system.getMenuList()
    flatData.value = data || []
    if (searchForm.keyword) {
      await nextTick()
      onKeywordInput()
    }
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

// 搜索按钮点击事件：只负责请求数据
function handleSearch() {
  fetchData()
}

// 输入框输入事件：只负责本地展开/折叠逻辑，不请求数据
function onKeywordInput() {
  if (searchForm.keyword) {
    // 有关键词时，展开过滤后的所有节点
    const currentTree = displayTreeData.value
    expandedKeys.value = getAllIds(currentTree)
  } else {
    // 关键词清空时，折叠所有
    expandedKeys.value = []
    isExpandAll.value = false
  }
}

// 重置按钮：清空关键词 + 请求数据
function handleReset() {
  searchForm.keyword = ''
  expandedKeys.value = []
  isExpandAll.value = false
  fetchData()
}

function toggleExpandAll() {
  isExpandAll.value = !isExpandAll.value
  if (isExpandAll.value) {
    expandAllLoading.value = true
    setTimeout(() => {
      expandAllLoading.value = false
    }, 500)
  }
  setTimeout(() => {
    if (isExpandAll.value) expandedKeys.value = getAllIds(displayTreeData.value)
    else expandedKeys.value = []
  }, 0);
}

function handleAdd() {
  modalRef.value?.open(listToTree(flatData.value), flatData.value)
}

function handleAddSub(row: IRouteDataRaw) {
  modalRef.value?.open(listToTree(flatData.value), flatData.value, undefined, row.id)
}

function handleEdit(row: IRouteDataRaw) {
  modalRef.value?.open(listToTree(flatData.value), flatData.value, row)
}

function handleDelete(row: IRouteDataRaw) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除 "${row.title}" 吗？该操作不可恢复。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await API.system.deleteMenu(row.id)
        message.success('删除成功')
        fetchData()
      } catch (error) { }
    }
  })
}

onMounted(() => fetchData())
</script>