/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-05-28 20:16:33
 * @LastEditTime: 2025-03-28 09:29:26
 */
import { loadingFadeOut } from 'virtual:app-loading'
import { createApp } from 'vue'
import App from './App.vue'
import { setupDirective } from './directive'
import { setupPlugins } from './plugins'
import { router, setupRouter } from './router'
import { setupStore } from './store'
import '@/styles/reset.scss'
import '@/styles/global.scss'
import 'virtual:uno.css'

// import '@unocss/reset/tailwind-compat.css'

// 来自 express 的灵感，将所有加载放入该方法中。
async function bootstrap() {
  const app = createApp(App)
  // 安装Pinia
  setupStore(app)
  // 安装插件，vite-plugin-components 需要手动引入组件
  setupPlugins(app)
  // 安装自定义指令
  setupDirective(app)
  // 安装router
  setupRouter(app)
  // 服务器渲染适配
  await router.isReady()
  // 载入完成
  loadingFadeOut()
  app.mount('#app')
}

bootstrap()
