import type { GlobalThemeOverrides } from 'naive-ui'
/*
 * @Author: Qing
 * @Description: 主题
 * @Date: 2024-05-28 20:16:33
 * @LastEditTime: 2025-07-31 17:19:08
 */
import type {
  ITheme,
  IThemeConfig,
  IThemeCustomOptions,
  IThemeMode,
  IThemeSeries,
  IUserThemeMode,
} from '@/theme'
import { deepMerge } from '@antfu/utils'
import { defineStore } from 'pinia'
import CONFIG from '@/settings'
import { store } from '@/store'
import {
  generateStateColors,
  setCssVarsRecursively,
} from '@/theme'
import { Storage } from '@/utils/storage/Storage'
import { themeDefault, themes } from './themes'

interface ThemeState {
  // 用户主题模式
  userThemeMode: IUserThemeMode
  // 主题模式
  themeMode: IThemeMode
  // 色调ID
  themeColorId: string
  // 自定义数据
  customOptions: IThemeCustomOptions | null
  // naiveui数据
  naiveuiOptions: GlobalThemeOverrides | null
  // 自定义主题数据
  themeCustom: IThemeConfig
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    userThemeMode: Storage.get('userThemeMode', CONFIG.app.colorScheme),
    themeMode: 'light',
    themeColorId: Storage.get('themeColorId', 'themeDefault'),
    themeCustom: Storage.get('themeCustom', JSON.parse(JSON.stringify(themeDefault)) as IThemeConfig),
    customOptions: null,
    naiveuiOptions: null,
  }),
  getters: {
    // 获取主题是否为暗黑模式
    getIsDarkTheme(): boolean {
      return this.themeMode === 'dark'
    },
    // 获取主题风格naiveui参数
    getNaiveuiOptions(): GlobalThemeOverrides {
      return this.naiveuiOptions as GlobalThemeOverrides
    },
    // 获取主题风格自定义参数
    getCustomOptions(): IThemeCustomOptions {
      return this.customOptions as IThemeCustomOptions
    },
  },
  actions: {
    /**
     * 初始化主题
     */
    initTheme() {
      // 初始自定义主题，将自定义主题的配置和用户保存的配置进行合并
      const defaultThemeCustom = themes.find(t => t.id === 'themeCustom') as ITheme
      this.themeCustom = deepMerge(defaultThemeCustom.options, this.themeCustom) as IThemeConfig
      // 设置主题色
      this.setThemeColorScheme(this.themeColorId)
      // 启用监听系统
      this.watchSystemTheme()
      this.setUserThemeMode(this.userThemeMode)
    },
    // 检测系统主题变化
    watchSystemTheme() {
      const systemThemeHandler = (e: MediaQueryListEvent) => {
        console.log('监听到系统主题变化：', e.matches, this.userThemeMode)
        if (this.userThemeMode === 'system') {
          this.setActiveThemeMode(e.matches ? 'dark' : 'light')
        }
      }

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
      prefersDark.addEventListener('change', systemThemeHandler)

      onBeforeUnmount(() => {
        prefersDark.removeEventListener('change', systemThemeHandler)
      })
    },
    /**
     * 设置用户选择的主题模式
     */
    setUserThemeMode(mode: IUserThemeMode) {
      this.userThemeMode = mode
      Storage.set('userThemeMode', mode)
      if (mode === 'system') {
        // 初始设置
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
        this.setActiveThemeMode(prefersDark.matches ? 'dark' : 'light')
      }
      else {
        this.setActiveThemeMode(mode)
      }
    },
    /**
     * 设置主题
     */
    setActiveThemeMode(themeMode: IThemeMode) {
      this.themeMode = themeMode
      Storage.set('themeMode', this.themeMode)
      this.applyThemeToDom()
      this.updateThemeSettings()
    },
    // 将主题名字添加到DOM的根目录
    applyThemeToDom() {
      // 先删除，再添加
      for (const key in themeDefault) {
        const themeMode = key as IThemeMode
        document.documentElement.classList.remove(themeMode)
      }
      document.documentElement.classList.add(this.themeMode)
    },
    /**
     * 切换主题
     */
    toggleActiveThemeMode() {
      this.setUserThemeMode(!this.getIsDarkTheme ? 'dark' : 'light')
    },
    /**
     * 重置为默认主题
     */
    resetThemeToDefault() {
      this.customOptions = null
      this.naiveuiOptions = null
      this.setActiveThemeMode('light')
      this.setThemeColorScheme('themeDefault')
    },
    /**
     * 切换主题的主色调
     */
    setThemeColorScheme(themeColorId: string) {
      // 获取主题
      const targetTheme = themes.find(t => t.id === themeColorId)
      if (!targetTheme) {
        console.error('主题风格未找到：', themeColorId)
        return false
      }

      // 生成主题的类名
      // this.createAllThemeClass(targetTheme.options)

      // 更新状态
      this.themeColorId = themeColorId
      Storage.set('themeColorId', this.themeColorId)
      this.updateThemeSettings()
    },
    /**
     * 设置自定义的主色调
     */
    setCustomPrimaryColor(primaryColor: string) {
      // 合成自定义颜色
      // 切换主要色调
      const targetTheme = themes.find(t => t.id === 'themeCustom') as ITheme
      for (const key in targetTheme.options) {
        const theme = targetTheme.options[key] as IThemeSeries
        theme.custom.primaryColor = primaryColor
        if (theme.naiveui.common) {
          theme.naiveui.common.primaryColor = primaryColor
        }
      }
      // 更新状态
      this.themeCustom = targetTheme.options
      Storage.set('themeCustom', this.themeCustom)
      this.setThemeColorScheme('themeCustom')
    },
    /**
     * 更新主题配置
     */
    updateThemeSettings() {
      const theme = themes.find(t => t.id === this.themeColorId) as ITheme
      const currentTheme = theme.options[this.themeMode]

      this.updateCustomOptions(currentTheme.custom)
      this.updateNaiveuiOptions(currentTheme.naiveui)
    },
    // 更新自定义的颜色
    updateCustomOptions(customOptions: IThemeCustomOptions) {
      /* 处理自定义的颜色 */
      // 检查主色调有没有定义，如果没有定义则报错
      const primaryColor = customOptions.primaryColor
      if (!primaryColor) {
        console.error('主色调未定义')
        return false
      }

      /* 通过主色调生成警告、提示、成功等专业颜色，生成之后合并 */
      // DOTO
      /* const palette = generateHarmonyColors(primaryColor)
      const processedCustomOptions = deepMerge(palette, customOptions) as IThemeCustomOptions */

      /* 通过各种专业颜色生成状态颜色，生成之后合并 */
      type ColorType = 'primary' | 'info' | 'success' | 'warning' | 'error'
      type ColorKey = `${ColorType}Color`

      const professionalColors: ColorType[] = ['primary', 'info', 'success', 'warning', 'error']

      // 生成需要处理的颜色映射
      const renamedColors = professionalColors.reduce((acc: Partial<IThemeCustomOptions>, colorType) => {
        const colorKey = `${colorType}Color` as ColorKey
        // 类型安全检查是否存在该颜色配置
        if (!(colorKey in customOptions))
          return acc
        // 明确类型为字符串（需确保实际数据符合该类型）
        const colorValue = customOptions[colorKey] as string
        // 生成状态颜色
        const stateColors = generateStateColors(colorValue)
        return {
          ...acc,
          [colorKey]: stateColors.base,
          [`${colorType}ColorHover`]: stateColors.hover,
          [`${colorType}ColorPressed`]: stateColors.pressed,
          [`${colorType}ColorSuppl`]: stateColors.suppl,
          [`${colorType}ColorDisabled`]: stateColors.disabled,
        }
      }, {})
      const processedCustomOptions = deepMerge(
        renamedColors,
        customOptions,
      ) as IThemeCustomOptions

      /* 通过主色调生成所有模块的颜色，生成之后合并 */
      // DOTO

      // 更新状态
      this.customOptions = processedCustomOptions
      Storage.set('customOptions', processedCustomOptions)
      // console.log('customOptions', this.customOptions)

      // 应用样式
      setCssVarsRecursively(this.customOptions, '--custom')
    },
    // 更新 naiveui 的颜色
    updateNaiveuiOptions(naiveuiOptions: GlobalThemeOverrides) {
      /* 处理 naiveui 的颜色 */
      // 通过自定义颜色生成 naiveui 的颜色，生成之后合并
      const processedNaiveuiOptions = deepMerge({ common: this.customOptions } as GlobalThemeOverrides, naiveuiOptions)

      this.naiveuiOptions = processedNaiveuiOptions
      Storage.set('naiveuiOptions', processedNaiveuiOptions)
      // console.info('updateNaiveuiOptions', this.naiveuiOptions)

      // 应用样式
      setCssVarsRecursively(this.naiveuiOptions)
    },
  },
})

// 导出 store，方便在组件外使用
export function useThemeStoreWithOut() {
  return useThemeStore(store)
}
