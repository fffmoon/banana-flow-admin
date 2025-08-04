/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-31 18:49:58
 * @LastEditTime: 2025-05-08 10:51:16
 */
import type { I18nOptions } from 'vue-i18n'
import { createI18n } from 'vue-i18n'

const modules = import.meta.glob<{ default: import('vue-i18n').DefineLocaleMessage }>('../locales/*.ts', {
  eager: true,
  import: 'default',
})

// console.info('检测到的语言文件:', Object.keys(modules))

// 构建 messages 对象
const messages = Object.entries(modules).reduce((acc, [path, module]) => {
  const matched = path.match(/([A-Z-]+)\.ts$/i)
  if (matched && matched[1]) {
    acc[matched[1]] = module
  }
  return acc
}, {} as Record<string, any>)

const options: I18nOptions = {
  legacy: false,
  locale: localStorage.getItem('locale') || 'zh-CN',
  globalInjection: true,
  fallbackLocale: 'en-US',
  messages,
  datetimeFormats: {
    'zh-CN': {
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      },
    },
    'en-US': {
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      },
    },
  },
  numberFormats: {
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2,
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    'en-US': {
      currency: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      },
      percent: {
        style: 'percent',
        useGrouping: false,
        minimumFractionDigits: 1,
      },
    },
  },
}

const i18n = createI18n(options)

export default i18n
