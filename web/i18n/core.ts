import { createI18n } from 'vue-i18n'
import { datetimeFormats, FALLBACK_LOCALE, numberFormats } from './config'
import { getSavedLocale, syncPluginsLocale } from './sync'

// 批量引入语言包
const modules = import.meta.glob<{ default: any }>('../locales/*.json', {
  eager: true,
  import: 'default',
})

// 自动构建 messages 对象
const messages = Object.entries(modules).reduce((acc, [path, module]) => {
  const matched = path.match(/([A-Z-]+)\.json$/i)
  if (matched && matched[1]) {
    acc[matched[1]] = module
  }
  return acc
}, {} as Record<string, any>)

// 获取初始语言
const defaultLocale = getSavedLocale()

// 创建实例
export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: FALLBACK_LOCALE,
  globalInjection: true,
  messages,
  datetimeFormats,
  numberFormats,
})

// 项目初始化时，同步一次所有第三方插件的语言状态
syncPluginsLocale(defaultLocale)

// 供非 Vue 文件 (如 axios 拦截器, pinia) 使用的翻译函数
export const globalT = i18n.global.t
