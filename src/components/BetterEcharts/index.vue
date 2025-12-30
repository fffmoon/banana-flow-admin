<!--
 * @Author: Qing
 * @Description: 更好的 echarts 组件
 * @Date: 2024-08-02 15:43:11
 * @LastEditTime: 2025-03-15 02:59:55
-->
<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface IProps {
  option: EChartsOption | null
  loading?: boolean
  merge?: boolean
  theme?: 'light' | 'dark'
  height?: string | number // 可选：添加高度属性
  width?: string | number // 可选：添加宽度属性
}

const props = defineProps<IProps>()
const emits = defineEmits(['init'])

// 定义变量引用图表容器和 echarts 实例
const echartsRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let timerOnsize: ReturnType<typeof setTimeout> | null = null
let resizeObserver: ResizeObserver | null = null

// 初始化图表的方法
function initChart() {
  if (!echartsRef.value)
    return

  // 销毁现有实例
  if (chart) {
    chart.dispose()
  }

  // 使用主题初始化图表
  chart = echarts.init(echartsRef.value as HTMLDivElement, props.theme || undefined)

  // 设置图表配置
  updateEchartsOption()

  // 发射初始化事件
  emits('init', chart)
}

// 更新图表配置的方法
function updateEchartsOption() {
  if (chart && props.option) {
    // 深拷贝原始配置
    const finalOption: EChartsOption = JSON.parse(JSON.stringify(props.option))

    // 如果是暗色主题，设置背景为透明
    if (props.theme === 'dark') {
      finalOption.backgroundColor = 'transparent'
    }

    chart.setOption(finalOption, props.merge || true)
  }
}

// 监听主题变化
watch(
  () => props.theme,
  () => {
    initChart()
  },
)

// 监听配置变化
watch(
  () => props.option,
  () => {
    updateEchartsOption()
  },
  {
    deep: true,
  },
)

// 窗口大小变化时重新调整图表大小
function handleWindowResize() {
  if (chart) {
    if (timerOnsize) {
      clearTimeout(timerOnsize)
    }
    timerOnsize = setTimeout(() => {
      chart?.resize()
    }, 100)
  }
}

// 更可靠的尺寸监听方案
function setupResizeObserver() {
  if (!echartsRef.value)
    return

  // 创建防抖版 resize 处理器
  const debouncedResize = debounce(() => {
    chart?.resize({ animation: { duration: 300 } }) // 添加动画参数
  }, 100)

  // 使用 ResizeObserver 监听容器尺寸变化
  resizeObserver = new ResizeObserver((entries) => {
    if (entries[0].contentRect.width > 0) { // 过滤不可见状态
      debouncedResize()
    }
  })

  resizeObserver.observe(echartsRef.value as HTMLDivElement)
}

// 优化的防抖函数
function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: number
  return function (this: any, ...args: any[]) {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 组件挂载时初始化
onMounted(() => {
  initChart()
  setupResizeObserver()
  window.addEventListener('resize', handleWindowResize)
})

// 组件卸载时清理资源
onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<template>
  <div
    ref="echartsRef" :style="{
      width: typeof width === 'number' ? `${width}px` : width || '100%',
      height: typeof height === 'number' ? `${height}px` : height || '100%',
    }"
  />
</template>
