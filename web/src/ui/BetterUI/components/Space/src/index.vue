<!--
 * @Author: Qing
 * @Description: 一个用来快速书写间距的组件，快速开发的关键
 * @Date: 2025-04-02 09:50:22
 * @LastEditTime: 2025-04-15 14:43:48
-->
<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import { computed } from 'vue'

type SizeType = 'small' | 'medium' | 'large' | number | [number, number]
type AlignType = 'start' | 'end' | 'center' | 'baseline' | 'stretch'
type JustifyType = 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'

interface IProps {
  size?: SizeType
  vertical?: boolean
  align?: AlignType
  wrap?: boolean
  justify?: JustifyType
  reverse?: boolean
}

defineOptions({
  displayName: 'Space',
})

const props = withDefaults(defineProps<IProps>(), {
  size: 'medium',
  vertical: false,
  align: 'stretch',
  wrap: false,
  justify: 'start',
  reverse: false,
})

// 计算方向值，支持反转
const flexDirection = computed<CSSProperties['flexDirection']>(() => {
  const baseDirection = props.vertical ? 'column' : 'row'
  return props.reverse ? `${baseDirection}-reverse` as CSSProperties['flexDirection'] : baseDirection
})

const alignMap: Record<AlignType, CSSProperties['alignItems']> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline',
  stretch: 'stretch',
}

const justifyMap: Record<JustifyType, CSSProperties['justifyContent']> = {
  'start': 'flex-start',
  'end': 'flex-end',
  'center': 'center',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
}

// 间距计算
const gapValues = computed(() => {
  if (Array.isArray(props.size)) {
    return {
      main: props.size[0],
      cross: props.size[1],
    }
  }

  if (typeof props.size === 'number') {
    return { main: props.size, cross: props.size }
  }

  switch (props.size) {
    case 'small': return { main: 8, cross: 4 }
    case 'medium': return { main: 12, cross: 8 }
    case 'large': return { main: 16, cross: 12 }
    default: return { main: 12, cross: 8 }
  }
})

// 容器样式计算
const containerStyle = computed<CSSProperties>(() => {
  const wrapValue = props.vertical ? 'nowrap' : (props.wrap ? 'wrap' : 'nowrap')

  return {
    display: 'flex',
    flexDirection: flexDirection.value,
    flexWrap: wrapValue,
    alignItems: alignMap[props.align],
    justifyContent: justifyMap[props.justify],
    gap: `${gapValues.value.cross}px ${gapValues.value.main}px`,
  }
})
</script>

<template>
  <div :style="containerStyle">
    <slot />
  </div>
</template>
