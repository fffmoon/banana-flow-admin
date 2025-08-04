<script lang='ts' setup>
import type { Placement } from '@ui/BetterUI'
import type { TriggerType } from './type'
import { getScrollParents, PopupManager } from '@ui/BetterUI/_utils'
import PopoverContainer from './PopoverContainer.vue'

// 逻辑，处理
interface IProps {
  trigger?: TriggerType
  placement?: Placement
  showArrow?: boolean
  to?: string | HTMLElement | false
  show?: boolean
}
defineOptions({
  displayName: 'Popover',
})

const props = withDefaults(defineProps<IProps>(), {
  trigger: 'hover',
  placement: 'top',
  showArrow: true,
  to: 'body',
  show: false,
})

const emits = defineEmits(['update:show', 'clickoutside'])

// 菜单显示状态
const isOpen = ref(props.show)
const triggerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const currentId = generatedId()

// 监听外部 show 属性变化控制菜单显隐
watch(() => props.show, (newVal) => {
  if (isOpen.value !== newVal) {
    isOpen.value = newVal
  }
})

// 切换菜单状态
function toggleMenu(status?: boolean) {
  isOpen.value = status === undefined ? !isOpen.value : status
  emits('update:show', isOpen.value)
  if (isOpen.value) {
    nextTick(() => updatePosition())
  }
  // 外部关闭
  if (isOpen.value) {
    PopupManager.register({
      id: currentId,
      triggerType: props.trigger,
      close: () => toggleMenu(false),
    })

    // 设置DOM标识
    if (contentRef.value) {
      contentRef.value.dataset.npopover = currentId
    }
  }
  else {
    PopupManager.unregister(currentId)
  }
}

onUnmounted(() => {
  PopupManager.unregister(currentId)
})

// 鼠标悬停时显示菜单
let hoverTimeout: ReturnType<typeof setTimeout> | null = null

// 打开下拉菜单
function onOpenDropdown() {
  onKeepMenuOpenStatus()
  if (props.trigger !== 'hover')
    return
  toggleMenu(true)
}

// 鼠标离开时关闭菜单
function onHideDropdown() {
  if (props.trigger !== 'hover')
    return

  if (hoverTimeout)
    clearTimeout(hoverTimeout)
  hoverTimeout = setTimeout(() => {
    toggleMenu(false)
  }, 1000 * 0.1)
}

// 保持下拉菜单打开状态
function onKeepMenuOpenStatus() {
  if (hoverTimeout)
    clearTimeout(hoverTimeout)
}

// #region ➤ 下拉选项出现的位置
// ================================================

const containerPosition = reactive({
  left: 0,
  top: 0,
  width: 0,
  height: 0,
})

// 定义滚动父级容器数组
let scrollParents: HTMLElement[] = []

// 组件挂载时
onMounted(() => {
  window.addEventListener('resize', updatePositionThrottle)
  if (triggerRef.value) {
    scrollParents = getScrollParents(triggerRef.value as HTMLElement)
    scrollParents.forEach((parent) => {
      parent.addEventListener('scroll', updatePositionThrottle)
    })
  }
})

// 组件卸载时
onUnmounted(() => {
  window.removeEventListener('resize', updatePositionThrottle)
  scrollParents.forEach((parent) => {
    parent.removeEventListener('scroll', updatePositionThrottle)
  })
})

function updatePosition() {
  if (triggerRef.value) {
    const { top, left, width, height } = triggerRef.value.getBoundingClientRect()
    containerPosition.top = top
    containerPosition.left = left
    containerPosition.width = width
    containerPosition.height = height
  }
}

let timer: number | null = null

// 节流的形式更新数据
function updatePositionThrottle() {
  timer && cancelAnimationFrame(timer)
  timer = requestAnimationFrame(updatePosition)
}

// #endregion 下拉选项出现的位置
</script>

<template>
  <div class="dropdown">
    <!-- 触发元素 -->
    <div
      ref="triggerRef" :data-popup-trigger="currentId" class="content-wrapper" @click="() => toggleMenu()"
      @mouseenter="onOpenDropdown" @mouseleave="onHideDropdown"
    >
      <slot name="trigger" />
    </div>
    <Teleport v-if="isOpen" to="body">
      <PopoverContainer
        :data-popup-content="currentId" :container-position="containerPosition" :placement="placement"
        @close="toggleMenu(false)" @mouseenter="onKeepMenuOpenStatus" @mouseleave="onHideDropdown"
      >
        <slot></slot>
      </PopoverContainer>
    </Teleport>
  </div>
</template>

<style lang='scss' scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.content-wrapper {
  width: 100%;
  height: 100%;
}
</style>
