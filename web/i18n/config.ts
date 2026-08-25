import type { I18nOptions } from 'vue-i18n'
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'

export const LOCALE_KEY = 'locale'
export const FALLBACK_LOCALE = 'en-US'

// Naive UI 语言包映射
export const naiveuiMap: Record<string, any> = {
  'zh-CN': { options: zhCN, dateOptions: dateZhCN },
  'en-US': { options: enUS, dateOptions: dateEnUS },
}

// 时间格式化配置
export const datetimeFormats: I18nOptions['datetimeFormats'] = {
  'zh-CN': {
    long: { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false },
  },
  'en-US': {
    long: { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true },
  },
}

// 数字/货币格式化配置
export const numberFormats: I18nOptions['numberFormats'] = {
  'zh-CN': {
    currency: { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 },
    percent: { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  },
  'en-US': {
    currency: { style: 'currency', currency: 'USD', minimumFractionDigits: 2 },
    percent: { style: 'percent', useGrouping: false, minimumFractionDigits: 1 },
  },
}
