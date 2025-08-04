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
      port: env.VITE_SERVE_PORT,
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
      target: 'es2020',
      cssTarget: 'chrome85',
      reportCompressedSize: false,
      // chunkSizeWarningLimit: 2048,
      /* rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      }, */
      /**
       * esbuild 不支持 drop_console 功能，但是打包速度快
       */
      /* minify: 'terser',
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: Object.is(env.VITE_CONSOLE_SW, 'true'),
        },
      }, */
    },
  }
}
