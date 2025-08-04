/*
 * @Author: Qing
 * @Description: 配置文件
 * @Date: 2025-01-26 21:57:40
 * @LastEditTime: 2025-04-22 09:43:43
 */

import { resolve } from 'node:path'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { presetIcons } from '@unocss/preset-icons'
import { defineConfig, presetAttributify, presetUno, transformerDirectives } from 'unocss'
import presetAnimations from 'unocss-preset-animations'
import { presetShadcn } from 'unocss-preset-shadcn'
import { routeIcons } from './src/router/routeIcons'

// 自定义图标路径
const customIconPath = resolve(process.cwd(), 'src/assets/svg')

export default defineConfig({
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        'src/**/*.{js,ts}',
      ],
    },
  },
  presets: [
    presetUno({
      theme: {
        // 来源：全局搜[BREAKPOINTS]
        breakpoints: {
          xs: '575.98px',
          sm: '767.98px',
          md: '991.98px',
          lg: '1199.98px',
          xl: '1399.98px',
        },
      },
    }),
    presetAttributify(),
    presetIcons({
      // 图标集合配置
      collections: {
        // 使用已安装的图标集
        ion: () => import('@iconify-json/ion/icons.json').then(i => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
        // 自定义图标集合
        custom: FileSystemIconLoader(customIconPath, svg =>
          svg.replace(/^<svg /, '<svg fill="currentColor" ')),
      },
      // 图标样式
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
        'flex-shrink': '0',
      },
      scale: 1,
      // i-{collection}-{icon}
      prefix: 'i-',
    }),
    presetAnimations(),
    presetShadcn(),
  ],
  safelist: [...routeIcons],
  transformers: [transformerDirectives()],
  // 定义组合
  shortcuts: {
    // 宽高100%
    'wh-full': 'w-full h-full',
    // 一行显示
    'text-truncate': 'overflow-hidden text-ellipsis whitespace-nowrap break-words',
    // 居中
    'flex-center': 'flex items-center justify-center',

    /* 动效 */
    'base-ani': 'transition-all duration-299 ease-in-out transform-gpu',
    // 按钮动效
    'btn-hover': 'bg-[var(--custom-hover-color)] shadow-sm color-[var(--custom-text-color-1)]',
    'btn-select': 'bg-[var(--custom-primary-color-suppl)] text-[var(--custom-primary-color)] shadow-sm',
    // 'btn-active': 'scale-95 translate-y-0.25',
    // 卡片动效
    'card-hover': 'shadow-xl -translate-y-0.5',

    /* 例子 */
    // 定义单个样式组合
    'btn': 'py-2 px-4 font-semibold rounded-lg shadow-md',
    'btn-primary': 'bg-blue-500 text-white hover:bg-blue-700',
    // 可以引用其他快捷方式
    'btn-secondary': 'btn bg-gray-500 text-white hover:bg-gray-700',

  },

  // 定义自定义规则
  rules: [
  ],
})
