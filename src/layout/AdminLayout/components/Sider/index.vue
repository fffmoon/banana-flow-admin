<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-31 18:49:58
 * @LastEditTime: 2025-08-01 17:03:24
-->
<script lang='ts' setup>
import CONFIG from '@/settings'
import { useMenu } from '../../js/useMenu'
import Logo from '../Logo/index.vue'

interface IProps {
  showLogo?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  showLogo: true,
})

const { currentMainMenuId, mainMenus, handleMainMenuClick } = useMenu()
</script>

<template>
  <!-- 左边菜单 -->
  <div
    class="h-full flex flex-col b-r-1px b-r-[var(--custom-border-color)] b-r-solid"
    :style="{ width: `${CONFIG.menu.mainMenuWidth}px` }"
  >
    <!-- logo -->
    <Logo v-if="props.showLogo" class="h-[var(--header-height)] w-full" />
    <!-- 菜单 -->
    <BScrollbar class="flex-1" content-class=" h-full flex flex-1 flex-col gap-y-[var(--space-sm)] overflow-auto p-2">
      <div
        v-for="menu in mainMenus" :key="menu.meta?.id"
        class="app-menu-item flex flex-center flex-col gap-4px py-[var(--space-md)]"
        :class="{ 'is-active': currentMainMenuId === menu.meta?.id }" @click="handleMainMenuClick(menu)"
      >
        <div class="app-menu-item__icon" :class="menu.meta?.icon || 'i-mdi-dots-horizontal'" />

        <div class="app-menu-item__text">
          {{ menu.meta?.title }}
        </div>
      </div>
    </BScrollbar>
  </div>
</template>

<style lang='scss' scoped>
@use '@/styles/components/menu-item';

.header-container {
  border-bottom: 1px solid var(--custom-border-color);
}
</style>
