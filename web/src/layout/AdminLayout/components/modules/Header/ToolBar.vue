<!--
 * @Author: Qing
 * @Description: 通用右侧工具栏 (搜索、全屏、设置、头像等)
-->
<script lang='ts' setup>
import { h, ref, computed, inject } from 'vue'
import MessageList from './MessageList/index.vue'
import UserInfo from './UserInfo/index.vue'
import { useLocale } from '@i18n/useLocale'
import { router } from '@/router'
import CONFIG from '@/settings'
import { useThemeStore } from '@/theme'
import { useSearchModal } from '../../features/SearchModal'
import { useMessageStore } from '@/store/modules/message'

const { t, changeLocale, changeableLocales } = useLocale()
const themeStore = useThemeStore()
const userStore = useUserStore()
const { refresh } = usePageJump(router)
const { addAnimateClass, toggleThemeAnimation } = useAnimation()
const { openSearch } = useSearchModal()
const { go } = usePageJump(router)
const messageStore = useMessageStore()
const { unreadCount } = storeToRefs(messageStore)

// #region ➤ 逻辑复用
// ================================================

/* 更换主题逻辑 */
const themeIconRef = ref<HTMLElement>()
async function toggleTheme(event: MouseEvent) {
    const { clientX, clientY } = event
    toggleThemeAnimation({ clientX, clientY })
}

/* 偏好设置 */
const themeSettingKey = inject(ThemeSettingKey)
function openSettingClick() {
    themeSettingKey?.openThemeSetting()
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
    isFullScreen.value = !isFullScreen.value
    if (isFullScreen.value) {
        document.documentElement.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}

/* 消息 */
const messageIconRef = ref<HTMLElement>()
function openMessageClick() {
    console.log('openMessageClick')
    messageStore.getUnreadCount()
    showPopover.value = true
}
function openMessageHover() {
    addAnimateClass(messageIconRef.value as HTMLElement, { className: 'shake-icon-2x' })
}
const messageOptions = [{ key: 'header', type: 'render', render: () => h(MessageList) }]

const showPopover = ref(false)


// 初始化获取未读数
onMounted(() => {
    messageStore.getUnreadCount()
})

/* 用户下拉菜单 */
const userOptions = computed(() => {
    return [
        { key: 'header', type: 'render', render: () => h(UserInfo) },
        { label: t('user.menu.profile'), key: 'editProfile', icon: useIconRenderer('i-mdi-cog') },
        { label: t('user.menu.preferences'), key: 'openSettingClick', icon: useIconRenderer('i-mdi-account-edit') },
        { label: t('user.menu.logout'), key: 'logout', icon: useIconRenderer('i-mdi-logout') },
    ]
})

function handleSelect(key: string) {
    switch (key) {
        case 'openSettingClick': openSettingClick(); break;
        case 'logout':
            window.$dialog.info({
                title: t('user.store.logout'),
                content: t('user.store.logoutConfirm'),
                positiveText: t('common.confirm'),
                negativeText: t('common.cancel'),
                draggable: true,
                onPositiveClick: () => userStore.logout(),
            })
            break;
        case 'editProfile':
            // 判断当前是否在/account/profile 页面，如果在的话，提示已经在个人资料页面
            if (router.currentRoute.value.path === '/account/profile') {
                window.$message.warning('您已经在个人资料页面')
                return
            }
            go('/account/profile', { checkUnsaved: true })
            break;
        default: break;
    }
}

function getThemeIcon() {
    if (themeStore.userThemeMode) {
        const findRes = themeStore.themeModeOptions.find(item => item.value === themeStore.themeMode)
        return findRes?.icon
    }
    return ''
}
function handleI18nSelect(key: string | number) {
    changeLocale(key as string)
}
// #endregion
</script>

<template>
    <!-- 右边图标 -->
    <div class="right-icon h-full flex shrink-0 items-center justify-end gap-6px">
        <!-- 搜索按钮 -->
        <NButton v-show="CONFIG.toolbar.navSearch" quaternary :bordered="true" :focusable="false"
            class="menu-btn search-desk-btn" @click="openSearch">
            <div
                class="h-36px flex cursor-pointer select-none items-center justify-around gap-6px overflow-hidden border-1 border-color-[var(--custom-border-color)] rounded-[var(--custom-border-radius)] border-solid px-6px">
                <div class="icon-base icon-base--md i-mdi-magnify text-[var(--custom-text-color-1)]" />
                <span
                    class="text-nowrap font-size-[var(--custom-font-size)] text-[var(--custom-text-color-3)] leading-36px">{{
                        t('search.search') }}</span>
                <div
                    class="border-1 border-color-[var(--custom-border-color)] rounded-[var(--custom-border-radius)] border-solid bg-[var(--custom-button-color-2)] p-[2px_6px]">
                    <div class="font-size-[var(--custom-font-size-mini)] text-[var(--custom-text-color-2)]">
                        Ctrl+K
                    </div>
                </div>
            </div>
        </NButton>

        <!-- 搜索-移动端 -->
        <NButton v-show="CONFIG.toolbar.navSearch" quaternary :focusable="false"
            class="menu-btn search-mobile-btn hidden" @click="openSearch">
            <div class="icon-base--md menu-icon i-mdi-magnify" />
        </NButton>

        <!-- 全屏切换 -->
        <NButton quaternary :focusable="false" class="menu-btn" @click="toggleFullScreen">
            <div class="menu-icon icon-base--md i-mdi-fullscreen"
                :class="[isFullScreen ? 'i-mdi-fullscreen-exit' : 'i-mdi-fullscreen']" />
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
        <n-popover trigger="manual" :show-arrow="false" :show="showPopover" @clickoutside="() => showPopover = false">
            <template #trigger>
                <NBadge :value="unreadCount" :max="99" :offset="['-6px', '6px']">
                    <NButton quaternary :focusable="false" class="menu-btn" @mouseenter="openMessageHover"
                        @click="openMessageClick">
                        <div ref="messageIconRef" class="base-ani icon-base--md i-mdi-bell" />
                    </NButton>
                </NBadge>
            </template>
            <MessageList @close="() => showPopover = false" />
        </n-popover>

        <!-- 用户 -->
        <NDropdown trigger="click" :options="userOptions" @select="handleSelect">
            <NButton quaternary :focusable="false" class="menu-btn user-info flex shrink-1 cursor-pointer items-center">
                <img :src="userStore.getDispalyUserInfo.avatar" class="h-20px w-20px rounded-full">
                <div
                    class="name m-l-4px max-w-100px min-w-0px shrink-1 grow-1 overflow-hidden text-ellipsis break-all text-nowrap">
                    {{ userStore.getDispalyUserInfo.nickname }}
                </div>
                <div class="icon-base--md i-mdi-menu-down color-[var(--custom-buttom-color-2)]" />
            </NButton>
        </NDropdown>
    </div>
</template>

<style lang="scss" scoped>
@use '@/styles/components/simple-animation.scss' as *;

.menu-btn {
    --at-apply: "h-36px px-8px active:btn-active hover:btn-hover base-ani";

    &.search-desk-btn {
        --at-apply: "px-0";
    }
}

@media screen and (max-width: $breakpoint-sm) {
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