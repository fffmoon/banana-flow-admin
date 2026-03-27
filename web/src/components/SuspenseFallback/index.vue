<script setup lang="ts">
import { computed } from 'vue'
// Vite 特性
import loadingHtmlRaw from '/loading.html?raw' 

// 获取环境变量
const appTitle = import.meta.env.VITE_APP_TITLE || ''

// 替换 HTML 字符串中的占位符
const innerHtml = computed(() => {
  return loadingHtmlRaw.replace('%VITE_APP_TITLE%', appTitle)
})
</script>

<template>
  <!-- 使用 v-html 渲染引入的 HTML 字符串 -->
  <div class="suspense-fallback-wrapper" v-html="innerHtml"></div>
</template>

<style></style>