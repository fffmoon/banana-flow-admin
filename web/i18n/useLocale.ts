import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { naiveuiMap } from './config'
import { syncPluginsLocale } from './sync'

export function useLocale() {
  const { locale, t, availableLocales, d, n } = useI18n()
  const loading = ref(false)

  const currentLocale = computed(() => locale.value)

  // 动态生成下拉菜单可用的语言列表
  const changeableLocales = computed(() => {
    return availableLocales.map(item => ({
      label: t(`language.${item}`),
      key: item,
      disabled: item === locale.value,
    }))
  })

  // 切换语言
  const changeLocale = async (value: string) => {
    if (value === locale.value)
      return

    loading.value = true
    try {
      // 1. 切换 vue-i18n 内部状态
      locale.value = value

      // 2. 调用统一同步中心，触发所有第三方插件的语言切换
      syncPluginsLocale(value)
    }
    catch (error) {
      console.error('语言切换失败:', error)
    }
    finally {
      loading.value = false
    }
  }

  // 获取当前 Naive UI 配置供 <n-config-provider> 使用
  const getNaiveuiLocale = computed(() => naiveuiMap[currentLocale.value] || naiveuiMap['en-US'])

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
