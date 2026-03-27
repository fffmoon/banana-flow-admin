import { cloneDeep } from 'lodash-es'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import CONFIG from '@/settings'

export const useWatermarkStore = defineStore('watermark', () => {
  /* state */
  const watermarkConfig: Ref<Settings.RequiredWatermark> = ref(cloneDeep(CONFIG.watermark))

  /* actions */
  // 切换水印显示隐藏
  function toggleWatermark(status?: boolean) {
    watermarkConfig.value.show = status ?? !watermarkConfig.value.show
  }
  // 将水印内容设置为用户昵称
  function setWatermarkName() {
    if (watermarkConfig.value.customContent)
      return
    const userStore = useUserStore()
    const userName = userStore.getDispalyUserInfo.userName
    watermarkConfig.value.content = userName
  }
  // 切换是否自定义水印内容
  function setCustomWatermarkContent(status: boolean) {
    watermarkConfig.value.customContent = status
    if (!status)
      setWatermarkName()
  }

  // 重置水印配置
  function resetWatermarkConfig() {
    watermarkConfig.value = cloneDeep(CONFIG.watermark)
  }

  return {
    watermarkConfig,
    toggleWatermark,
    setWatermarkName,
    setCustomWatermarkContent,
    resetWatermarkConfig,
  }
}, {
  persist: true,
})
