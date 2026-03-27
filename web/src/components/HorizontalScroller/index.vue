<!-- components/common/HorizontalScroller.vue -->
<script lang="ts" setup>
import { debounce } from 'lodash-es'
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const scrollRef = ref<HTMLElement | null>(null)

// 滚动状态
const scrollState = reactive({
  canScroll: false,
  atStart: true,
  atEnd: false,
})

// #region ➤ 滚动检测逻辑
const checkScrollState = debounce(() => {
  const el = scrollRef.value
  if (!el)
    return

  // 允许1px的误差容错
  const tolerance = 1
  scrollState.canScroll = el.scrollWidth > el.clientWidth
  scrollState.atStart = el.scrollLeft <= tolerance
  scrollState.atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - tolerance
}, 100, { leading: true, trailing: true })

onMounted(() => {
  checkScrollState()
  window.addEventListener('resize', checkScrollState)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScrollState)
})
// #endregion

// #region ➤ 滚轮横向滚动逻辑 (带线性动画)
function handleWheel(event: WheelEvent) {
  // 如果容器不能滚动，则不拦截默认行为（允许页面垂直滚动）
  if (!scrollState.canScroll)
    return

  // 阻止默认垂直滚动
  event.preventDefault()

  const el = scrollRef.value
  if (!el)
    return

  // const baseStep = 40 // 基础滚动步长
  const acceleration = 1.2 // 加速度
  const delta = event.deltaY * acceleration

  // 简单平滑滚动处理
  el.scrollLeft += delta

  // 触发状态检测
  checkScrollState()
}
// #endregion

// 暴露 update 方法给父组件，以便内容变化时手动触发生效
defineExpose({
  update: checkScrollState,
  scrollTo: (options: ScrollToOptions) => scrollRef.value?.scrollTo(options),
})
</script>

<template>
  <div class="horizontal-scroller relative h-full min-w-0 w-full overflow-hidden">
    <!-- 滚动容器 -->
    <div
      ref="scrollRef"
      class="scroll-content hide-scrollbar h-full w-full flex flex-nowrap items-center overflow-x-auto overflow-y-hidden"
      @wheel="handleWheel" @scroll="checkScrollState"
    >
      <slot />
    </div>

    <!-- 左侧遮罩 -->
    <div
      class="scroll-mask mask-left left-0"
      :class="{ 'opacity-100': !scrollState.atStart && scrollState.canScroll, 'opacity-0': scrollState.atStart || !scrollState.canScroll }"
    />

    <!-- 右侧遮罩 -->
    <div
      class="scroll-mask mask-right right-0"
      :class="{ 'opacity-100': !scrollState.atEnd && scrollState.canScroll, 'opacity-0': scrollState.atEnd || !scrollState.canScroll }"
    />
  </div>
</template>

<style lang="scss" scoped>
.hide-scrollbar {
  scrollbar-width: none;

  /* Firefox */
  -ms-overflow-style: none;

  /* IE 10+ */
  &::-webkit-scrollbar {
    display: none;

    /* Chrome/Safari */
  }
}

.scroll-mask {
  /* 使用 UnoCSS/Tailwind 的类名或原生CSS */
  position: absolute;
  top: 0;
  height: 100%;
  width: 60px;

  /* 遮罩宽度 */
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 10;
}

/* 假设你的项目里定义了这些CSS变量，如果没有，请替换为具体的颜色 */
.mask-left {
  /* 从背景色渐变到透明 */
  background: linear-gradient(to right, var(--custom-body-color, #fff), transparent);
}

.mask-right {
  background: linear-gradient(to left, var(--custom-body-color, #fff), transparent);
}
</style>
