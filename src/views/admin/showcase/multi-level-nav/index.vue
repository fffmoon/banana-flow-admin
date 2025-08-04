<script lang='ts' setup>
// 获取路由的名字
const route = useRoute()
</script>

<template>
  <div class="base-container">
    <NCard :title="`多级导航-${String(route.meta.title)}`"></NCard>
  </div>
</template>
