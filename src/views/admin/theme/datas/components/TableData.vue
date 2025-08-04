<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-27 11:28:51
 * @LastEditTime: 2025-04-27 13:22:40
-->
<script lang='ts' setup>
import type { DataTableColumns } from 'naive-ui'
import type { ThemeVariable } from '../index.type'
import { useThemeStore } from '@/theme'
import ColorBlock from './ColorBlock.vue'
import OperationButton from './OperationButton.vue'

const themeStore = useThemeStore()
// 逻辑，处理

// 转换变量名规则
function convertVariableName(key: string) {
  return `--custom-${key
    .replace(/([A-Z])/g, '-$1')
    .replace(/(\d+)/g, '-$1')
    .toLowerCase()}`
}

// 生成表格数据
const themeData = computed((): ThemeVariable[] => {
  return Object.entries(themeStore.getCustomOptions).map(([key, value]) => {
    const isColor = /^(?:#|rgb|hsl)/i.test(value as string)
    return {
      key,
      value: value as string,
      isColor,
      converted: convertVariableName(key),
    }
  })
})

// 表格列
const columns: DataTableColumns<ThemeVariable> = [
  {
    title: '标志',
    key: 'key',
  },
  {
    title: '颜色',
    key: 'value',
    render(row: ThemeVariable) {
      return row.isColor ? h(ColorBlock, { color: row.value }) : '-'
    },
  },
  {
    title: '用途',
    key: 'cn',
    render() {
      return '-'
    },
  },
  {
    title: '原始数据',
    key: 'value',
  },
  {
    title: '转化数据',
    key: 'converted',
  },
  {
    title: '操作',
    key: 'actions',
    minWidth: 180,
    render: row => h(OperationButton, {
      rowData: row,
    }),
  },
]

// 搜索关键词
const searchQuery = ref('')

// 过滤后的数据
const filteredThemeData = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query)
    return themeData.value

  return themeData.value.filter((item) => {
    // 需要匹配的字段列表
    const fieldsToSearch = [
      item.key, // 标志
      item.value, // 颜色 & 原始数据
      item.converted, // 转化数据
    ]

    return fieldsToSearch.some(field =>
      String(field).toLowerCase().includes(query),
    )
  })
})
</script>

<template>
  <!-- 表格数据 -->
  <div class="wh-full overflow-auto">
    <BSpace vertical class="wh-full">
      <NInput v-model:value="searchQuery" placeholder="搜索" clearable @keydown.esc="searchQuery = ''">
        <template #prefix>
          <div class="i-mdi-magnify"></div>
        </template>
      </NInput>
      <NDataTable
        :style="{ height: `100%` }" flex-height :columns="columns" :data="filteredThemeData"
        :pagination="false" :bordered="false"
      />
    </BSpace>
  </div>
</template>
