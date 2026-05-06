import moment from 'moment'
import { LOCALE_KEY } from './config'
import 'moment/dist/locale/zh-cn'

/**
 * 获取当前存储的语言，如果没有则默认中文
 */
export function getSavedLocale(): string {
  return localStorage.getItem(LOCALE_KEY) || 'zh-CN'
}

/**
 * 统一同步所有外部插件的语言状态
 * @param locale 当前语言标识
 */
export function syncPluginsLocale(locale: string) {
  // 1. 同步 HTML 属性
  document.documentElement.setAttribute('lang', locale)

  // 2. 同步本地存储
  localStorage.setItem(LOCALE_KEY, locale)

  // 3. 同步 Moment.js (未来如果换 Day.js 也只需改这里)
  moment.locale(locale === 'zh-CN' ? 'zh-cn' : 'en')
}
