<script lang='ts' setup>
import type { CustomContentMenuOption } from './types'
import {
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from 'reka-ui'
import './styles.scss'

interface IProps {
  options: CustomContentMenuOption[]
  // 递归层级，用于统计目前递归了多少次
  recursiveLevel?: number
}

const props = withDefaults(defineProps<IProps>(), {
  recursiveLevel: 0,
})

const emits = defineEmits(['close', 'select'])

function menuItemClick(item: CustomContentMenuOption) {
  console.log('菜单事件点击', item.key, item)
  if (item.children && item.children.length > 0 && !item.handler)
    return
  if (item.handler && !item.disabled) {
    item.handler()
  }
  emits('select', item.key, item)
}
// 是否具有图标
const hasIcon = computed(() => {
  return props.options.some(item => item.icon)
})
</script>

<template>
  <template v-for="item in options" :key="item.key">
    <!-- 分隔线 -->
    <template v-if="item.type === 'divider'">
      <ContextMenuSeparator class="ContextMenuSeparator"></ContextMenuSeparator>
    </template>
    <!-- 有子菜单的项目 -->
    <template v-else-if="item?.children?.length">
      <ContextMenuSub>
        <ContextMenuSubTrigger value="more toolsz" class="ContextMenuSubTrigger">
          <!-- 图标 -->
          <div v-if="hasIcon" class="mr-2 h-4 w-4">
            <component :is="item.icon?.()" class="h-full w-full text-muted-foreground" />
          </div>
          <!-- 文本 -->
          {{ item.label }}
          <div class="RightSlot">
            <div class="i-mdi-chevron-right" />
          </div>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent class="ContextMenuSubContent" :side-offset="2" :align-offset="-5">
            <ContextMenuItems
              :recursive-level="recursiveLevel + 1" :options="item.children"
              @select="(key, item) => emits('select', key, item)"
            />
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
    </template>
    <!-- 普通项目 -->
    <template v-else>
      <ContextMenuItem
        :disabled="item.disabled" value="New Tab" class="ContextMenuItem"
        @click.stop="menuItemClick(item)"
      >
        <!-- 图标 -->
        <div v-if="hasIcon" class="mr-2 h-4 w-4">
          <component :is="item.icon?.()" class="h-full w-full text-muted-foreground" />
        </div>
        <!-- 文本 -->
        {{ item.label }}
        <!-- 快捷键 -->
        <div v-if="item.shortcut" class="RightSlot">
          {{ item.shortcut }}
        </div>
      </ContextMenuItem>
    </template>
  </template>
</template>

<style lang='scss' scoped>
@import url('./styles.scss');
</style>
