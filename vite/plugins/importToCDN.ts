/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-26 16:33:11
 * @LastEditTime: 2025-04-29 15:13:02
 */
import { Plugin } from 'vite-plugin-cdn-import'

export default function setupImportToCDNPlugin() {
  return Plugin({
    // prodUrl: 'https://s4.zstatic.net/ajax/libs/{name}/{version}/{path}',
    modules: [
      /*
        @example
      {
        // 引入时的包名
        name: 'moment',
        // app.use(), 全局注册时分配给模块的变量
        var: 'moment',
        // 根据自己的版本号找到对应的CDN网址 https://cdn.zstatic.net 禁止使用 bootcdn 被供应链投毒
        path: 'https://cdn.staticfile.net/moment.js/2.30.1/moment.min.js',
        css: '',
      }, */
      /* {
        name: 'vue',
        var: 'Vue',
        path: 'https://s4.zstatic.net/ajax/libs/vue/3.3.4/vue.global.prod.min.js',
      },
      {
        name: 'vue-router',
        var: 'VueRouter',
        path: 'https://s4.zstatic.net/ajax/libs/vue-router/4.2.5/vue-router.global.min.js',
      },
      {
        name: 'vue-i18n',
        var: 'VueI18n',
        path: 'https://s4.zstatic.net/ajax/libs/vue-i18n/11.1.1/vue-i18n.global.prod.min.js',
      }, */
      /* {
        name: 'pinia',
        var: 'Pinia',
        path: 'https://s4.zstatic.net/ajax/libs/pinia/3.0.1/pinia.iife.min.js',
      }, */
      /* {
        name: 'naive-ui',
        var: 'naive',
        path: 'https://s4.zstatic.net/ajax/libs/naive-ui/2.38.2/index.prod.js',
      }, */
      {
        name: 'moment',
        var: 'moment',
        path: 'https://s4.zstatic.net/ajax/libs/moment.js/2.30.1/moment.min.js',
      },
      {
        name: 'axios',
        var: 'axios',
        path: 'https://s4.zstatic.net/ajax/libs/axios/1.5.1/axios.min.js',
      },
      {
        name: 'vconsole',
        var: 'vconsole',
        path: 'https://s4.zstatic.net/ajax/libs/vConsole/3.15.1/vconsole.min.js',
      },
      {
        name: 'marked',
        var: 'marked',
        path: 'https://s4.zstatic.net/ajax/libs/marked/12.0.2/marked.min.js',
      },
      {
        name: 'echarts',
        var: 'echarts',
        path: 'https://s4.zstatic.net/ajax/libs/echarts/5.6.0/echarts.min.js',
      },
      /* {
        name: 'three',
        var: 'THREE',
        path: `https://s4.zstatic.net/ajax/libs/three.js/0.168.0/three.module.min.js`,
      }, */
      /* {
        name: 'driver',
        var: 'driver',
        path: 'https://cdn.bootcdn.net/ajax/libs/driver.js/1.3.1/driver.js.mjs',
        css: 'https://cdn.bootcdn.net/ajax/libs/driver.js/1.3.1/driver.min.css',
      }, */
    ],
  })
}
