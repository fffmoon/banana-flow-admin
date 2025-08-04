<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-08 15:39:39
 * @LastEditTime: 2025-07-16 13:12:30
-->
<script lang='ts' setup>
import type { CustomDropdownOption } from '@ui/BetterUI'
import type { IRouteItem } from 'types/vue-router'
import { router } from '@/router'
import { findRouterById } from '@/router/utils'
import CONFIG from '@/settings'
import { themeDoms, useThemeStore } from '@/theme'
import { useLocale } from '@i18n/useLocale'
import MessageList from './MessageList/index.vue'
import SearchModal from './SearchModal/index.vue'
import UserInfo from './UserInfo/index.vue'

interface IProps {
  // 是否显示抽屉按钮
  showSider: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits(['toggleDrawer'])

const { t, changeLocale, changeableLocales } = useLocale()
const route = useRoute()
const themeStore = useThemeStore()
const userStore = useUserStore()
const asyncRouteStore = useAsyncRouteStore()
const { goToShouldConfirm, refresh } = usePageJump(router)
const { screenInfo, isMobile } = useResponsive()
const { addAnimateClass, toggleThemeAnimation } = useAnimation()

// #region ➤ 操作栏
// ================================================
// #
// Qing 2025-03-31 13:44:08
// ================================================

/* 更换主题逻辑 */
const themeIconRef = ref<HTMLElement>()
async function toggleTheme(event: MouseEvent) {
  const { clientX, clientY } = event
  // addAnimateClass(themeIconRef.value as HTMLElement, { className: 'rotate-icon' })
  toggleThemeAnimation({ clientX, clientY })
}

/* 偏好设置 */
const themeSettingKey = inject(ThemeSettingKey)
function openSettingClick() {
  if (!themeSettingKey)
    return
  themeSettingKey.openThemeSetting()
}

/* 刷新页面 */
const refreshIconRef = ref<HTMLElement>()
function refreshPageClick() {
  addAnimateClass(refreshIconRef.value as HTMLElement, { className: 'rotate-icon' })
  refresh()
}

/* 全屏切换 */
const isFullScreen = ref(false)
function toggleFullScreen() {
  console.log('toggleFullScreen')
  isFullScreen.value = !isFullScreen.value
  if (isFullScreen.value) {
    document.documentElement.requestFullscreen()
  }
  else {
    document.exitFullscreen()
  }
}

/* 消息 */
const messageIconRef = ref<HTMLElement>()
function openMessageClick() {
  console.log('openMessageClick')
}

function openMessageHover() {
  addAnimateClass(messageIconRef.value as HTMLElement, { className: 'shake-icon-2x', duration: 0.34 })
}

const messageOptions = [
  {
    key: 'header',
    type: 'render',
    render: () => h(MessageList),
  },
]

/* 用户下拉菜单 */
const userOptions = computed(() => {
  return [
    {
      key: 'header',
      type: 'render',
      render: () => h(UserInfo),
    },
    {
      label: t('user.menu.profile'),
      key: 'editProfile',
      icon: useIconRenderer('i-mdi-cog'),
    },
    {
      label: t('user.menu.preferences'),
      key: 'openSettingClick',
      icon: useIconRenderer('i-mdi-account-edit'),
    },
    {
      label: t('user.menu.logout'),
      key: 'logout',
      icon: useIconRenderer('i-mdi-logout'),
    },
  ]
})

function handleSelect(key: string) {
  switch (key) {
    case 'profile':
      window.$message.info('开发中...')
      break
    case 'editProfile':
      window.$message.info('开发中...')
      break
    case 'openSettingClick':
      openSettingClick()
      break
    case 'logout':
      window.$dialog.info({
        title: '退出登录',
        content: '您确定要退出登录吗？',
        positiveText: '确定',
        negativeText: '取消',
        draggable: true,
        onPositiveClick: () => {
          userStore.logout()
        },
      })
      break
  }
}

function getThemeIcon() {
  if (themeStore.userThemeMode) {
    const findRes = themeDoms.find(item => item.value === themeStore.themeMode)
    return findRes?.icon
  }
  return ''
}

// #endregion 操作栏

// #region ➤ 面包屑逻辑
// ================================================
// #
// Qing 2025-03-31 13:44:08
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
  return route.matched.map((item, idx) => {
    return {
      label: item.meta.title as string,
      key: item.path,
      route: item.path,
      icon: useIconRenderer(item.meta?.icon as string || 'i-mdi-dots-horizontal'),
      isLast: idx === route.matched.length - 1,
      isFirst: idx === 0,
      id: item.meta?.id as string,
    }
  })
})

// 通过路由id（key）获取当前路由下的所有路由信息
function getRouteListByRouteId(id: string) {
  const res = findRouterById(asyncRouteStore.routerMenus, id)
  // console.log('通过路由id（key）获取当前路由下的所有路由信息', res)
  if (!res || !res.raw || !res.raw.children)
    return []
  return res.raw.children.map(item => recurRouteToMenuOpt(item))
}

// 递归生成路由菜单
function recurRouteToMenuOpt(item: IRouteItem): CustomDropdownOption {
  const obj: CustomDropdownOption = {
    label: item.meta.title as string,
    key: item.path,
    icon: useIconRenderer(item.meta?.icon as string || 'i-mdi-dots-horizontal'),
    props: {
      onClick: () => {
        goToShouldConfirm(item.path)
      },
    },
  }
  if (item.children) {
    obj.children = item.children.map(item => recurRouteToMenuOpt(item))
  }
  return obj
}

const screen = useResponsive()
const searchModalRef = ref<InstanceType<typeof SearchModal> | null>(null)

// #endregion 面包屑逻辑

// #region ➤ 搜索
// ================================================
// #
// Qing 2025-03-31 13:44:08
// ================================================

// 打开搜索弹窗
function openSearch() {
  searchModalRef.value?.toggleSearchModal()
}

// 添加快捷键监听
function handler(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openSearch()
  }
}
onMounted(() => {
  document.addEventListener('keydown', handler)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handler)
})

/* 处理当右边图标宽度覆盖左边菜单的时候，显示透明效果 */
const showGradientMask = ref(false)
watch(() => screenInfo.value.width, () => {
  if (isMobile.value) {
    showGradientMask.value = false
    return
  }
  const sign = document.querySelector('.left-menu')
  const rightIcon = document.querySelector('.right-icon')
  if (!sign || !rightIcon)
    return
  const signRect = sign.getBoundingClientRect()
  const rightIconRect = rightIcon.getBoundingClientRect()
  // 判断right - icon是否开始覆盖left - menu
  showGradientMask.value = rightIconRect.left <= signRect.right
})

// #endregion 搜索

// #region ➤ i18n
// ================================================
// #
// Qing 2025-03-31 13:44:08
// ================================================

function handleI18nSelect(key: string | number) {
  changeLocale(key as string)
}
// #endregion i18n
</script>

<template>
  <NLayoutHeader
    class="header h-[var(--header-height)] flex items-center justify-between px-[var(--admin-content-padding)]"
    bordered
  >
    <!-- 左边菜单 -->
    <div class="left-menu relative h-full min-w-0 flex shrink-1 items-center">
      <!-- 抽屉按钮 -->
      <NButton
        v-if="!props.showSider" quaternary :focusable="false" class="menu-btn"
        @click="emits('toggleDrawer', true)"
      >
        <div class="icon icon-base i-mdi-menu" />
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

    <!-- 右边图标 -->
    <div class="right-icon h-full flex shrink-0 items-center justify-end gap-6px">
      <!-- 搜索按钮 -->
      <NButton
        v-show="CONFIG.toolbar.navSearch" quaternary :bordered="true" :focusable="false"
        class="menu-btn search-desk-btn" @click="openSearch"
      >
        <div
          class="h-36px flex cursor-pointer select-none items-center justify-around gap-6px overflow-hidden border-1 border-color-[var(--custom-border-color)] rounded-[var(--custom-border-radius)] border-solid px-6px"
        >
          <div class="icon-base icon-base--md i-mdi-magnify text-[var(--custom-text-color-1)]" />
          <span
            class="text-nowrap font-size-[var(--custom-font-size)] text-[var(--custom-text-color-3)] leading-36px"
          >{{
            t('search.search') }}</span>
          <div
            class="border-1 border-color-[var(--custom-border-color)] rounded-[var(--custom-border-radius)] border-solid bg-[var(--custom-button-color-2)] p-[2px_6px]"
          >
            <div class="font-size-[var(--custom-font-size-mini)] text-[var(--custom-text-color-2)]">
              Ctrl+K
            </div>
          </div>
        </div>
      </NButton>

      <!-- 搜索-移动端 -->
      <NButton
        v-show="CONFIG.toolbar.navSearch" quaternary :focusable="false" class="menu-btn search-mobile-btn hidden"
        @click="openSearch"
      >
        <div class="icon-base--md menu-icon i-mdi-magnify" />
      </NButton>

      <!-- 全屏切换 -->
      <NButton quaternary :focusable="false" class="menu-btn" @click="toggleFullScreen">
        <div
          class="menu-icon icon-base--md i-mdi-fullscreen"
          :class="[isFullScreen ? 'i-mdi-fullscreen-exit' : 'i-mdi-fullscreen']"
        />
      </NButton>

      <!-- 语言切换 -->
      <NDropdown trigger="click" :options="changeableLocales" @select="handleI18nSelect">
        <NButton quaternary :focusable="false" class="menu-btn">
          <div class="menu-icon icon-base--md i-mdi-language" />
        </NButton>
      </NDropdown>

      <!-- 刷新 -->
      <NButton quaternary :focusable="false" class="menu-btn" @click="refreshPageClick">
        <div ref="refreshIconRef" class="menu-icon icon-base--md i-mdi-refresh-circle" />
      </NButton>

      <!-- 切换主题 -->
      <NButton quaternary :focusable="false" class="menu-btn" @click="toggleTheme">
        <div ref="themeIconRef" class="menu-icon icon-base--md" :class="getThemeIcon()" />
      </NButton>

      <!-- 消息通知 -->
      <NDropdown trigger="click" :options="messageOptions">
        <NBadge :count="10" value="20" :offset="['-6px', '6px']">
          <NButton
            quaternary :focusable="false" class="menu-btn" @mouseenter="openMessageHover"
            @click="openMessageClick"
          >
            <div ref="messageIconRef" class="menu-icon icon-base--md i-mdi-bell" />
          </NButton>
        </NBadge>
      </NDropdown>

      <!-- 用户 -->
      <NDropdown trigger="click" :options="userOptions" @select="handleSelect">
        <NButton quaternary :focusable="false" class="menu-btn user-info flex shrink-1 cursor-pointer items-center">
          <img :src="userStore.getDispalyUserInfo.avatar" class="h-20px w-20px rounded-full">
          <div
            class="name m-l-4px max-w-180px min-w-0px shrink-1 grow-1 overflow-hidden text-ellipsis break-all text-nowrap"
          >
            {{ userStore.getDispalyUserInfo.userName }}
          </div>
          <div class="icon-base--md i-mdi-menu-down color-[var(--custom-buttom-color-2)]" />
        </NButton>
      </NDropdown>
    </div>
    <!-- 搜索弹窗 -->
    <SearchModal ref="searchModalRef" :is-mobile="screen.isMobile.value" />
  </NLayoutHeader>
</template>

<style lang="scss" scoped>
@use '@/styles/simple-animation.scss' as *;

.menu-btn {
  --at-apply: "h-36px px-8px active:btn-active hover:btn-hover base-ani";

  /* &:hover {
    --at-apply: "shadow-sm";
  } */

  // 搜索按钮
  &.search-desk-btn {
    --at-apply: "px-0";
  }

}

.mask {
  position: absolute;
  right: 0;
  top: 0;
  width: 50px; // 遮罩宽度
  height: 100%;
  background: linear-gradient(to right, transparent 0%, var(--custom-base-color) 100%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;

  &.mask-active {
    opacity: 1;
  }
}

// 桌面优先，增强小屏幕、移动设备

@media screen and (max-width: $breakpoint-sm) {
  .breadcrumb {
    display: none;
  }

  .search-desk-btn {
    display: none;
  }

  .search-mobile-btn {
    display: block;
  }

  .user-info .name {
    display: none;
  }
}
</style>
