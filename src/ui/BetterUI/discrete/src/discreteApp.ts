/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-05-23 14:38:12
 * @LastEditTime: 2025-05-26 10:23:01
 */
import type { App } from 'vue'
import { BMessageProvider } from '@ui/BetterUI'
import MessageInjectionExtractor from './InjectionExtractor'

export function createDiscreteMessage() {
  let hostEl: HTMLElement | null = document.createElement('div')
  document.body.appendChild(hostEl)

  let messageApi: ReturnType<typeof useMessage>

  // 创建独立应用实例
  let discreteApp: App<Element> | null = createApp({
    setup() {
      return () =>
        h(BMessageProvider, null, {
          default: () => h(MessageInjectionExtractor, {
            onInit: (api: any) => (messageApi = api),
          }),
        })
    },
  })

  discreteApp.mount(hostEl)

  return {
    ...messageApi!,
    destroy: () => {
      if (!discreteApp || !hostEl) {
        console.warn('[discreteApp]或[hostEl]为空')
        return
      }
      discreteApp.unmount()
      hostEl.remove()
      discreteApp = null
      hostEl = null
    },
  }
}
