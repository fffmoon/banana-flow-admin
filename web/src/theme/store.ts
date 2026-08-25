/*
 * @Author: Qing
 * @Description: 主题状态管理
 * @Date: 2024-05-28 20:16:33
 * @LastEditTime: 2025-10-24 10:00:00
 */

import type { GlobalThemeOverrides } from 'naive-ui'
import type {
  IColorThemeConfig,
  IThemeColorOption,
  IThemeCustomOptions,
  IThemeMode,
  IThemeModeOption,
  IUserThemeMode,
} from '@/theme/type'
import { deepMerge } from '@antfu/utils'
import { globalT as t } from '@i18n/index'
import { usePreferredDark, useStorage } from '@vueuse/core'

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import CONFIG from '@/settings'
import { store } from '@/store'
import { generateStateColors, setCssVarsRecursively } from '@/theme/utils'
import { themeCustom as rawThemeCustom, theme16a34a, themeDefault, themef97316, themeFF3D68 } from './config'

export const useThemeStore = defineStore('theme', () => {
  // #region ➤ State
  // ================================================

  const userThemeMode = useStorage<IUserThemeMode>('userThemeMode', CONFIG.app.colorScheme)
  const themeMode = useStorage<IThemeMode>('themeMode', 'light')
  const themeColorId = useStorage<string>('themeColorId', 'themeDefault')
  const themeCustom = useStorage<IColorThemeConfig>('themeCustom', JSON.parse(JSON.stringify(themeDefault)))

  const customOptions = ref<IThemeCustomOptions | null>(null)
  const naiveuiOptions = ref<GlobalThemeOverrides | null>(null)

  const isSystemDark = usePreferredDark()

  // #endregion State

  // #region ➤ Getters
  // ================================================

  const getIsDarkTheme = computed(() => themeMode.value === 'dark')
  const getNaiveuiOptions = computed(() => naiveuiOptions.value as GlobalThemeOverrides)
  const getCustomOptions = computed(() => customOptions.value as IThemeCustomOptions)

  const themeColorOptions = computed<IThemeColorOption[]>(() => [
    { id: 'themeDefault', label: t('themes.color.default'), options: themeDefault, showMenu: true },
    { id: 'themeCustom', label: t('themes.color.custom'), options: rawThemeCustom, showMenu: false },
    { id: 'themeFF3D68', label: t('themes.color.pink'), options: themeFF3D68, showMenu: true },
    { id: 'themef97316', label: t('themes.color.orange'), options: themef97316, showMenu: true },
    { id: 'theme16a34a', label: t('themes.color.green'), options: theme16a34a, showMenu: true },
  ])

  const themeModeOptions = computed<IThemeModeOption[]>(() => [
    { id: 0, label: t('themes.theme.light'), icon: 'i-mdi-brightness-5', value: 'light' },
    { id: 1, label: t('themes.theme.dark'), icon: 'i-mdi-brightness-4', value: 'dark' },
    { id: 2, label: t('themes.theme.system'), icon: 'i-mdi-brightness-auto', value: 'system' },
  ])

  // #endregion Getters

  // #region ➤ Watchers
  // ================================================

  // 监听模式选择，决定最终的 themeMode
  watch([userThemeMode, isSystemDark], ([userMode, systemDark]) => {
    if (userMode === 'system') {
      themeMode.value = systemDark ? 'dark' : 'light'
    }
    else {
      themeMode.value = userMode
    }
  }, { immediate: true })

  // 监听 themeMode 变化，自动处理 DOM 上的 Class
  watch(themeMode, (mode) => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(mode)
  }, { immediate: true })

  // 监听主题配色相关的所有状态，发生改变时重新计算并注入 CSS 变量
  watch([themeMode, themeColorId, themeCustom], () => {
    updateThemeSettings()
  }, { immediate: true, deep: true })

  // #endregion Watchers

  // #region ➤ Actions
  // ================================================

  function initTheme() {
    // 合并本地保存的自定义主题和默认自定义主题
    const defaultCustomTheme = themeColorOptions.value.find(t => t.id === 'themeCustom')?.options
    if (defaultCustomTheme) {
      themeCustom.value = deepMerge(defaultCustomTheme, themeCustom.value) as IColorThemeConfig
    }
  }

  function setUserThemeMode(mode: IUserThemeMode) {
    userThemeMode.value = mode
  }

  function toggleActiveThemeMode() {
    userThemeMode.value = getIsDarkTheme.value ? 'light' : 'dark'
  }

  function resetThemeToDefault() {
    userThemeMode.value = 'light'
    themeColorId.value = 'themeDefault'
  }

  function setColorTheme(id: string) {
    const targetTheme = themeColorOptions.value.find(t => t.id === id)
    if (!targetTheme) {
      console.error('主题风格未找到：', id)
      return
    }
    themeColorId.value = id
  }

  function setCustomPrimaryColor(primaryColor: string) {
    const customConfig = JSON.parse(JSON.stringify(themeCustom.value)) as IColorThemeConfig

    // 遍历 light 和 dark，批量替换主色调
    for (const key of ['light', 'dark'] as const) {
      customConfig[key].custom.primaryColor = primaryColor
      if (customConfig[key].naiveui.common) {
        customConfig[key].naiveui.common!.primaryColor = primaryColor
      }
    }

    themeCustom.value = customConfig
    themeColorId.value = 'themeCustom'
  }

  // #endregion Actions

  // #region ➤ Helpers
  // ================================================

  function updateThemeSettings() {
    let currentConfig: IColorThemeConfig

    if (themeColorId.value === 'themeCustom') {
      currentConfig = themeCustom.value
    }
    else {
      const targetTheme = themeColorOptions.value.find(t => t.id === themeColorId.value)
      currentConfig = targetTheme ? targetTheme.options : themeDefault
    }

    const currentThemeSeries = currentConfig[themeMode.value]

    // 1. 处理自定义颜色
    customOptions.value = processCustomColors(currentThemeSeries.custom)
    setCssVarsRecursively(customOptions.value, '--custom')

    // 2. 处理 Naive UI 颜色
    naiveuiOptions.value = deepMerge({ common: customOptions.value } as GlobalThemeOverrides, currentThemeSeries.naiveui)
    setCssVarsRecursively(naiveuiOptions.value)
  }

  function processCustomColors(customConfig: IThemeCustomOptions): IThemeCustomOptions {
    if (!customConfig.primaryColor) {
      console.error('主色调未定义')
      return customConfig
    }

    const professionalColors: Array<'primary' | 'info' | 'success' | 'warning' | 'error'> = [
      'primary',
      'info',
      'success',
      'warning',
      'error',
    ]

    const renamedColors: Partial<IThemeCustomOptions> = {}

    professionalColors.forEach((colorType) => {
      const colorKey = `${colorType}Color` as keyof IThemeCustomOptions
      const colorValue = customConfig[colorKey] as string

      if (colorValue) {
        const stateColors = generateStateColors(colorValue)
        Object.assign(renamedColors, {
          [colorKey]: stateColors.base,
          [`${colorType}ColorHover`]: stateColors.hover,
          [`${colorType}ColorPressed`]: stateColors.pressed,
          [`${colorType}ColorSuppl`]: stateColors.suppl,
          [`${colorType}ColorDisabled`]: stateColors.disabled,
        })
      }
    })

    return deepMerge(renamedColors, customConfig) as IThemeCustomOptions
  }
  // #endregion Helpers

  return {
    // State
    userThemeMode,
    themeMode,
    themeColorId,
    themeCustom,
    customOptions,
    naiveuiOptions,

    // Getters
    getIsDarkTheme,
    getNaiveuiOptions,
    getCustomOptions,
    themeColorOptions,
    themeModeOptions,

    // Actions
    initTheme,
    setUserThemeMode,
    toggleActiveThemeMode,
    resetThemeToDefault,
    setColorTheme,
    setCustomPrimaryColor,
  }
})

export function useThemeStoreWithOut() {
  return useThemeStore(store)
}
