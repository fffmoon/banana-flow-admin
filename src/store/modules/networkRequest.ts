/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-14 16:19:21
 * @LastEditTime: 2025-07-21 14:41:01
 */
import type { IThemeLoadingStyle } from '@/layout/AdminLayout/components/NetworkRequest'
import CONFIG from '@/settings'

interface INetworkRequestState {
  // loading风格
  themeLoadingStyle: IThemeLoadingStyle | null
}

export const useNetworkRequestStore = defineStore('networkRequest', {
  state: (): INetworkRequestState => ({
    themeLoadingStyle: CONFIG.app.networkRequestLoadingStyle,
  }),
  getters: {
    // 获取主题loading风格
    getThemeLoadingStyle(): IThemeLoadingStyle {
      return this.themeLoadingStyle as IThemeLoadingStyle
    },
  },
  actions: {
    /**
     * 设置主题loading风格
     */
    setThemeModeLoadingStyle(themeLoadingStyle: IThemeLoadingStyle) {
      this.themeLoadingStyle = themeLoadingStyle
    },
  },
  persist: {
    storage: sessionStorage,
  },
})
