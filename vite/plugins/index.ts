/*
 * @Author: Qing
 * @Description: 插件配置
 * @Date: 2024-06-21 20:42:27
 * @LastEditTime: 2025-03-13 21:02:32
 */
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import DefineOptions from 'unplugin-vue-define-options/vite'
import AppLoading from 'vite-plugin-app-loading'
import progress from 'vite-plugin-progress'
import vueDevtools from 'vite-plugin-vue-devtools'
import autoImport from './autoimport'
import setupImportToCDNPlugin from './importToCDN'
import setupMockPlugin from './mock'

export default function setupPlugins(env: ImportMetaEnv) {
  const plugins = [
    vue(),
    vueJsx(),
    autoImport(),
    setupMockPlugin(env),
    setupImportToCDNPlugin(),
    UnoCSS(),
    progress(),
    AppLoading('loading.html'),
    DefineOptions(),
  ]

  if (env.VITE_ENV === 'development') {
    plugins.push(vueDevtools())
  }
  if (env.VITE_REPORT_SW === 'true') {
    plugins.push(visualizer({ open: true, gzipSize: true, brotliSize: true }))
  }
  return plugins
}
