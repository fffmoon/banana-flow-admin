<script lang='ts' setup>
import TopSider from './TopSider.vue'
import Logo from '../Logo/index.vue'
import SideTitle from '../Sider/SideTitle.vue'
import ToolBar from './ToolBar.vue'
</script>

<template>
  <div class="header-container h-60px w-full flex items-center justify-between gap-3 bg-[--custom-base-color] px-4">
    <!-- 左侧区域：Logo + 标题 + 菜单 -->
    <div class="h-full flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
      <!-- Logo -->
      <Logo class="h-full flex-shrink-0" />
      <!-- 标题区域 -->
      <SideTitle class="flex-shrink-0" />
      <!-- 主菜单 -->
      <TopSider class="min-w-0 flex-1" />
    </div>

    <!-- 右侧工具栏 -->
    <ToolBar class="flex-shrink-0" />

  </div>
</template>

<style lang='scss' scoped>
.header-container {
  border-bottom: 1px solid var(--custom-border-color);
}
</style>