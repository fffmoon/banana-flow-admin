<script lang='ts' setup>
import { useThemeVars } from 'naive-ui'

const themeVars = computed(() => useThemeVars())
</script>

<template>
  <!-- naive-ui数据 -->
  <div class="wh-full overflow-auto">
    <div>使用示例：</div>
    <pre :style="{ color: themeVars.value.primaryColor }">使用 themeVars.value.primaryColor 的示例文本...</pre>
    <div>数据展示：</div>
    <pre>{{ themeVars }}</pre>
  </div>
</template>
