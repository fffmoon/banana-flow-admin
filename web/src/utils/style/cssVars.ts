// src/utils/css-vars.ts

type CssVarElement = HTMLElement | Document | null

export interface CssVarAccessor {
  get: () => string
  set: (value: string | null) => void
}

export function getCssVar(
  varName: string,
  element: CssVarElement = document.documentElement,
): string {
  if (!element)
    return ''
  return getComputedStyle(element as HTMLElement).getPropertyValue(varName).trim()
}

export function setCssVar(
  varName: string,
  value: string | null,
  element: CssVarElement = document.documentElement,
): void {
  if (!element)
    return;
  (element as HTMLElement).style.setProperty(varName, value)
}

export function cssVar(
  varName: string,
  initialValue: string | null = null,
): CssVarAccessor {
  let currentValue = initialValue

  return {
    get: () => {
      const value = getCssVar(varName)
      return value || currentValue || ''
    },
    set: (newValue: string | null) => {
      currentValue = newValue
      setCssVar(varName, newValue)
    },
  }
}

// 类型定义
type BreakpointKeys = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type SpacingKeys = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

// 预定义变量访问接口
export const breakpoints: Record<BreakpointKeys, CssVarAccessor> = {
  xs: cssVar('--breakpoint-xs'),
  sm: cssVar('--breakpoint-sm'),
  md: cssVar('--breakpoint-md'),
  lg: cssVar('--breakpoint-lg'),
  xl: cssVar('--breakpoint-xl'),
}

export const spacing: Record<SpacingKeys, CssVarAccessor> = {
  xs: cssVar('--space-xs'),
  sm: cssVar('--space-sm'),
  md: cssVar('--space-md'),
  lg: cssVar('--space-lg'),
  xl: cssVar('--space-xl'),
  xxl: cssVar('--space-xxl'),
}

// 扩展类型声明
declare global {
  interface Window {
    __CSS_VARS__: {
      breakpoints: typeof breakpoints
      spacing: typeof spacing
    }
  }
}

// 开发调试用
if (import.meta.env.DEV) {
  window.__CSS_VARS__ = {
    breakpoints,
    spacing,
  }
}
