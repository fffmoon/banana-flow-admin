/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-14 16:19:21
 * @LastEditTime: 2025-07-21 14:05:13
 */
import type { IWaterMarkOptions } from '@/directive/vBetterWaterMark/type'
import CONFIG from '@/settings'

interface IConfigState extends Settings.All {
  watermark: Settings.RequiredAll['watermark']
  app: {
    transitionName: Settings.RequiredAll['app']['transitionName']
  }
  menu: {
    mode: Settings.RequiredAll['menu']['mode']
  }
}

export const useConfigStore = defineStore('config', {
  state: (): IConfigState => ({
    watermark: CONFIG.watermark,
    app: {
      transitionName: CONFIG.app.transitionName,
    },
    menu: {
      mode: CONFIG.menu.mode,
    },
  }),
  getters: {
    getWatermarkOptions(): IConfigState['watermark'] {
      return this.watermark
    },
    getCustomWatermarkContent(): IWaterMarkOptions['customContent'] {
      return this.watermark.customContent
    },
    getTransitionName(): IConfigState['app']['transitionName'] {
      return this.app.transitionName
    },
  },
  actions: {
    // 切换水印显示隐藏
    toggleWatermark(status?: boolean) {
      this.watermark.show = status ?? !this.watermark.show
    },
    // 配置水印
    setWatermarkOptions(options: Partial<IConfigState['watermark']>) {
      this.watermark = {
        ...this.watermark,
        ...options,
      }
    },
    // 将水印设置为用户昵称
    setWatermarkName() {
      if (this.watermark.customContent)
        return
      const userStore = useUserStore()
      const userName = userStore.getDispalyUserInfo.userName
      this.setWatermarkOptions({
        content: userName,
      })
    },
    // 是否自定义水印内容
    setCustomWatermarkContent(status: boolean) {
      this.watermark.customContent = status
      !status && this.setWatermarkName()
    },
    // 重置水印
    resetWatermarkConfig() {
      this.watermark = {
        show: CONFIG.watermark.show,
        content: CONFIG.watermark.content,
        timestamp: CONFIG.watermark.timestamp,
        fontSize: CONFIG.watermark.fontSize,
        textColor: CONFIG.watermark.textColor,
        customContent: CONFIG.watermark.customContent,
      }
    },
    // 设置页面切换动画
    setTransitionName(name: IConfigState['app']['transitionName']) {
      this.app.transitionName = name
    },
  },
  persist: {
    storage: sessionStorage,
  },
})
