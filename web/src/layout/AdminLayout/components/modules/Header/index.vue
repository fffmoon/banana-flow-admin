<script lang='ts' setup>
import type { CustomDropdownOption } from '@ui/BetterUI'
import type { IRouteItem } from 'types/vue-router'
import { router } from '@/router'
import { findRouterById } from '@/router/utils'
import CONFIG from '@/settings'
import ToolBar from './ToolBar.vue'

interface IProps {
  showSider: boolean
}

const props = defineProps<IProps>()
const menuStore = useMenuStore()
const route = useRoute()
const asyncRouteStore = useAsyncRouteStore()
const { go } = usePageJump(router)
const { screenInfo, isMobile } = useResponsive()

// #region ➤ 面包屑逻辑
// ================================================

interface IBreadcrumbMenuOption {
  id: string
  label: string
  key: string
  route: string
  icon: any
  isLast: boolean
}

const breadcrumbMenuOptions = computed<IBreadcrumbMenuOption[]>(() => {
  const filteredMatched = route.matched.filter((item, index, array) => {
    const parent = array[index - 1];
    if (parent && parent.meta?.singleMenu) {
      return false;
    }

    return true;
  });

  return filteredMatched.map((item, idx) => {
    return {
      label: item.meta.title as string,
      key: item.path,
      route: item.path,
      icon: useIconRenderer(item.meta?.icon as string || 'i-mdi-view-dashboard'),
      isLast: idx === filteredMatched.length - 1,
      isFirst: idx === 0,
      id: item.meta?.id as string,
    }
  })
})

function getRouteListByRouteId(id: string) {
  const res = findRouterById(asyncRouteStore.routerMenus, id)
  if (!res || !res.raw || !res.raw.children) return []
  return res.raw.children.map(item => recurRouteToMenuOpt(item))
}

function recurRouteToMenuOpt(item: IRouteItem): CustomDropdownOption {
  const obj: CustomDropdownOption = {
    label: item.meta.title as string,
    key: item.path,
    icon: useIconRenderer(item.meta?.icon as string || 'i-mdi-view-dashboard'),
    props: {
      onClick: () => {
        go(item.path, {
          checkUnsaved: true,
          query: item.meta.query,
        })
      },
    },
  }
  if (item.children) {
    obj.children = item.children.map(item => recurRouteToMenuOpt(item))
  }
  return obj
}

// #endregion

// #region ➤ 遮罩逻辑
/* 处理当右边图标宽度覆盖左边菜单的时候，显示透明效果 */
const showGradientMask = ref(false)
watch(() => screenInfo.value.width, () => {
  if (isMobile.value) {
    showGradientMask.value = false
    return
  }
  const sign = document.querySelector('.left-menu')
  const rightIcon = document.querySelector('.right-icon')
  if (!sign || !rightIcon) return
  const signRect = sign.getBoundingClientRect()
  const rightIconRect = rightIcon.getBoundingClientRect()
  showGradientMask.value = rightIconRect.left <= signRect.right
})
// #endregion
</script>

<template>
  <NLayoutHeader
    class="header h-[var(--header-height)] flex items-center justify-between px-[var(--admin-content-padding)]"
    bordered>
    <!-- 左边菜单 (汉堡按钮 + 面包屑) -->
    <div class="left-menu relative h-full min-w-0 flex shrink-1 items-center">
      <!-- 抽屉按钮 -->
      <NButton v-show="props.showSider" quaternary :focusable="false" class="menu-btn"
        @click="menuStore.setMobileDrawer(true)">
        <div class="icon-base icon i-mdi-menu" />
      </NButton>

      <!-- 导航 -->
      <NBreadcrumb v-show="CONFIG.toolbar.breadcrumb" class="breadcrumb text-truncate">
        <NBreadcrumbItem v-for="item in breadcrumbMenuOptions" :key="item.id">
          <template #separator>
            <div class="icon-base--sm i-mdi-slash-forward"></div>
          </template>
          <template v-if="item.isLast">
            {{ item.label }}
          </template>
          <template v-else>
            <NDropdown trigger="click" :options="getRouteListByRouteId(item.id)">
              <div class="trigger">
                {{ item.label }}
              </div>
            </NDropdown>
          </template>
        </NBreadcrumbItem>
      </NBreadcrumb>

      <div class="mask" :class="{ 'mask-active': showGradientMask }"></div>
    </div>

    <!-- 右边工具栏 -->
    <ToolBar />

  </NLayoutHeader>
</template>

<style lang="scss" scoped>
@use '@/styles/components/simple-animation.scss' as *;

.menu-btn {
  --at-apply: "h-36px px-8px active:btn-active hover:btn-hover base-ani";
}

.mask {
  position: absolute;
  right: 0;
  top: 0;
  width: 50px;
  height: 100%;
  background: linear-gradient(to right, transparent 0%, var(--custom-base-color) 100%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;

  &.mask-active {
    opacity: 1;
  }
}

@media screen and (max-width: $breakpoint-sm) {
  .breadcrumb {
    display: none;
  }
}
</style>