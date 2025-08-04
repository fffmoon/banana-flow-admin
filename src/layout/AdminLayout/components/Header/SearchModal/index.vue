<!--
 * @Author: Qing
 * @Description: 集成搜索功能的模态框组件
 * @Date: 2025-03-12 00:58:38
 * @LastEditTime: 2025-05-21 13:01:55
-->
<script lang="ts" setup>
import type { IRouteItem, IRouteMeta } from 'types/vue-router'
import { usePageJump } from '@/hooks/usePageJump'
import { router } from '@/router'
import { useAsyncRouteStore } from '@/store/modules/asyncRoute'
import { parse } from 'tiny-pinyin'
import { computed, ref } from 'vue'

interface FlattenedRoute {
  title?: string
  path: string
  icon?: string
  meta: IRouteMeta
}
defineProps<{
  isMobile: boolean
}>()

const asyncRouteStore = useAsyncRouteStore()
const { goToShouldConfirm } = usePageJump(router)
const { t } = useLocale()

// 响应式状态
const show = ref(false)
const keyword = ref('')
const loading = ref(false)
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const placeholderText = computed(() => t('search.support'))

// 打开搜索框
function toggleSearchModal(status?: boolean) {
  show.value = status ?? !show.value
  if (show.value) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

// 计算属性
const allRoutes = computed(() => {
  return asyncRouteStore.routerMenus.flatMap(route => flattenRoutes(route))
})

const showInitialTip = computed(() => {
  return !keyword.value && !loading.value
})

const searchResults = computed(() => {
  try {
    if (!keyword.value)
      return []

    const kw = keyword.value.toLowerCase()
    return allRoutes.value.filter((route) => {
      const title = route.meta.title
      const path = route.path || route.meta.path
      return (
        title?.toLowerCase().includes(kw)
        || path?.toLowerCase().includes(kw)
        || getInitials(title).toLowerCase().includes(kw)
      )
    })
  }
  catch (error) {
    console.error(error)
    return []
  }
})

// 方法定义
function handleSearch() {
  if (searchResults.value[activeIndex.value]) {
    handleSelectItem(searchResults.value[activeIndex.value])
  }
}

function handleKeyDown() {
  if (activeIndex.value < searchResults.value.length - 1) {
    activeIndex.value++
  }
}

function handleKeyUp() {
  if (activeIndex.value > 0) {
    activeIndex.value--
  }
}

function handleSelectItem(item: FlattenedRoute) {
  goToShouldConfirm(item.path, {
    successCallback: () => {
      keyword.value = ''
      handleClose()
    },
  })
}

function handleClose() {
  toggleSearchModal(false)
}

// 辅助函数
function getInitials(str: string) {
  if (!str)
    return ''
  try {
    // 解析中文字符
    const parsed = parse(str)
    return parsed
      .map((p) => {
        // 中文处理
        if (p.type === 2) { // 2表示中文
          return p.target[0]?.toUpperCase() || ''
        }
        // 非中文直接取首字母
        return p.source[0]?.toUpperCase() || ''
      })
      .join('')
  }
  catch {
    return str[0]?.toUpperCase() || ''
  }
}

function flattenRoutes(routes: IRouteItem): FlattenedRoute[] {
  // 过滤 hideBreadcrumb === true 的路由
  if (routes.meta?.hideBreadcrumb)
    return []

  // 没有子路由的情况
  if (!routes.children?.length) {
    return [{
      title: routes.meta.title,
      path: routes.path,
      icon: routes.meta.icon?.trim(),
      meta: routes.meta,
    }]
  }

  // 递归处理子路由
  return routes.children
    .filter(child => !child.meta?.hideBreadcrumb) // 过滤子路由
    .flatMap(child => ({
      title: child.meta.title,
      path: child.path,
      icon: child.meta.icon?.trim(),
      meta: child.meta,
    }))
}

defineExpose({
  toggleSearchModal,
})
</script>

<template>
  <NModal v-model:show="show" :mask-closable="true">
    <NCard
      content-style="padding: 0;" class="card-box fixed left-50%"
      :class="isMobile ? 'w-full top-0' : 'w-600px top-60px'" :bordered="false" size="huge" role="dialog"
      aria-modal="true"
    >
      <div class="flex flex-col overflow-hidden" :class="isMobile ? 'h-100vh' : ''">
        <!-- 搜索输入框 -->
        <div class="flex p-20px">
          <NInputGroup>
            <NInput
              ref="inputRef" v-model:value="keyword" :placeholder="placeholderText" clearable autofocus
              @keyup.enter="handleSearch" @keyup.down="handleKeyDown" @keyup.up="handleKeyUp"
            >
              <template #prefix>
                <div class="icon-base--md i-mdi-magnify" />
              </template>
            </NInput>
            <NButton v-if="isMobile" ghost>
              <template #icon>
                <NIcon>
                  <div class="icon-base--md i-mdi-close" @click="handleClose"></div>
                </NIcon>
              </template>
            </NButton>
          </NInputGroup>
        </div>

        <!-- 搜索结果列表 -->
        <div class="min-h-0 flex-1 p-20px pt-0">
          <template v-if="showInitialTip">
            <div class="p-4 text-center text-[var(--custom-placeholder-color)]">
              {{ t('search.placeholder') }}
            </div>
          </template>
          <template v-else-if="searchResults.length === 0">
            <NEmpty :description="t('search.noResult')" />
          </template>
          <template v-else>
            <BScrollbar
              :content-class="{
                'max-h-40vh': !isMobile,
                'h-full': isMobile,
              }"
            >
              <NList hoverable>
                <NListItem
                  v-for="(item, index) in searchResults" :key="item.meta.id" class="cursor-pointer"
                  :class="{ 'bg-[var(--custom-hover-color)]': activeIndex === index }" @click="handleSelectItem(item)"
                >
                  <div class="key-btn gap-2">
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                    <NText depth="3" class="ml-2 text-xs">
                      {{ item.path }}
                    </NText>
                  </div>
                </NListItem>
              </NList>
            </BScrollbar>
          </template>
        </div>

        <!-- 快捷键提示（仅PC显示） -->
        <div
          v-if="!isMobile"
          class="border-t-1 border-t-color-[var(--custom-border-color)] border-t-solid p-20px py-10px"
        >
          <div class="flex justify-between text-xs text-[var(--custom-text-color-3)]">
            <div class="key-btn">
              <div class="keyboard-box">
                <div class="icon-base--md i-mdi-keyboard-return" />
              </div>
              <div class="txt">
                {{ t('search.confirm') }}
              </div>
            </div>
            <div class="key-btn">
              <div class="keyboard-box">
                <div class="icon-base--md i-mdi-chevron-up" />
              </div>
              <div class="keyboard-box">
                <div class="icon-base--md i-mdi-chevron-down" />
              </div>
              <div class="txt">
                {{ t('search.switch') }}
              </div>
            </div>
            <div class="key-btn">
              <div class="keyboard-box">
                <div class="icon-base--md i-mdi-keyboard-esc" />
              </div>
              <div class="txt">
                {{ t('search.exit') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </NCard>
  </NModal>
</template>

<style lang="scss" scoped>
.key-btn {
  --at-apply: "flex items-center";

  .txt {
    --at-apply: "ml-4px";
  }

}

.card-box {
  transform: translateX(-50%);
}
</style>
