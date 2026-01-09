<!--
 * @Author: Qing
 * @Description: 主菜单栏组件
-->
<script lang='ts' setup>
import { nextTick, ref, watch } from 'vue'
import HorizontalScroller from '@/components/HorizontalScroller/index.vue'
import { useMenuStore } from '@/store/modules/menu'

const menuStore = useMenuStore()
const scrollerRef = ref<InstanceType<typeof HorizontalScroller> | null>(null)

// 监听 Store 中的 mixMainMenus 变化
watch(() => menuStore.mixMainMenus, () => {
  nextTick(() => {
    scrollerRef.value?.update()
  })
}, { deep: true })
</script>

<template>
  <nav class="min-w-0 wh-full flex">
    <HorizontalScroller ref="scrollerRef">
      <ul class="menu-list m-0 h-full flex list-none items-center p-y-2">
        <li
          v-for="menu in menuStore.mixMainMenus" :key="menu.meta?.id"
          class="app-menu-item mr-2 flex shrink-0 cursor-pointer select-none items-center justify-center gap-4px px-[var(--space-md)]"
          :class="{ 'is-active': menuStore.currentMixMainId === menu.meta?.id }"
          @click="menuStore.clickMixMainMenu(menu)"
        >
          <div class="app-menu-item__icon" :class="menu.meta?.icon || 'i-mdi-dots-horizontal'" />
          <span class="app-menu-item__text">
            {{ menu.meta?.title }}
          </span>
        </li>
      </ul>
    </HorizontalScroller>
  </nav>
</template>

<style lang="scss" scoped>
@use '@/styles/components/menu-item';

.app-menu-item {
  height: 100%;
  transition: all 0.3s;

  &:hover {
    background-color: var(--custom-hover-color);
  }
}
</style>
