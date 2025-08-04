<script lang="ts" setup>
import type { CustomContentMenuOption } from './types'
import {
  ContextMenuContent,
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuTrigger,
} from 'reka-ui'
import ContextMenuItems from './ContextMenuItems.vue'

interface IProps {
  options: CustomContentMenuOption[]
}

defineOptions({
  displayName: 'ContentMenu',
})

defineProps<IProps>()

const emits = defineEmits(['update:show', 'close', 'select'])

// 打开的状态
function open(status) {
  emits('update:show', status)
}

// 处理菜单项选择
function handleMenuSelect(key: string | number, item: CustomContentMenuOption) {
  emits('select', key, item)
}
</script>

<template>
  <div class="context-menu-wrapper">
    <ContextMenuRoot @update:open="open">
      <ContextMenuTrigger as-child>
        <slot></slot>
      </ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent class="ContextMenuContent" :side-offset="5">
          <ContextMenuItems :options="options" @select="handleMenuSelect" />
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenuRoot>
  </div>
</template>

<style lang='scss' scoped>
@import url('./styles.scss');

.context-menu-wrapper {
  display: inline-block;
  position: relative;
}
</style>
