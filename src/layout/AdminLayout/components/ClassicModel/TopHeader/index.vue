<script lang='ts' setup>
import TopSider from '@/layout/AdminLayout/components/ClassicModel/TopSider/index.vue'
import Logo from '@/layout/AdminLayout/components/Logo/index.vue'
import SideTitle from '@/layout/AdminLayout/components/SideTitle/index.vue'
</script>

<template>
  <div class="header-container h-60px w-full flex gap-3 bg-[--custom-base-color] p-x-4">
    <!-- Logo -->
    <Logo class="h-full flex-shrink-0" />
    <!-- 标题区域 -->
    <SideTitle class="flex-shrink-0" />
    <!-- 主菜单 -->
    <TopSider />
  </div>
</template>

<style lang='scss' scoped>
.header-container {
  border-bottom: 1px solid var(--custom-border-color);
}
</style>
