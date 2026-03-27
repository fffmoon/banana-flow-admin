<!--
 * @Author: Qing
 * @Description: 在unocss图标基础上额外的封装一层，通常用于h函数
 * @Date: 2025-03-02 13:14:48
 * @LastEditTime: 2025-03-02 14:23:02
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string // 格式：i-集合-名称
  size?: number | string
  color?: string
}>()

const iconClass = computed(() => props.icon)
const iconStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color,
}))
</script>

<template>
  <div :class="iconClass" class="icon-base" :style="iconStyle" />
</template>
