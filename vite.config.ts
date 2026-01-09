/*
 * @Author: Qing
 * @Description: vite.config.ts
 * @Date: 2024-06-21 20:09:26
 * @LastEditTime: 2025-04-28 19:52:38
 */
import type { ConfigEnv, UserConfig } from 'vite'
import moment from 'moment'
import { loadEnv } from 'vite'
import pkg from './package.json'
import { useEnv } from './src/utils/env/useEnv'
import alias from './vite/alias'
import setupPlugins from './vite/plugins'
import { createProxy } from './vite/proxy'

const CWD = process.cwd()
const { name, dependencies, devDependencies, version } = pkg
const __APP_INFO__ = {
  pkg: { name, dependencies, devDependencies, version },
  lastBuildTime: moment().format('YYYY/MM/DD HH:mm:ss'),
}

export default ({ mode }: ConfigEnv): UserConfig => {
  const env = useEnv(loadEnv(mode, CWD))
  return {
    base: env.VITE_BASE_URL,
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
      VITE_APP_TITLE: JSON.stringify(env.VITE_APP_TITLE),
    },
    resolve: {
      alias,
      dedupe: ['vue'], // 防止vue实例多次打包
    },
    plugins: setupPlugins(env),
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/styles/variables.scss" as *;
          `,
        },
      },
    },
    server: {
      port: Number(env.VITE_SERVE_PORT),
      proxy: createProxy(),
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'naive-ui',
      ],
    },
    build: {
      minify: 'esbuild',
      target: 'esnext',
      cssTarget: 'chrome80',
      reportCompressedSize: false,
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          // 稍微优化分包，避免一个巨大的 vendor
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'naive-ui': ['naive-ui'],
            'echarts': ['echarts'],
          },
        },
      },
    },
  }
}
