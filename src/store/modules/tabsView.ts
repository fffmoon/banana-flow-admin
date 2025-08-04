/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-26 23:28:40
 * @LastEditTime: 2025-05-07 11:05:25
 */

interface ITabsViewState {
  // 非固定的标签页
  unPinTabsViewList: ITabsViewItem[]
  // 固定标签页
  pinTabsViewList: ITabsViewItem[]
  // 是否最大化
  isMaximized: boolean
}

export type IcurrentTabsViewId = ITabsViewItem['id'] | null

export interface ITabsViewItem {
  // 作为唯一ID
  id: string
  // 完整路径
  fullPath: string
  // 标题
  title: string
  // 路由的name
  name: string
  // 图标
  icon: string
  // 是否固定
  isPin: boolean
  // 见路由定义
  hideBreadcrumb: boolean
}

export const useTabsViewStore = defineStore('tabsView', {
  state: (): ITabsViewState => ({
    pinTabsViewList: [],
    unPinTabsViewList: [],
    isMaximized: false,
  }),
  getters: {
    getTabsViewList(): ITabsViewItem[] {
      return [...this.pinTabsViewList, ...this.unPinTabsViewList]
    },
    getIsMaximized(): boolean {
      return this.isMaximized
    },
  },
  actions: {
    // 添加一个标签页
    addTabsView(tabsView: ITabsViewItem) {
      // console.info('添加一个标签页', tabsView)
      // 如果存在，则不添加
      if (this.getTabsViewList.some(item => item.id === tabsView.id)) {
        return
      }
      // 如果 hideBreadcrumb = true 则不添加
      if (tabsView.hideBreadcrumb) {
        return
      }
      this.unPinTabsViewList.push(tabsView)
    },
    // 处理关闭目标标签页
    handleCloseTabsView(id: IcurrentTabsViewId) {
      if (this.getTabsViewList.length <= 1) {
        window.$message.error('操作失败，最后一个标签无法关闭！')
        return
      }
      // 删除目标标签页
      if (this.unPinTabsViewList.find(tab => tab.id !== id)) {
        console.error(`关闭标签失败，不存在${id}标签页`)
        return
      }
      this.unPinTabsViewList = this.unPinTabsViewList.filter(tab => tab.id !== id)
      const asyncRouteStore = useAsyncRouteStore()
      asyncRouteStore.removeKeepAlive(id as string)
    },
    // 检查目标标签页的左边|右边是否有可以关闭的标签页，不包括固定标签页
    checkClosableTabs(id: IcurrentTabsViewId): {
      left: boolean
      right: boolean
      others: boolean
    } {
      const targetIndex = this.unPinTabsViewList.findIndex(tab => tab.id === id)
      if (targetIndex === -1)
        return { left: false, right: false, others: false }

      // 左侧可关闭标签检测
      const leftClosable = this.unPinTabsViewList.slice(0, targetIndex).length > 0

      // 右侧可关闭标签检测
      const rightClosable = this.unPinTabsViewList.slice(targetIndex + 1).length > 0

      // 其他可关闭标签检测（非固定且非自身）
      const othersClosable = this.unPinTabsViewList.filter(tab => tab.id !== id).length > 0

      return {
        left: leftClosable,
        right: rightClosable,
        others: othersClosable,
      }
    },
    // 处理批量关闭标签页
    handleBatchCloseTabs(id: IcurrentTabsViewId, direction: 'left' | 'right' | 'others') {
      if (direction === 'left' || direction === 'right')
        this.deleteSideTabs(id, direction)
      else if (direction === 'others')
        this.deleteOtherTabs(id)
    },
    // 删除目标标签页的左边|右边所有标签页，不包括固定的标签页
    deleteSideTabs(id: IcurrentTabsViewId, direction: 'left' | 'right'): void {
      const targetIndex = this.unPinTabsViewList.findIndex(tab => tab.id === id)
      if (targetIndex === -1)
        return

      // 保留的标签页逻辑
      this.unPinTabsViewList = this.unPinTabsViewList.filter((tab, index) => {
        // 始终保留固定标签页和目标标签页
        if (index === targetIndex)
          return true

        // 根据方向判断是否保留
        return direction === 'left'
          ? index >= targetIndex // 删除左侧时保留右侧（包括目标右侧）
          : index <= targetIndex // 删除右侧时保留左侧（包括目标左侧）
      })
    },
    // 关闭其他标签页（保留当前和固定标签页）
    deleteOtherTabs(id: IcurrentTabsViewId): void {
      const targetTab = this.unPinTabsViewList.find(tab => tab.id === id)
      if (!targetTab)
        return

      // 过滤条件：保留固定标签页和目标标签页
      this.unPinTabsViewList = this.unPinTabsViewList.filter(tab => tab.id === id)

      // 如果当前标签页未在列表中，重新添加（防止误删）
      if (!this.unPinTabsViewList.some(tab => tab.id === id)) {
        this.unPinTabsViewList.push(targetTab)
      }
    },
    // 清空标签页
    clearTabsViewList() {
      this.unPinTabsViewList = []
      this.pinTabsViewList = []
    },
    // 固定标签页
    pinTabsView(id: IcurrentTabsViewId) {
      const targetIndex = this.unPinTabsViewList.findIndex(tab => tab.id === id)
      if (targetIndex === -1) {
        console.error('没有找到目标标签页')
        return
      }
      // 目标的元素
      const targetTab = { ...JSON.parse(JSON.stringify(this.unPinTabsViewList[targetIndex])) as ITabsViewItem, isPin: true }
      // 移除原元素
      this.unPinTabsViewList.splice(targetIndex, 1)
      // 添加到固定列表中
      this.pinTabsViewList.push(targetTab)
    },
    // 解除固定标签页
    unpinTabsView(id: IcurrentTabsViewId) {
      const targetIndex = this.pinTabsViewList.findIndex(tab => tab.id === id)
      if (targetIndex === -1) {
        console.error('没有找到目标标签页')
        return
      }
      // 目标的元素
      const targetTab = { ...JSON.parse(JSON.stringify(this.pinTabsViewList[targetIndex])) as ITabsViewItem, isPin: false }
      // 移除原元素
      this.pinTabsViewList.splice(targetIndex, 1)
      // 添加到非固定列表中
      this.unPinTabsViewList.unshift(targetTab)
    },
    // 交换位置
    exchangePositions(id: string, targetId: string) {
      // 辅助函数：增加查找缓存避免多次遍历
      const findTab = (tabId: string) => {
        const pinIndex = this.pinTabsViewList.findIndex(tab => tab.id === tabId)
        if (pinIndex !== -1)
          return { list: this.pinTabsViewList, index: pinIndex }

        const unPinIndex = this.unPinTabsViewList.findIndex(tab => tab.id === tabId)
        return unPinIndex !== -1
          ? { list: this.unPinTabsViewList, index: unPinIndex }
          : null
      }

      const source = findTab(id)
      const target = findTab(targetId)

      if (!source || !target)
        return
      if (source.list !== target.list)
        return

      // 显式使用splice触发Vue响应式更新（解构赋值TS报错）
      const temp = source.list[source.index]
      source.list.splice(source.index, 1, source.list[target.index])
      source.list.splice(target.index, 1, temp)
    },
    // 切换最大化
    toggleMaximize(status?: boolean) {
      this.isMaximized = status ?? !this.isMaximized
    },
  },
  // 由于频繁操作内容使用持久化
  persist: {
    storage: sessionStorage,
    pick: [
      'pinTabsViewList',
      'unPinTabsViewList',
    ],
  },
})
