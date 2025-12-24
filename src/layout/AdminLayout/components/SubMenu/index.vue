<!--
 * @Author: Qing
 * @Description: 次要菜单、二级菜单
 * @Date: 2025-03-16 21:28:30
 * @LastEditTime: 2025-07-21 15:18:45
-->
<script lang='ts' setup>
import type { NMenu } from 'naive-ui'
import { useMenu } from '@/layout/AdminLayout/js/useMenu'
import CONFIG from '@/settings'
import SideTitle from '../SideTitle/index.vue'

interface IProps {
  // 隐藏菜单按钮
  hiddenMenuButton?: boolean
  // 显示标题
  showTitle?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  hiddenMenuButton: false,
  showTitle: true,
})

const { toggleCollapsed, collapsed, updateActiveMenuFromRoute, currentSubMenuId, updateActiveSubMenuId, processedSubMenus } = useMenu()

const routerMenuRef = ref<InstanceType<typeof NMenu> | null>(null)

watch(() => currentSubMenuId.value, (id) => {
  nextTick(() => routerMenuRef.value && routerMenuRef.value.showOption(id))
})

const SideTitleWidth = computed(() => `${collapsed.value ? CONFIG.menu.collapsedWidth : CONFIG.menu.subMenuWidth}px`)

const isShowSideTitleComputed = computed(() => props.showTitle && !collapsed.value)
</script>

<template>
  <Transition name="slide-fade" mode="out-in" @after-enter="updateActiveMenuFromRoute">
    <div v-show="processedSubMenus.length > 0" class="sub-menu h-full flex flex-col p-y-2">
      <!-- 标题区域 -->
      <SideTitle v-if="isShowSideTitleComputed" class="h-[var(--header-height)]" :width="SideTitleWidth" />
      <!-- 菜单 -->
      <div
        class="relative min-w-0 flex-1 overflow-hidden"
        :style="{ width: `${collapsed ? CONFIG.menu.collapsedWidth : CONFIG.menu.subMenuWidth}px` }"
      >
        <BScrollbar>
          <BMenu
            ref="routerMenuRef" :root-indent="16" :collapsed-width="CONFIG.menu.collapsedWidth"
            :collapsed="collapsed" :collapsed-icon-size="22" :options="processedSubMenus" :value="currentSubMenuId"
            :on-update-value="updateActiveSubMenuId"
          />
        </BScrollbar>
        <!-- 折叠菜单按钮 -->
        <NButton
          v-show="!hiddenMenuButton" tertiary :focusable="false" size="small"
          class="absolute bottom-[12px] right-[12px] z-[100]" @click="toggleCollapsed(!collapsed)"
        >
          <template #icon>
            <div v-show="!collapsed" class="icon-base i-mdi-menu-open" />
            <div v-show="collapsed" class="icon-base i-mdi-menu-close" />
          </template>
        </NButton>
      </div>
    </div>
  </Transition>
</template>

<style lang='scss' scoped>
/* 添加过渡动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-width: 0;
  transform: translateX(-20px);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-width: 180px;

  /* 匹配菜单宽度 */
  transform: translateX(0);
}

.sub-menu {
  border-right: 1px solid var(--custom-border-color);

  :deep(.n-layout-sider__border) {
    --n-border-color: transparent;
  }
}
</style>
