<script lang='ts' setup>
import { computed, nextTick, ref, watch } from 'vue'
import Logo from '@/layout/AdminLayout/components/Logo/index.vue'
import SideTitle from '@/layout/AdminLayout/components/SideTitle/index.vue'
import { useNaiveMenu } from '@/layout/AdminLayout/js/useNaiveMenu'
import CONFIG from '@/settings'
import { useMenuStore } from '@/store/modules/menu'

interface IProps {
  showCollapsedButton?: boolean
  showTitle?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  showCollapsedButton: true,
  showTitle: true,
})

const menuStore = useMenuStore()
const { naiveAllMenus } = useNaiveMenu()
const routerMenuRef = ref<InstanceType<typeof BMenu> | null>(null)

// 监听高亮 Key
watch(() => menuStore.activeMenuKey, (key) => {
  nextTick(() => routerMenuRef.value && routerMenuRef.value.showOption(key))
})

const isShowSideTitleComputed = computed(() => props.showTitle && !menuStore.collapsed)
</script>

<template>
  <Transition name="slide-fade" mode="out-in">
    <div v-if="true" class="sub-menu h-full flex flex-col p-y-2" :style="{ width: menuStore.currentWidth }">
      <div class="h-[var(--header-height)] w-full flex px-3">
        <Logo class="flex-shrink-0" />
        <SideTitle v-if="isShowSideTitleComputed" class="m-l-3 h-[var(--header-height)] min-w-0 flex-1" />
      </div>

      <div class="relative min-w-0 w-100% flex-1 overflow-hidden">
        <BScrollbar>
          <NMenu
            ref="routerMenuRef" :root-indent="16" :collapsed-width="CONFIG.menu.collapsedWidth"
            :collapsed="menuStore.collapsed" :collapsed-icon-size="22" :options="naiveAllMenus"
            :value="menuStore.activeMenuKey" :on-update:value="menuStore.clickMenu"
          />
        </BScrollbar>

        <!-- 折叠菜单按钮 -->
        <NButton
          v-show="showCollapsedButton" tertiary :focusable="false" size="small"
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
  // overflow: hidden;

  :deep(.n-layout-sider__border) {
    --n-border-color: transparent;
  }
}
</style>
