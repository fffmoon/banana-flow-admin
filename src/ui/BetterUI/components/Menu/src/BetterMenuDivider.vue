<script lang="ts" setup>
import type { IMenuItemProps, MenuOption } from './types'

interface IProps extends IMenuItemProps {
  item: MenuOption
}
const props = defineProps<IProps>()

const indentStyle = computed(() => ({
  paddingLeft: props.collapsed ? 0 : `${props.depth * props.rootIndent}px`,
  marginLeft: props.collapsed ? 'auto' : 'inherit',
  marginRight: props.collapsed ? 'auto' : 'inherit',
  width: props.collapsed ? '80%' : '100%',
}))
</script>

<template>
  <div v-if="item.show !== false" class="menu-divider" :style="indentStyle"></div>
</template>

<style lang="scss" scoped>
.menu-divider {
  height: 1px;
  background: var(--menu-divider);
  margin: 8px 0;
}
</style>
