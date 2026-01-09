/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-21 20:09:25
 * @LastEditTime: 2025-01-27 15:00:55
 */
import type { App } from 'vue'
import i18n from '@i18n/index'
import { createDiscreteMessage } from '@ui/BetterUI'
import { setupNaiveDiscreteApi } from './setupNaiveDiscreteApi'

export async function setupPlugins(app: App) {
  // console.info('app', app)

  // 安装vconsole
  if (import.meta.env.VITE_VCONSOLE_SW === 'true') {
    try {
      const { default: VConsoleConstructor } = await import('vconsole')
      const vConsole = new VConsoleConstructor()
      if (import.meta.env.DEV) {
        window.$vconsole = vConsole
      }
    }
    catch (error) {
      console.error('vconsole 安装失败', error)
    }
  }

  // 安装 naiveui 的脱离上下文 api
  setupNaiveDiscreteApi()

  // 安装i18n
  app.use(i18n)

  // 挂载我的组件库
  const message = createDiscreteMessage()
  window.$message = message
}
