<!--
 * @Author: Qing
 * @Description: 主菜单栏组件 (Refactored)
-->
<script lang='ts' setup>
import { nextTick, ref, watch } from 'vue'
// 引入刚刚封装的组件
import HorizontalScroller from '@/components/HorizontalScroller/index.vue' // 请根据实际路径调整
import { useMenu } from '../../js/useMenu'

const { currentMainMenuId, mainMenus, handleMainMenuClick } = useMenu()
const scrollerRef = ref<InstanceType<typeof HorizontalScroller> | null>(null)

// 监听菜单变化，更新滚动状态（例如异步加载菜单后）
watch(() => mainMenus.value, () => {
  nextTick(() => {
    scrollerRef.value?.update()
  })
}, { deep: true })
</script>

<template>
  <nav class="min-w-0 wh-full flex">
    <!-- 使用封装的滚动容器 -->
    <HorizontalScroller ref="scrollerRef">
      <ul class="menu-list m-0 h-full flex list-none items-center p-y-2">
        <li
          v-for="menu in mainMenus"
          :key="menu.meta?.id"
          class="app-menu-item mr-2 flex shrink-0 cursor-pointer select-none items-center justify-center gap-4px px-[var(--space-md)]"
          :class="{ 'is-active': currentMainMenuId === menu.meta?.id }"
          @click="handleMainMenuClick(menu)"
        >
          <div
            class="app-menu-item__icon"
            :class="menu.meta?.icon || 'i-mdi-dots-horizontal'"
          />
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

// 如果 menu-item 样式里没有定义高度，可能需要显式指定
.app-menu-item {
  height: 100%; // 确保占满高度
  // 其他微调样式
  transition: all 0.3s;

  &:hover {
    background-color: var(--custom-hover-color);
  }
}
</style>
