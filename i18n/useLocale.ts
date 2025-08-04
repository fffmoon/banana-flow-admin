/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-31 18:49:58
 * @LastEditTime: 2025-04-23 17:29:47
 */
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import i18n from './index'

export function useLocale() {
  const { locale, t, availableLocales, d, n } = useI18n()
  const loading = ref(false)

  // 当前的语言
  const currentLocale = computed(() => locale.value)

  // 支持的语言列表
  const availableLocalesList = computed(() => availableLocales)

  // 可以切换的语言列表
  const changeableLocales = computed(() => {
    if (!availableLocalesList.value || availableLocalesList.value.length === 0)
      return []
    return availableLocalesList.value.map((item) => {
      return {
        label: t(`language.${item}`),
        key: item,
        disabled: item === locale.value,
      }
    })
  })

  // 切换语言
  const changeLocale = async (value: string) => {
    loading.value = true
    try {
      // 动态导入语言包
      const messages = await import(`../locales/${value}.ts`)
      // console.log('加载的语言包内容:', messages)
      i18n.global.setLocaleMessage(value, messages.default)

      locale.value = value
      localStorage.setItem('locale', value)

      // 修改 HTML lang 属性
      document.querySelector('html')?.setAttribute('lang', value)
    }
    catch (error) {
      console.error('语言包加载失败:', error)
    }
    finally {
      loading.value = false
    }
  }

  // naiveui 扩展
  const naiveuiMap = {
    'zh-CN': {
      options: zhCN,
      dateOptions: dateZhCN,
    },
    'en-US': {
      options: enUS,
      dateOptions: dateEnUS,
    },
  }
  // 获取当前语言的语言配置
  const getNaiveuiLocale = computed(() => {
    return naiveuiMap[currentLocale.value] as typeof naiveuiMap['zh-CN']
  })

  return {
    t,
    d,
    n,
    loading,
    currentLocale,
    availableLocales,
    changeableLocales,
    changeLocale,
    getNaiveuiLocale,
  }
}
