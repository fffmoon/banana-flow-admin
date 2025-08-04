<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-16 21:28:30
 * @LastEditTime: 2025-07-21 15:18:45
-->
<script lang='ts' setup>
import type { NMenu } from 'naive-ui'
import type { IRouteItem } from 'types/vue-router'
import type { VNodeChild } from 'vue'
import { router } from '@/router'
import { flattenRoutes } from '@/router/utils'
import CONFIG from '@/settings'
import { NEllipsis } from 'naive-ui'

interface IProps {
  // 是否显示折叠
  collapsed?: boolean
  // 隐藏菜单按钮
  hiddenMenuButton?: boolean
  // 主菜单
  menus: IRouteItem[]
}

const props = withDefaults(defineProps<IProps>(), {
  hiddenMenuButton: false,
  collapsed: false,
})
const emits = defineEmits(['toggleCollapsed', 'updateActiveMenuKey', 'updateSubMenuStatus'])
const route = useRoute()
const { goToShouldConfirm } = usePageJump(router)

const { t } = useLocale()

// #region ➤ 次要菜单、二级菜单
// ================================================
// @author: Qing
// @description:
// @date 2025-02-28 20:02:42
// @ver:
// ================================================

interface ICustomMenuOption {
  label: string | (() => VNodeChild)
  key: string
  route: string
  icon: () => Component
  children?: ICustomMenuOption[]
  activeMenu?: string
}

// 生成菜单选项
function generateMenuFromRoutes(menus: IRouteItem[]): ICustomMenuOption[] {
  const list: ICustomMenuOption[] = []
  menus.forEach((menu) => {
    if (menu.meta.hideInMenu)
      return

    // 处理子菜单
    let children: ICustomMenuOption[] | undefined

    // 如果不是单列菜单且有子路由，则处理子菜单
    if (menu.children && menu.children.length > 0) {
      // 过滤并生成子菜单
      const childMenus = generateMenuFromRoutes(menu.children)
      // 只有当有可见子菜单时才设置children
      if (childMenus.length > 0) {
        children = childMenus
      }
    }

    // 菜单标签
    let menuLabel

    // 处理外部链接
    // console.log('76', menu.meta?.link)
    if (menu.meta?.link) {
      menuLabel = () => h(
        'a',
        {
          href: menu.meta?.link || menu.path,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        { default: () => menu.meta?.title },
      )
    }
    // 处理分组菜单
    else if (!menu.path || menu.path === '#' || menu.path === '') {
      menuLabel = () => h('span', {}, { default: () => menu.meta?.title })
    }
    // 普通菜单项
    else {
      menuLabel = () => h(
        NEllipsis,
        {
          class: 'cursor-pointer',
        },
        { default: () => menu.meta?.title },
      )
    }

    // 构建菜单选项
    const option: ICustomMenuOption = {
      label: menuLabel,
      key: menu.meta?.id as string,
      route: menu.path,
      icon: useIconRenderer(menu.meta?.icon as string || 'i-mdi-dots-horizontal'),
      children,
    }

    // 添加额外属性
    if (menu.meta?.activeMenu) {
      option.activeMenu = menu.meta.activeMenu
    }
    list.push(option)
  })
  return list
}

const subMenuList = computed(() => {
  const list = generateMenuFromRoutes(props.menus)
  // console.info('生成子菜单', list)
  return list
})

// 用于高亮当前菜单
const activeSubMenuKey = ref('')
const routerMenuRef = ref<InstanceType<typeof NMenu> | null>(null)

// 更新菜单
function syncActiveMenu() {
  if (!route || !route.meta || !routerMenuRef.value)
    return

  const id = route.meta.id as string
  // 如果是重定向路由，直接返回
  if (id === 'redirect-dynamic-route')
    return

  // 检查当前路由是否有指定的激活菜单
  const activeMenu = route.meta.activeMenu as string
  if (activeMenu) {
    // 查找对应的菜单项
    const menuItem = findMenuItemByPath(subMenuList.value, activeMenu)
    if (menuItem) {
      activeSubMenuKey.value = menuItem.key
      nextTick(() => routerMenuRef.value.showOption(menuItem.key))
      return
    }
  }

  // 默认使用当前路由ID
  activeSubMenuKey.value = id
  nextTick(() => routerMenuRef.value.showOption(id))
}

/**
 * 根据path路径查找到菜单项，并且返回菜单项
 */
function findMenuItemByPath(menuItems: ICustomMenuOption[], path: string): ICustomMenuOption | null {
  for (const item of menuItems) {
    if (item.route === path) {
      return item
    }
    if (item.children) {
      const found = findMenuItemByPath(item.children, path)
      if (found)
        return found
    }
  }
  return null
}

watchEffect(() => {
  syncActiveMenu()
})

// 更新激活菜单
function updateActiveSubMenuKey(k: string) {
  // console.info('更新激活菜单', k)
  const fla = flattenRoutes(props.menus)
  const findRes = fla.find(item => item.raw.meta?.id === k)
  if (!findRes) {
    console.error('未找到路由', k)
    return
  }

  // 处理外部链接
  if (findRes.raw.meta?.link) {
    return
  }
  // 处理普通路由跳转
  goToShouldConfirm(findRes.raw.path, {
    successCallback: () => {
      activeSubMenuKey.value = k
      emits('updateActiveMenuKey', { key: k })
    },
  })
}

// #endregion 次要菜单
</script>

<template>
  <Transition name="slide-fade" mode="out-in" @after-enter="syncActiveMenu">
    <div v-show="subMenuList.length > 0" class="sub-menu h-full flex flex-col">
      <!-- 标题区域 -->
      <div
        class="h-[var(--header-height)] flex-center transform cursor-pointer px-3 line-height-[var(--header-height)] duration-248 ease-in-out"
        :class="{ 'h-0px': props.collapsed }"
        :style="{ width: `${props.collapsed ? CONFIG.menu.collapsedWidth : CONFIG.menu.subMenuWidth}px` }"
      >
        <h2
          class="wh-full select-none text-truncate text-center text-[var(--font-size-huge)] text-[var(--n-text-color)] font-600"
          :title="t('app.title')" @click="goToShouldConfirm('/')"
        >
          <!-- DOTO 名字太长导致溢出效果，考虑使用滚动文字 -->
          {{ t('app.title') }}
        </h2>
      </div>
      <!-- 菜单 -->
      <div
        class="relative min-w-0 flex-1 overflow-hidden"
        :style="{ width: `${props.collapsed ? CONFIG.menu.collapsedWidth : CONFIG.menu.subMenuWidth}px` }"
      >
        <BScrollbar>
          <BMenu
            ref="routerMenuRef" :root-indent="12" :collapsed-width="CONFIG.menu.collapsedWidth"
            :collapsed="props.collapsed" :collapsed-icon-size="22" :options="subMenuList" :value="activeSubMenuKey"
            :on-update-value="updateActiveSubMenuKey"
          />
        </BScrollbar>
        <!-- 折叠菜单按钮 -->
        <NButton
          v-show="!hiddenMenuButton" tertiary :focusable="false" size="small"
          class="absolute bottom-[12px] right-[12px] z-[100]" @click="emits('toggleCollapsed', !props.collapsed)"
        >
          <template #icon>
            <div v-show="!props.collapsed" class="icon-base i-mdi-menu-open" />
            <div v-show="props.collapsed" class="icon-base i-mdi-menu-close" />
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
