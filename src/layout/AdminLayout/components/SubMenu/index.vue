<script lang='ts' setup>
import { computed, nextTick, ref, watch } from 'vue'
import CONFIG from '@/settings'
import { useMenuStore } from '@/store/modules/menu'
import { useNaiveMenu } from '../../js/useNaiveMenu'
import SideTitle from '../SideTitle/index.vue'

interface IProps {
  hiddenMenuButton?: boolean
  showTitle?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  hiddenMenuButton: false,
  showTitle: true,
})

const menuStore = useMenuStore()
const { naiveSubMenus } = useNaiveMenu()
// 菜单实例
const routerMenuRef = ref<InstanceType<typeof BMenu> | null>(null)

// 监听当前选中的菜单ID，滚动到对应位置
watch(() => menuStore.currentSubMenuId, (id) => {
  nextTick(() => routerMenuRef.value && routerMenuRef.value.showOption(id))
})

// 计算宽度
const SideTitleWidth = computed(() => `${menuStore.collapsed ? CONFIG.menu.collapsedWidth : CONFIG.menu.subMenuWidth}px`)

const isShowSideTitleComputed = computed(() => props.showTitle && !menuStore.collapsed)
</script>

<template>
  <Transition name="slide-fade" mode="out-in">
    <!-- 使用 naiveSubMenus.length 判断是否有子菜单 -->
    <div v-show="naiveSubMenus.length > 0" class="sub-menu h-full flex flex-col p-y-2">
      <!-- 标题区域 -->
      <SideTitle v-if="isShowSideTitleComputed" class="h-[var(--header-height)]" :width="SideTitleWidth" />

      <!-- 菜单容器 -->
      <div
        class="relative min-w-0 flex-1 overflow-hidden"
        :style="{ width: `${menuStore.collapsed ? CONFIG.menu.collapsedWidth : CONFIG.menu.subMenuWidth}px` }"
      >
        <BScrollbar>
          <BMenu
            ref="routerMenuRef" :root-indent="16" :collapsed-width="CONFIG.menu.collapsedWidth"
            :collapsed="menuStore.collapsed" :collapsed-icon-size="22" :options="naiveSubMenus"
            :value="menuStore.currentSubMenuId" :on-update-value="menuStore.clickSubMenu"
            @on-update-value="menuStore.clickSubMenu"
          />
        </BScrollbar>

        <!-- 折叠菜单按钮 -->
        <NButton
          v-show="!hiddenMenuButton" tertiary :focusable="false" size="small"
          class="absolute bottom-[12px] right-[12px] z-[100]" @click="menuStore.toggleCollapsed()"
        >
          <template #icon>
            <div v-show="!menuStore.collapsed" class="icon-base i-mdi-menu-open" />
            <div v-show="menuStore.collapsed" class="icon-base i-mdi-menu-close" />
          </template>
        </NButton>
      </div>
    </div>
  </Transition>
</template>

<style lang='scss' scoped>
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
  transform: translateX(0);
}

.sub-menu {
  border-right: 1px solid var(--custom-border-color);

  :deep(.n-layout-sider__border) {
    --n-border-color: transparent;
  }
}
</style>
