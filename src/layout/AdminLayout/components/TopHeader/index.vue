<script lang='ts' setup>
import Logo from '../Logo/index.vue'
import SideTitle from '../SideTitle/index.vue'
import TopSider from '../TopSider/index.vue'
</script>

<template>
  <div class="header-container h-60px w-full flex bg-[--custom-base-color] p-x-4">
    <!-- Logo -->
    <Logo class="h-full flex-shrink-0" />
    <!-- 标题区域 -->
    <SideTitle />
    <!-- 主菜单 -->
    <TopSider />
  </div>
</template>

<style lang='scss' scoped>
.header-container {
  border-bottom: 1px solid var(--custom-border-color);
}
</style>
