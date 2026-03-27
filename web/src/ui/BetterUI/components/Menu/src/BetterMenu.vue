<script lang="ts" setup>
import type { FlatMenuOption, MenuExposeMethods, MenuOption } from './types'
import BetterMenuNode from './BetterMenuNode.vue'
import { BetterMenuProvideKey } from './types'
import { flattenMenuOptions } from './utils'

interface IProps {
  // 第一级的缩进，如果没有设置则默认使用indent的值
  rootIndent?: number
  // 后续每一级的缩进
  indent?: number
  // 是否折叠
  collapsed?: boolean
  // 折叠宽度
  collapsedWidth: number
  // 折叠图标大小
  collapsedIconSize: number
  // 菜单选项
  options: MenuOption[]
  // 选中的菜单key
  value: string
  onUpdateValue: (key: string, item: MenuOption) => void
}

defineOptions({
  displayName: 'Menu',
})

const props = withDefaults(defineProps<IProps>(), {
  indent: 18,
  collapsed: false,
  collapsedWidth: 48,
  collapsedIconSize: 22,
  options: () => [],
  value: '',
})

const rootIndentComputed = computed(() => props.rootIndent ?? props.indent)

// 创建父菜单映射，用于快速查找父菜单
// 创建扁平化的菜单选项
const flatOptions = ref<FlatMenuOption[]>([])
// 当前选中的菜单key
const selectedKey = ref(props.value)

watch(() => props.value, () => {
  selectedKey.value = props.value
})

// 创建展开状态映射
const expandedMap = ref<Record<string, boolean>>({})

// 处理菜单点击
function handleSelect(key: string, item: MenuOption) {
  // console.log('handleSelect', key, item)
  // 如果有子菜单，切换展开显示
  if (item.children && item.children.length > 0) {
    toggleExpandState(item.key)
    return true
  }
  // 如果存在自定义回调函数，触发回调
  if (props.onUpdateValue) {
    props.onUpdateValue(key, item)
    return true
  }
  // 如果是禁用项，不做任何操作
  if (item.disabled)
    return
  // 更新选中的菜单key
  selectedKey.value = key
}

// 切换菜单项的展开状态
function toggleExpandState(key: string) {
  expandedMap.value[key] = !expandedMap.value[key]
  // 当父项折叠时候，会使用递归，遍历父项下所有的子项，将所有的子项设置为折叠状态
  flatOptions.value.forEach((item) => {
    if (item.parents.includes(key)) {
      expandedMap.value[item.key] = false
    }
  })
}
// 从flatOptions中获取指定节点的所有父节点
function getParents(key: string): string[] {
  const item = flatOptions.value.find(option => option.key === key)
  return item?.parents || []
}

watch(() => props.options, (newOptions) => {
  flatOptions.value = flattenMenuOptions(newOptions)
}, { immediate: true, deep: true })

// 展开指定的菜单项
function showOption(key?: string) {
  const targetKey = key || selectedKey.value
  if (!targetKey)
    return

  // 确保当前项展开
  expandedMap.value[targetKey] = true

  // 展开所有父项
  getParents(targetKey).forEach((parentKey) => {
    expandedMap.value[parentKey] = true
  })
}

// 高亮项目
// 储存选中菜单key的父级key
const activeKeys = ref<Set<string>>(new Set())
// 监听选中键变化
watch(selectedKey, (newVal) => {
  if (!newVal)
    return

  // 创建新的高亮集合
  const newActiveKeys = new Set<string>()

  // 添加选中项
  newActiveKeys.add(newVal)

  // 添加所有父项
  getParents(newVal).forEach((parentKey) => {
    newActiveKeys.add(parentKey)
  })

  activeKeys.value = newActiveKeys
}, { immediate: true })

// 对外暴露方法
defineExpose<MenuExposeMethods>({
  showOption,
})

// 提供展开状态和方法给子组件
provide(BetterMenuProvideKey, {
  expandedMap,
  handleSelect,
  toggleExpandState,
  activeKeys,
  selectedKey,
})
</script>

<template>
  <div
    class="better-menu" :style="{
      width: props.collapsed ? `${collapsedWidth}px` : '100%',
    }"
  >
    <div class="menu-items">
      <template v-for="item in options" :key="item.key">
        <BetterMenuNode
          :item="item" :depth="0" :collapsed="props.collapsed" :root-indent="rootIndentComputed"
          :indent="indent" :collapsed-icon-size="collapsedIconSize"
        />
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.better-menu {
  transition: width 0.3s ease;
  background: var(--custom-menu-color);
  overflow: hidden;

  .menu-items {
    // padding: 8px 0;
  }

  .menu-divider {
    height: 1px;
    background: var(--custom-menu-item-divider-color);
    margin: 8px 12px;
  }

  .menu-group-label {
    padding: 8px 12px;
    font-size: 12px;
    color: var(--custom-menu-group-text-color);
    text-transform: uppercase;
  }

  &.collapsed {
    .menu-label {
      display: none;
    }

    .menu-icon {
      justify-content: center;
    }
  }
}
</style>
