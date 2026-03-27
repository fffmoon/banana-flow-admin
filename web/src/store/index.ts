/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-05-28 20:16:33
 * @LastEditTime: 2024-06-04 23:27:08
 */
import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const store = createPinia()

export function setupStore(app: App<Element>) {
  store.use(piniaPluginPersistedstate)
  app.use(store)
}

export { store }
