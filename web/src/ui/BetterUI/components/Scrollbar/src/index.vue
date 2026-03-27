<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

type ITriggerType = 'hover' | 'none'
type IDragType = 'vertical' | 'horizontal'

defineOptions({
  displayName: 'Scrollbar',
})

const props = withDefaults(defineProps<{
  xScrollable?: boolean
  trigger?: ITriggerType
  contentStyle?: Record<string, string | number>
  contentClass?: string | Record<string, boolean> | (string | Record<string, boolean>)[]
  size?: number
}>(), {
  xScrollable: false,
  trigger: 'hover',
  contentStyle: () => ({}),
  contentClass: '',
  size: 6,
})

const emit = defineEmits(['scroll'])

// 合并 class 和 style 的计算属性
const contentClasses = computed(() => [
  'scroll-content',
  props.contentClass,
])

const contentStyles = computed(() => ({
  ...props.contentStyle,
}))

const contentRef = ref<HTMLElement | null>(null)
const isHover = ref(false)
const verticalThumb = ref({ offset: 0, size: 0 })
const horizontalThumb = ref({ offset: 0, size: 0 })
const isDragging = ref(false)
const dragStartPos = ref(0)
const dragType = ref<IDragType>('vertical')
// 是否显示滚动条，用于判断是否需要显示滚动条
const hasVerticalScroll = ref(false)
const hasHorizontalScroll = ref(false)

// 是否显示滚动条，用于判断用户设定是否需要显示滚动条
const showTrack = computed(() => {
  return props.trigger === 'none' || isHover.value
})

const triggerClass = computed(() => {
  return props.trigger === 'hover' ? 'trigger-hover' : 'trigger-none'
})

const verticalThumbStyle = computed(() => ({
  height: `${verticalThumb.value.size}px`,
  top: `${verticalThumb.value.offset}px`,
}))

const horizontalThumbStyle = computed(() => ({
  width: `${horizontalThumb.value.size}px`,
  left: `${horizontalThumb.value.offset}px`,
}))

function getScrollRatio() {
  if (!contentRef.value)
    return { vertical: 0, horizontal: 0 }

  return {
    vertical: contentRef.value.scrollTop / (contentRef.value.scrollHeight - contentRef.value.clientHeight),
    horizontal: contentRef.value.scrollLeft / (contentRef.value.scrollWidth - contentRef.value.clientWidth),
  }
}

function updateThumb() {
  if (!contentRef.value)
    return

  if (!props.xScrollable) {
    const { clientHeight, scrollHeight } = contentRef.value
    // 判断是否超出容器高度
    hasVerticalScroll.value = scrollHeight > clientHeight

    if (hasVerticalScroll.value) {
      const thumbHeight = (clientHeight / scrollHeight) * clientHeight
      verticalThumb.value.size = Math.max(thumbHeight, 20)
      verticalThumb.value.offset = (clientHeight - thumbHeight) * getScrollRatio().vertical
    }
    else {
      verticalThumb.value.size = 0 // 设置为0以隐藏
    }
  }
  else {
    const { clientWidth, scrollWidth } = contentRef.value
    // 判断是否超出容器宽度
    hasHorizontalScroll.value = scrollWidth > clientWidth

    if (hasHorizontalScroll.value) {
      const thumbWidth = (clientWidth / scrollWidth) * clientWidth
      horizontalThumb.value.size = Math.max(thumbWidth, 20)
      horizontalThumb.value.offset = (clientWidth - thumbWidth) * getScrollRatio().horizontal
    }
    else {
      horizontalThumb.value.size = 0 // 设置为0以隐藏
    }
  }
}

// 添加防抖处理的updateThumb
let updatePending = false
function requestUpdate() {
  if (!updatePending) {
    updatePending = true
    nextTick(() => {
      updateThumb()
      updatePending = false
    })
  }
}

// 滚动条滚动事件
function handleScroll(e: Event) {
  requestUpdate()
  emit('scroll', e)
}

// 鼠标移入移出
function handleMouseEnter() {
  isHover.value = true
}

function handleMouseLeave() {
  if (!isDragging.value)
    isHover.value = false
}

const initialOffset = ref(0)

// 手动拖动滚动条
function startDrag(type: 'vertical' | 'horizontal', e: MouseEvent) {
  isDragging.value = true
  dragType.value = type
  dragStartPos.value = type === 'vertical' ? e.clientY : e.clientX
  // 记录初始偏移量
  initialOffset.value = type === 'vertical'
    ? verticalThumb.value.offset
    : horizontalThumb.value.offset
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || !contentRef.value)
    return

  const currentPos = dragType.value === 'vertical'
    ? e.clientY
    : e.clientX

  // 使用总偏移量
  const delta = currentPos - dragStartPos.value

  if (dragType.value === 'vertical') {
    const trackHeight = contentRef.value.clientHeight - verticalThumb.value.size
    const scrollHeight = contentRef.value.scrollHeight - contentRef.value.clientHeight
    // 计算新的偏移量并限制范围
    const newOffset = Math.max(0, Math.min(initialOffset.value + delta, trackHeight))
    contentRef.value.scrollTop = (newOffset / trackHeight) * scrollHeight
  }
  else {
    const trackWidth = contentRef.value.clientWidth - horizontalThumb.value.size
    const scrollWidth = contentRef.value.scrollWidth - contentRef.value.clientWidth
    const newOffset = Math.max(0, Math.min(initialOffset.value + delta, trackWidth))
    contentRef.value.scrollLeft = (newOffset / trackWidth) * scrollWidth
  }
}

function endDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
}

// #region ➤ 鼠标滚轮事件
// ================================================

onMounted(() => {
  nextTick(() => {
    requestUpdate()
    if (contentRef.value) {
      contentRef.value.addEventListener('wheel', handleWheel, { passive: false })
    }
  })
})

onBeforeUnmount(() => {
  if (contentRef.value) {
    contentRef.value.removeEventListener('wheel', handleWheel)
  }
})

function handleWheel(e: WheelEvent) {
  if (props.xScrollable) {
    if (e.deltaY !== 0) {
      e.preventDefault()
      if (contentRef.value) {
        contentRef.value.scrollLeft += e.deltaY
      }
    }
  }
}

// #endregion 鼠标滚轮事件

// #region ➤ 监听滚动条内部变动刷新滚动条
// ================================================

// 添加resize事件
onMounted(() => {
  window.addEventListener('resize', requestUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', requestUpdate)
})

// 添加MutationObserver事件
const mutationObserver = ref<MutationObserver>()
onMounted(() => {
  mutationObserver.value = new MutationObserver(() => {
    requestUpdate()
  })

  if (contentRef.value) {
    mutationObserver.value.observe(contentRef.value as Node, {
      childList: true,
      subtree: true,
      attributes: true,
    })
  }
})

onBeforeUnmount(() => {
  if (mutationObserver.value) {
    mutationObserver.value.disconnect()
  }
})
</script>

<template>
  <div
    class="scroll-container" :class="[triggerClass, { 'x-scrollable': xScrollable }]" @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div ref="contentRef" :class="contentClasses" :style="contentStyles" @scroll="handleScroll">
      <slot />
    </div>

    <!-- 垂直滚动条 -->
    <div
      v-if="!xScrollable" :style="{ opacity: showTrack && hasVerticalScroll ? 1 : 0, width: `${size}px` }"
      class="scrollbar-vertical" @mousedown.prevent="startDrag('vertical', $event)"
    >
      <div class="scrollbar-thumb" :style="verticalThumbStyle" />
    </div>

    <!-- 水平滚动条 -->
    <div
      v-if="xScrollable" :style="{ opacity: showTrack && hasHorizontalScroll ? 1 : 0, height: `${size}px` }"
      class="scrollbar-horizontal" @mousedown.prevent="startDrag('horizontal', $event)"
    >
      <div class="scrollbar-thumb" :style="horizontalThumbStyle" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroll-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;

  &.trigger-hover {

    .scrollbar-vertical,
    .scrollbar-horizontal {
      opacity: 0;
      transition: opacity 0.4s ease-in-out;
    }
  }
}

.scroll-content {
  width: 100%;
  height: 100%;
  overflow: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.scrollbar-vertical {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  // width: $size-vertical;
  background-color: var(--custom-scrollbar-color-thumb);
  border-radius: 4px;
  cursor: pointer;
}

.scrollbar-horizontal {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  // height: $size-horizontal;
  background-color: var(--custom-scrollbar-color-thumb);
  border-radius: 4px;
  cursor: pointer;
}

.scrollbar-thumb {
  position: absolute;
  background-color: var(--custom-scrollbar-color);
  border-radius: 4px;
  transition: background-color 0.2s ease;

  .scrollbar-vertical & {
    width: 100%;
    left: 0;
  }

  .scrollbar-horizontal & {
    height: 100%;
    top: 0;
  }

  &:hover {
    background-color: var(--custom-scrollbar-color-hover);
  }

  &:active {
    background-color: var(--custom-scrollbar-color-pressed);
  }
}

.x-scrollable {
  .scroll-content {
    overflow-x: auto;
    overflow-y: hidden;
  }
}
</style>
