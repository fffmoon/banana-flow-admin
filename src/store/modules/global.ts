/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-14 16:19:21
 * @LastEditTime: 2025-07-21 14:05:13
 */
import type { IWaterMarkOptions } from '@/directive/vBetterWaterMark/type'
import CONFIG from '@/settings'

interface IGlobalState {
  // 水印配置
  watermarkOptions: IWaterMarkOptions
  // 页面切换动画类名
  transitionName: 'fade-slide' | 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'flip'
}

export const useGlobalStore = defineStore('global', {
  state: (): IGlobalState => ({
    watermarkOptions: {
      show: CONFIG.watermark.enable,
      content: CONFIG.watermark.content,
      timestamp: CONFIG.watermark.timestamp,
      fontSize: CONFIG.watermark.fontSize,
      textColor: CONFIG.watermark.textColor,
      customContent: CONFIG.watermark.customContent,
    },
    transitionName: CONFIG.app.transitionName,
  }),
  getters: {
    getWatermarkOptions(): IGlobalState['watermarkOptions'] {
      return this.watermarkOptions
    },
    getCustomWatermarkContent(): IWaterMarkOptions['customContent'] {
      return this.watermarkOptions.customContent
    },
    getTransitionName(): IGlobalState['transitionName'] {
      return this.transitionName
    },
  },
  actions: {
    // 切换水印显示隐藏
    toggleWatermark(status?: boolean) {
      this.watermarkOptions.show = status ?? !this.watermarkOptions.show
    },
    // 配置水印
    setWatermarkOptions(options: Partial<IGlobalState['watermarkOptions']>) {
      this.watermarkOptions = {
        ...this.watermarkOptions,
        ...options,
      }
    },
    // 将水印设置为用户昵称
    setWatermarkName() {
      if (this.watermarkOptions.customContent)
        return
      const userStore = useUserStore()
      const userName = userStore.getDispalyUserInfo.userName
      this.setWatermarkOptions({
        content: userName,
      })
    },
    // 是否自定义水印内容
    setCustomWatermarkContent(status: boolean) {
      this.watermarkOptions.customContent = status
      !status && this.setWatermarkName()
    },
    // 重置水印
    resetWatermarkConfig() {
      this.watermarkOptions = {
        show: CONFIG.watermark.enable,
        content: CONFIG.watermark.content,
        timestamp: CONFIG.watermark.timestamp,
        fontSize: CONFIG.watermark.fontSize,
        textColor: CONFIG.watermark.textColor,
      }
      this.watermarkOptions.customContent = CONFIG.watermark.customContent
    },
    // 设置页面切换动画
    setTransitionName(name: IGlobalState['transitionName']) {
      this.transitionName = name
    },
  },
  persist: {
    storage: sessionStorage,
  },
})
