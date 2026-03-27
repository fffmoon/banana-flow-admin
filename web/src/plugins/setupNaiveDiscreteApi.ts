import { useThemeStoreWithOut } from '@/theme'

import { createDiscreteApi, darkTheme } from 'naive-ui'

export function setupNaiveDiscreteApi() {
  const themeStore = useThemeStoreWithOut()
  // 主题颜色
  const configProviderPropsRef = computed(() => ({
    theme: themeStore.getIsDarkTheme
      ? darkTheme
      : undefined,
    themeOverrides: themeStore.getNaiveuiOptions,
  }))
  // 获取
  const { dialog, notification, loadingBar } = createDiscreteApi(
    ['message', 'dialog', 'notification', 'loadingBar'],
    {
      configProviderProps: configProviderPropsRef,
    },
  )
  // 挂载到 window
  window.$dialog = dialog
  window.$notification = notification
  window.$loadingBar = loadingBar
}
