/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-06 19:11:59
 * @LastEditTime: 2025-03-18 14:08:25
 */
import { defineStore } from 'pinia'

interface IVersionStoreState {
  // 上次的版本
  lastModified: string
  // 当前的版本
  currentModified: string
}

export const useVersionStore = defineStore('version', {
  state: (): IVersionStoreState => ({
    lastModified: '',
    currentModified: '',
  }),
  getters: {
    showUpdateDialog: (state) => {
      if (!state.lastModified || !state.currentModified)
        return false
      if (state.lastModified !== state.currentModified) {
        return true
      }
      return false
    },
  },
  actions: {
    updateVersion(headers: { 'last-modified'?: string }) {
      if (!this.currentModified) {
        this.currentModified = headers['last-modified'] || this.lastModified
      }
      this.lastModified = headers['last-modified'] || this.lastModified
    },
    handleUpdate() {
      // 清空数据
      this.currentModified = ''
      this.lastModified = ''
      // 强制刷新页面（带缓存清除策略）
      const isHashRouter = window.location.pathname.includes('#')
      const reloadUrl = isHashRouter
        ? `${window.location.href.split('#')[0]}?t=${Date.now()}#${window.location.hash}`
        : `${window.location.href}?t=${Date.now()}`

      // 双重保障刷新策略
      window.navigator.serviceWorker?.getRegistration()
        .then(reg => reg?.unregister())
        .finally(() => {
          window.location.href = reloadUrl
          window.location.reload()
        })
    },
  },
})
