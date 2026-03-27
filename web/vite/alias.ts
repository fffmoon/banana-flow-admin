import type { AliasOptions } from 'vite'
/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-21 20:42:27
 * @LastEditTime: 2025-03-29 20:38:05
 */
import { resolve } from 'node:path'

const alias: AliasOptions = [
  {
    find: '@inters',
    replacement: resolve(__dirname, '../types/modules'),
  },
  {
    find: '@apis',
    replacement: resolve(__dirname, '../src/api'),
  },
  {
    find: '@stores',
    replacement: resolve(__dirname, '../src/store/modules'),
  },
  {
    find: '@i18n',
    replacement: resolve(__dirname, '../i18n'),
  },
  {
    find: '@mock',
    replacement: resolve(__dirname, '../mock'),
  },
  {
    find: '@ui',
    replacement: resolve(__dirname, '../src/ui'),
  },
  {
    find: '@',
    replacement: resolve(__dirname, '../src'),
  },
]

export default alias
