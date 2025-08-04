/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-01-16 19:01:40
 * @LastEditTime: 2025-04-16 19:47:40
 */

import type { ColorScale, IThemeConfig, IThemeSeries } from './type'
import chroma from 'chroma-js'

/**
 * @Author: Qing
 * @Description: 设置
 */
export function setCssVar(prop: string, val: any, dom = document.documentElement) {
  dom.style.setProperty(prop, val)
}

/**
 * @Author: Qing
 * @Description: 移除
 * @param {string} prop - 要移除的 CSS 变量名
 * @param {HTMLElement} [dom] - 要操作的 DOM 元素，默认为根元素
 */
export function removeCssVar(prop: string, dom: HTMLElement = document.documentElement) {
  dom.style.removeProperty(prop)
}

/**
 * @Author: Qing
 * @Description: 递归设置 CSS 变量
 * @param {object} obj - 要设置 CSS 变量的对象
 * @param {string} [prefix] - CSS 变量前缀
 */
export function setCssVarsRecursively(obj: Record<string, any>, prefix: string = '-') {
  for (const key in obj) {
    const val = obj[key]
    const label = `${prefix}-${toKebabCase(key)}`

    if (typeof val === 'object' && val !== null) {
      // 如果 val 是对象，则递归调用
      setCssVarsRecursively(val, label)
    }
    else {
      // 设置 CSS 变量
      setCssVar(label, val)
      // console.info(label, val)
    }
  }
}

/**
 * @Author: Qing
 * @Description: 递归返回 CSS 变量
 * @param {object} obj - 要设置 CSS 变量的对象
 * @param {string} [prefix] - CSS 变量前缀
 */
export function getCssVarsRecursively(obj: Record<string, any>, prefix: string = '-'): Record<string, any> {
  let reault: Record<string, any> = {}
  for (const key in obj) {
    const val = obj[key]
    const label = `${prefix}-${toKebabCase(key)}`

    if (typeof val === 'object' && val !== null) {
      // 如果 val 是对象，则递归调用
      const childen = getCssVarsRecursively(val, label)
      reault = { ...reault, ...childen }
    }
    else {
      reault[label] = val
    }
  }
  return reault
}
// 转换函数
export function convertToCSSVariables(themeMode: string, obj: Record<string, any>) {
  const variables = Object.entries(obj).map(([key, value]) => {
    return `${key}: ${value};`
  }).join('\n')

  return `.${themeMode} { 
        ${variables}
      }`
}

// 色相偏移策略
const HARMONY_STRATEGY = {
  info: { hue: +40, sat: +0.05, lum: -0.03 }, // 邻近色
  success: { hue: +120, sat: +0.1, lum: -0.1 }, // 三分色
  warning: { hue: -50, sat: +0.2, lum: +0.05 }, // 警示色
  error: { hue: +180, sat: -0.15, lum: +0.1 }, // 互补色
}

// 颜色生成器
function generateHarmonyColor(base: string, type: keyof typeof HARMONY_STRATEGY): string {
  const baseColor = chroma(base)
  const { hue, sat, lum } = HARMONY_STRATEGY[type]

  const [h, s, l] = baseColor.hsl()

  // 动态亮度补偿算法
  const newHue = (h + hue + 360) % 360
  const newSat = Math.min(Math.max(s + sat, 0.15), 0.95)
  const newLum = chroma.hsl(newHue, newSat, l + lum).luminance() > 0.4
    ? l + lum - 0.05
    : l + lum + 0.05

  return chroma.hsl(newHue, newSat, newLum).hex()
}

// 通过色相旋转算法自动生成协调的配色方案
export function generateHarmonyColors(primaryColor: string) {
  return {
    primaryColor,
    infoColor: generateHarmonyColor(primaryColor, 'info'),
    successColor: generateHarmonyColor(primaryColor, 'success'),
    warningColor: generateHarmonyColor(primaryColor, 'warning'),
    errorColor: generateHarmonyColor(primaryColor, 'error'),
  }
}

/**
 * @author Qing
 * @description 生成包含所有状态的色阶
 * @param {string} baseColor 主要的颜色
 * @return {ColorScale} 颜色组合
 * @date 2025-03-20 19:33:52
 */
export function generateStateColors(baseColor: string): ColorScale {
  const color = chroma(baseColor)
  const isLight = color.luminance() > 0.4

  // 将 chroma 的 rgba 数组转换为 CSS 字符串
  const toRGBAString = (chromaColor: chroma.Color) => {
    const [r, g, b, a] = chromaColor.rgba() // 返回 [r, g, b, a] 数组
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(2)})`
  }

  return {
    base: color.hex(),
    hover: color.brighten(isLight ? 0.1 : 0.3).hex(),
    pressed: color.darken(isLight ? 0.15 : 0.2).hex(),
    suppl: toRGBAString(color.alpha(0.1)), // ✅ rgba(112,192,232,0.10)
    disabled: toRGBAString(color.desaturate(0.8).alpha(0.4)), // ✅ rgba(180,180,180,0.40)
  }
}

/**
 * 在link中创建所有主题的类名
 */
export function createAllThemeClass(options: IThemeConfig) {
  // 生成主题的类名
  // 定义样式标签的唯一标识属性
  const THEME_STYLE_TAG_ID = 'data-theme-style'
  const oldStyles = document.querySelectorAll(`style[${THEME_STYLE_TAG_ID}]`)
  oldStyles.forEach(style => style.remove())
  let allThemesCSS = ''
  for (const key in options) {
    const themeStyle: IThemeSeries = options[key]
    const cssObj = getCssVarsRecursively(themeStyle.custom, '--custom')
    // console.log('cssObj', cssObj)
    const cssClass = convertToCSSVariables(`${key}`, cssObj)
    allThemesCSS += `${cssClass}\n`
  }
  const style = document.createElement('style')
  style.setAttribute(THEME_STYLE_TAG_ID, 'true')
  style.textContent = allThemesCSS
  document.head.appendChild(style)
}
