<script lang="ts" setup>
import type { IMenuItemProps, MenuOption, MenuOptionType } from './types'
import BetterMenuDivider from './BetterMenuDivider.vue'
import BetterMenuGroup from './BetterMenuGroup.vue'
import BetterMenuItem from './BetterMenuItem.vue'

interface IProps extends IMenuItemProps {
  item: MenuOption
}

const props = defineProps<IProps>()

// 根据类型渲染不同的组件
const componentMap = {
  divider: BetterMenuDivider,
  group: BetterMenuGroup,
  menu: BetterMenuItem,
} as const

const componentType = computed(() => {
  return (props.item.type ?? 'menu') as MenuOptionType
})

const componentProps = computed(() => {
  return {
    item: props.item,
    depth: props.depth,
    collapsed: props.collapsed,
    rootIndent: props.rootIndent,
    collapsedIconSize: props.collapsedIconSize,
    indent: props.indent,
  }
})
</script>

<template>
  <component :is="componentMap[componentType]" v-bind="componentProps" />
</template>
