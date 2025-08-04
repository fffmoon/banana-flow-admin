<script lang='ts' setup>
import { useThemeStore } from '@/theme'

const themeStore = useThemeStore()
// 逻辑，处理
</script>

<template>
  <div class="wh-full overflow-auto">
    <!-- JS桥数据 -->
    <div>使用示例：</div>
    <pre class="color-[var(--custom-primary-color)]">使用 --custom-primary-color 的示例文本...</pre>
    <div>数据展示：</div>
    <pre>{{ themeStore.getCustomOptions }}</pre>
  </div>
</template>
