<!--
 * @Author: Qing
 * @Description: tabsView
 * @Date: 2025-02-28 14:55:00
 * @LastEditTime: 2025-07-18 17:08:58
-->
<script lang='ts' setup>
import type { CustomDropdownOption } from '@ui/BetterUI'
import type { ITabsViewItem } from '@/store/modules/tabsView'
import { useRoute, useRouter } from 'vue-router'
import HorizontalScroller from '@/components/HorizontalScroller/index.vue'
import { usePageJump } from '@/hooks/usePageJump'
import CONFIG from '@/settings'

const tabsViewStore = useTabsViewStore()
const router = useRouter()
const route = useRoute()
const { goToShouldConfirm, refresh } = usePageJump(router)
const tabsBlockRef = ref<HTMLElement | null>(null)
const scrollerRef = ref<InstanceType<typeof HorizontalScroller> | null>(null)

// #region ➤ 页面操作
// ================================================
// @author: Qing
// @description:
// @date 2025-03-10 14:55:27
// @ver:
// ================================================

// 当前页面位于标签页中的id
const currentTabsViewId = ref<string>('')
// 当前页面位于标签页中的位置，主要用于处理标签页删除之后，应该跳转到哪个页面。
const currentTabsViewIndex = ref<number>(0)

// 监听路径变化，添加tabsview数组
watch(() => route.fullPath, () => {
  tabsViewStore.addTabsView({
    id: route.meta.id as string,
    fullPath: route.fullPath,
    title: route.meta.title as string,
    name: route.name as string,
    icon: route.meta.icon as string,
    isPin: false,
    hideBreadcrumb: route.meta.hideBreadcrumb as boolean,
  })
  currentTabsViewId.value = route.meta.id as string
  currentTabsViewIndex.value = tabsViewStore.getTabsViewList.findIndex(tab => tab.id === currentTabsViewId.value)
  scrollToPosition(currentTabsViewId.value)
}, { immediate: true })

// 处理标签页删除逻辑。监听unPinTabsViewList，判断当前页面id是否存在于 getTabsViewList 中，不能存在则移动到最近的页面
watch(() => tabsViewStore.unPinTabsViewList, () => {
  if (currentTabsViewId.value === '' || tabsViewStore.getTabsViewList.length === 0)
    return
  const idx = tabsViewStore.getTabsViewList.findIndex(tab => tab.id === currentTabsViewId.value)
  // 如果不存在
  if (idx === -1) {
    // 如果当前（上次）的页面比当前数组大，则移动到当前数组的最后一个，如果当前（上次）的页面比当前数组小，则移动到原来的位置
    const nextIdx = tabsViewStore.getTabsViewList.length - 1 >= currentTabsViewIndex.value ? currentTabsViewIndex.value : tabsViewStore.getTabsViewList.length - 1
    const targetTab = tabsViewStore.getTabsViewList[nextIdx]
    goToShouldConfirm(targetTab.fullPath)
  }
})

// 处理点击
function handleClickTab(tab: ITabsViewItem) {
  goToShouldConfirm(tab.fullPath, { replace: true })
}

// #endregion 页面操作

// #region ➤ 处理右键菜单
// ================================================
// @author: Qing
// @description:
// @date 2025-03-06 19:29:56
// @ver:
// ================================================

// 右键配置
function handleSelectTab(tab: ITabsViewItem): CustomDropdownOption[] {
  // 处理固定标签页/取消固定标签页的切换
  function handlePin(isPin: boolean, id: string) {
    if (isPin) {
      return {
        label: '取消固定',
        key: 'thumbtack',
        icon: useIconRenderer('i-mdi-pin-off'),
        handler: () => {
          console.log('取消固定')
          tabsViewStore.unpinTabsView(id)
        },
      }
    }
    else {
      return {
        label: '固定',
        key: 'thumbtack',
        icon: useIconRenderer('i-mdi-pin'),
        handler: () => {
          console.log('固定')
          tabsViewStore.pinTabsView(id)
        },
      }
    }
  }
  const checkCloseResult = tabsViewStore.checkClosableTabs(tab.id)
  const options: CustomDropdownOption[] = [
    {
      label: '刷新',
      key: 'refresh',
      icon: useIconRenderer('i-mdi-refresh'),
      disabled: (tab.id !== currentTabsViewId.value),
      handler: () => {
        // refresh()
        refresh()
      },
    },
    {
      label: '关闭标签页',
      key: 'closeTab',
      disabled: tab.isPin,
      icon: useIconRenderer('i-mdi-close'),
      handler: () => {
        tabsViewStore.handleCloseTabsView(tab.id)
      },
    },
    {
      type: 'divider',
      key: 'd1',
    },
    handlePin(tab.isPin, tab.id),
    {
      label: tabsViewStore.getIsMaximized ? '取消最大化' : '最大化',
      key: 'maximization',
      icon: useIconRenderer('i-mdi-window-maximize'),
      handler: () => {
        console.log('最大化')
        tabsViewStore.toggleMaximize()
      },
    },
    {
      type: 'divider',
      key: 'd1',
    },
    {
      label: '关闭其他标签页',
      key: 'closeOtherTab',
      handler: () => {
        console.log('关闭其他标签页')
        tabsViewStore.handleBatchCloseTabs(tab.id, 'others')
      },
      disabled: !checkCloseResult.others,
    },
    {
      label: '关闭左边标签页',
      key: 'closeLeftTab',
      handler: () => {
        console.log('关闭左边标签页')
        tabsViewStore.handleBatchCloseTabs(tab.id, 'left')
      },
      disabled: !checkCloseResult.left,
    },
    {
      label: '关闭右边标签页',
      key: 'closeRightTab',
      handler: () => {
        console.log('关闭右边标签页')
        tabsViewStore.handleBatchCloseTabs(tab.id, 'right')
      },
      disabled: !checkCloseResult.right,
    },
  ]
  return options
}

// #endregion

// #region ➤ 滚动
// ================================================
// @author: Qing
// @description:
// @date 2025-02-28 13:59:59
// @ver:
// ================================================

// 处理路由改变之后，滚动到标签所在的位置
function scrollToPosition(id) {
  nextTick(() => {
    const scrollEl = scrollerRef.value?.$el
    if (!scrollEl)
      return

    // 在容器内查找目标 Tab 元素
    const targetElement = scrollEl.querySelector(`[data-id="${id}"]`) as HTMLElement | null
    if (!targetElement)
      return

    // 计算居中位置
    const containerWidth = scrollEl.clientWidth
    const targetLeft = targetElement.offsetLeft
    const targetWidth = targetElement.offsetWidth

    // 目标位置 = 元素左边距 + 元素一半宽度 - 容器一半宽度
    const scrollToLeft = targetLeft + targetWidth / 2 - containerWidth / 2

    // 调用公共组件暴露的 scrollTo 方法
    scrollerRef.value?.scrollTo({
      left: scrollToLeft,
      behavior: 'smooth',
    })
  })
}
// #endregion

// #region ➤ 拖拽
// ================================================
// @author: Qing
// @description:
// @date 2025-03-14 16:00:20
// @ver:
// ================================================

// 拖拽状态管理
const dragState = reactive({
  draggingId: '', // 当前拖拽的标签ID
  isPan: false,
})

function handleDragStart(e: DragEvent, tab: ITabsViewItem) {
  // console.log('拖拽目标id', tab.id, '数组类型：', tab.isPin)
  dragState.draggingId = tab.id
  dragState.isPan = tab.isPin
}
function handleDragEnd() {
  // console.log('拖拽结束')
  dragState.draggingId = ''
}

let timer = false
function handleDragEnter(e: DragEvent, tab: ITabsViewItem) {
  if (tab.isPin !== dragState.isPan) {
    // console.log('交换退出，固定类型不相同，忽略')
    return false
  }
  if (tab.id === dragState.draggingId) {
    // console.log('交换退出，交换自身，忽略')
    return false
  }
  if (timer)
    return false
  timer = true
  // console.info('交换元素', dragState.draggingId, tab.id)
  tabsViewStore.exchangePositions(dragState.draggingId, tab.id)
  setTimeout(() => {
    timer = false
  }, 1000 * 0.25)
}

// #endregion 拖拽
</script>

<template>
  <div
    ref="tabsBlockRef"
    class="tabs-container relative h-[var(--tabs-view-height)] w-full select-none bg-[var(--custom-admin-content-color)] px-[var(--admin-content-padding)]"
  >
    <HorizontalScroller ref="scrollerRef" class="custom-scroller-mask">
      <TransitionGroup name="tabs-move" tag="div" class="h-full flex flex-nowrap items-center gap-x-8px pr-4">
        <BContentMenu
          v-for="tab in tabsViewStore.getTabsViewList" :key="tab.id" :options="handleSelectTab(tab)"
          trigger="manual" placement="bottom-start" :data-id="tab.id"
        >
          <div
            draggable="true" class="tab-item" :class="{
              '!btn-select': tab.id === currentTabsViewId,
              'dragging': dragState.draggingId === tab.id,
            }" @click.stop="handleClickTab(tab)" @dragstart="handleDragStart($event, tab)" @dragend="handleDragEnd"
            @dragenter="handleDragEnter($event, tab)"
          >
            <div
              v-if="CONFIG.tabbar.enableIcon" class="ml-4px box-content cursor-pointer font-size-16px"
              :class="tab.icon"
            />
            <div class="ml-6px text-nowrap">
              {{ tab.title }}
            </div>
            <div
              class="operation-box ml-4px h-20px w-20px flex-center rounded-[var(--custom-border-radius-small)] hover:bg-[var(--custom-hover-color)]"
            >
              <div v-if="tab.isPin" class="icon-box i-mdi-pin" @click.stop="tabsViewStore.unpinTabsView(tab.id)" />
              <div v-else class="icon-box i-mdi-close" @click.stop="tabsViewStore.handleCloseTabsView(tab.id)" />
            </div>
          </div>
        </BContentMenu>
      </TransitionGroup>
    </HorizontalScroller>
  </div>
</template>

<style lang='scss' scoped>
.tabs-container {

  .custom-scroller-mask {
    --custom-body-color: var(--custom-admin-content-color);
  }

  .operation-box {
    .icon-box {
      --at-apply: "box-content cursor-pointer font-size-14px"
    }
  }

  .tab-item {
    --at-apply: 'base-ani active:btn-active  hover:btn-hover relative h-[calc(var(--tabs-view-height)-(var(--space-sm)*2))] flex cursor-pointer select-none items-center b-1px b-color-[var(--custom-divider-color)] rounded-[var(--custom-border-radius)] b-solid bg-[var(--custom-card-color)] p-x-4px text-[var(--custom-text-color-3)]';

    &.dragging {
      opacity: 0.5;
      transform: scale(0.95);
      box-shadow: var(--custom-box-shadow-1);
    }

    &:active {
      transform: scale(0.95);
      cursor: grabbing;
    }
  }

  /* 优化过渡动画 */
  .tabs-move {

    &-enter-active,
    &-leave-active {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      pointer-events: none;

    }

    &-enter-from {
      transform: scale(0.5);
      opacity: 0;
    }

    &-leave-to {
      transform: scale(0.3);
      opacity: 0;
    }

    &-move {
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

}
</style>
