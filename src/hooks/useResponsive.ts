/*
 * @Author: Qing
 * @Description: 响应式的屏幕尺寸
 * @Date: 2025-03-08 15:39:39
 * @LastEditTime: 2025-03-11 09:41:39
 */
import { debounce } from 'lodash-es'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 类型定义
export type BreakpointKey = keyof typeof BREAKPOINTS

export interface ScreenInfo {
  width: number
  height: number
  device: BreakpointKey
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

// Qing：集中定义所有响应式相关配置，Bootstrap v5 风格的断点策略，在基础上进行优化，添加了-0.02避免误差
// DOTO：该选项被定义多个地方，能否抽离出来？
export const BREAKPOINTS = {
  // 0
  // 超小屏幕
  xs: 575.98,
  // 小屏幕，移动设备，可以区分手机和电脑
  sm: 767.98,
  // 中等屏幕，平板，可以区分平板和电脑
  md: 991.98,
  // 较大屏幕，笔记本
  lg: 1199.98,
  // 大屏幕，电脑
  xl: 1399.98,
  // 超大屏幕，大屏设备
  xxl: 1599.98,
  // ∞
} as const

export default function useScreen() {
  const screenInfo = ref<ScreenInfo>({
    width: 0,
    height: 0,
    device: 'xxl',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })

  // 正确排序：从小到大
  const sortedBreakpoints = Object.keys(BREAKPOINTS)
    .sort((a, b) => BREAKPOINTS[a as BreakpointKey] - BREAKPOINTS[b as BreakpointKey])
    .map(key => key as BreakpointKey)

  // 防抖优化（取消 trailing 确保实时性）
  const updateScreenInfo = debounce(() => {
    const width = window.innerWidth
    const height = window.innerHeight

    // 设备检测逻辑修正
    let device: BreakpointKey = 'xxl'
    for (const key of sortedBreakpoints) {
      if (width <= BREAKPOINTS[key]) {
        device = key
        break // 找到第一个匹配的断点即停止
      }
    }

    screenInfo.value = {
      width,
      height,
      device,
      isMobile: device === 'xs' || device === 'sm',
      isTablet: device === 'md',
      isDesktop: device === 'lg' || device === 'xl' || device === 'xxl',
    }
  }, 100, { leading: true, trailing: true })

  // 响应式计算属性
  const device = computed(() => screenInfo.value.device)
  const isMobile = computed(() => screenInfo.value.isMobile)
  const isTablet = computed(() => screenInfo.value.isTablet)
  const isDesktop = computed(() => screenInfo.value.isDesktop)

  // 生命周期
  onMounted(() => {
    updateScreenInfo()
    window.addEventListener('resize', updateScreenInfo)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenInfo)
    updateScreenInfo.cancel()
  })

  return {
    screenInfo,
    device,
    isMobile,
    isTablet,
    isDesktop,
    // 动态计算设备状态
    isXs: computed(() => device.value === 'xs'),
    isSm: computed(() => device.value === 'sm'),
    isMd: computed(() => device.value === 'md'),
    isLg: computed(() => device.value === 'lg'),
    isXl: computed(() => device.value === 'xl'),
    isXxl: computed(() => device.value === 'xxl'),
  }
}
