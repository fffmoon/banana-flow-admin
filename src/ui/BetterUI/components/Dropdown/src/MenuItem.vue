<script lang="ts" setup>
import type { CustomDropdownOption, Placement } from './types'
import { getPostionStyle, renderLabelContent } from '@ui/BetterUI/_utils'
import { computed, defineProps, ref } from 'vue'

interface IProps {
  menuItems: CustomDropdownOption[]
  // 理想中的出现位置
  placement: Placement
  // 递归层级，用于统计目前递归了多少次
  recursiveLevel?: number
}
const props = withDefaults(defineProps<IProps>(), {
  recursiveLevel: 0,
})

const emits = defineEmits(['close', 'select'])

const showSubMenuId = ref<number | string | null>(null)
const currentItemElement = ref<EventTarget | null>(null)
const contextMenuRef = ref<HTMLElement | null>(null)
let timeoutId: NodeJS.Timeout | null = null
// 计算后位置（自动调整）
const isOpacity = ref(true)
const contextStyle = ref({})

function updatePosition() {
  isOpacity.value = true
  contextStyle.value = getPostionStyle(props.placement)
  nextTick(() => {
    requestAnimationFrame(() => {
      updateCurrentPositions()
    })
  })
}

onMounted(() => {
  updatePosition()
})

function handleMouseEnter(event: MouseEvent, item: CustomDropdownOption) {
  const target = event.currentTarget
  currentItemElement.value = target
  showSubMenuId.value = item.key
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

// 是否具有图标
const hasIcon = computed(() => {
  return props.menuItems.some(item => item.icon)
})

// 菜单事件点击
function menuItemClick(item: CustomDropdownOption) {
  // console.log('菜单事件点击', item.key, item)
  if (item.children && item.children.length > 0 && !item.handler)
    return
  if (item.handler && !item.disabled) {
    item.handler()
  }
  emits('select', item.key, item)
  // 延迟关闭
  setTimeout(() => emits('close'), 0)
}

function updateCurrentPositions() {
  // console.log('updateCurrentPositions')
  if (!contextMenuRef.value)
    return false
  // 获取触发元素位置
  const triggerRect = (contextMenuRef.value as HTMLElement).getBoundingClientRect()
  // 计算视窗可用空间
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const spaceLeft = triggerRect.left
  const spaceRight = windowWidth - triggerRect.right
  const spaceTop = triggerRect.top
  const spaceBottom = windowHeight - triggerRect.bottom
  // console.log('144', triggerRect, windowWidth, windowHeight)

  // 根据可用空间调整位置
  let newPlacement: Placement = props.placement

  // 水平方向调整
  if (newPlacement.includes('right') && spaceRight < 0) {
    newPlacement = newPlacement.replace('right', 'left') as Placement
  }
  else if (newPlacement.includes('left') && spaceLeft < 0) {
    newPlacement = newPlacement.replace('left', 'right') as Placement
  }

  // 垂直方向调整
  if (newPlacement.includes('bottom') && spaceBottom < 0) {
    newPlacement = newPlacement.replace('bottom', 'top') as Placement
  }
  else if (newPlacement.includes('top') && spaceTop < 0) {
    newPlacement = newPlacement.replace('top', 'bottom') as Placement
  }
  else if (newPlacement.includes('start') && spaceBottom < 0) {
    newPlacement = newPlacement.replace('start', 'end') as Placement
  }
  else if (newPlacement.includes('end') && spaceBottom < 0) {
    newPlacement = newPlacement.replace('end', 'start') as Placement
  }

  if (newPlacement === 'top') {
    if (spaceLeft < 0) {
      newPlacement = 'top-start'
    }
    else if (spaceRight < 0) {
      newPlacement = 'top-end'
    }
  }
  else if (newPlacement === 'bottom') {
    if (spaceLeft < 0) {
      newPlacement = 'bottom-start'
    }
    else if (spaceRight < 0) {
      newPlacement = 'bottom-end'
    }
  }
  else if (newPlacement === 'left') {
    if (spaceTop < 0) {
      newPlacement = 'left-start'
    }
    else if (spaceBottom < 0) {
      newPlacement = 'left-end'
    }
  }
  else if (newPlacement === 'right') {
    if (spaceTop < 0) {
      newPlacement = 'right-start'
    }
    else if (spaceBottom < 0) {
      newPlacement = 'right-end'
    }
  }

  isOpacity.value = false
  contextStyle.value = getPostionStyle(newPlacement)
}

defineExpose({
  updatePosition,
})
</script>

<template>
  <div ref="contextMenuRef" class="context-box" :style="contextStyle" :class="{ 'is-opacity': isOpacity }">
    <template v-for="(item) in menuItems" :key="item.key">
      <!-- 分割线 -->
      <hr v-if="item.type === 'divider'" class="divider" />
      <!-- 正常菜单 -->
      <div
        v-else class="menu-item base-menu-div" :class="{
          'opacity-50 cursor-not-allowed': item.disabled,
          'menu-item-hover': item.key === showSubMenuId,
        }" @mouseenter="handleMouseEnter($event, item)" @click.stop="menuItemClick(item)"
      >
        <!-- 图标 -->
        <div v-if="hasIcon" class="mr-2 h-4 w-4 flex-center">
          <component :is="item.icon?.()" class="h-full w-full text-muted-foreground" />
        </div>

        <!-- 文本 -->
        <span class="flex-1 text-sm">
          <component :is="() => renderLabelContent(item.label)" />
        </span>

        <!-- 下级菜单图标 -->
        <div v-if="item?.children?.length" class="i-mdi-chevron-right ml-4" />

        <!-- 下级菜单 -->
        <MenuItem
          v-if="item?.children
            ?.length && showSubMenuId === item.key" :menu-items="item.children" placement="right-start"
          :recursive-level="recursiveLevel + 1" @close="emits('close')"
          @select="(key, item) => emits('select', key, item)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.context-box {
  --at-apply: 'absolute z-999 min-w-[12rem] rounded-md border bg-background p-1 shadow-lg text-foreground border-1px border-solid';

  border-color: hsl(214.3deg 31.8% 91.4%);
  background-color: hsl(0deg 0% 100%);
  box-shadow: 0 10px 38px -10px rgb(22 23 24 / 10%), 0 10px 20px -15px rgb(22 23 24 / 10%);
  transition: transform 0.1s ease-out;
  pointer-events: auto;

  /* 添加平滑过渡 */
  transform-origin: top left;
}

.is-opacity {
  opacity: 0;
}

.menu-item {
  --at-apply: flex items-center px-2 py-1.5 rounded-[4px] transition-colors outline-none relative;
  ;
}

.menu-item-hover {
  background-color: hsl(210deg 40% 96.1%);
}

.divider {
  --at-apply: 'my-1 h-1px border-none';

  background-color: hsl(214.3deg 31.8% 91.4%);
}

.dark .context-menu {
  border-color: hsl(240deg 5% 15.7%);
  background-color: hsl(240deg 5.9% 3.9%);
  box-shadow:
    0 10px 38px -10px rgb(0 0 0 / 30%),
    0 10px 20px -15px rgb(0 0 0 / 20%);
}

.dark .menu-item-hover {
  background-color: hsl(240deg 5.9% 11.6%);
}

.dark .menu-item:focus-visible {
  background-color: hsl(240deg 5.9% 15.7%);
  outline: 2px solid hsl(240deg 5.9% 25.9%);
}

.dark .divider {
  background-color: hsl(217.2deg 32.6% 17.5%);
}
</style>
