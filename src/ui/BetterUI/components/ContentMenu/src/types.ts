import type { VNodeChild } from 'vue'

export interface CustomContentMenuOption {
  key: string | number
  // 显示名称
  label?: string | (() => VNodeChild)
  // 类型，为 divider 时，是分割线
  type?: 'divider' | 'default'
  // 图标
  icon?: () => Component
  // 快捷键图标
  shortcut?: string
  // HTMLAttributes
  props?: Record<string, any>
  // 点击处理函数
  handler?: () => void
  // 是否禁用
  disabled?: boolean
  // 子项
  children?: CustomContentMenuOption[]
}

// 菜单出现的位置
export type Placement =
  | 'top-start' | 'top' | 'top-end'
  | 'right-start' | 'right' | 'right-end'
  | 'bottom-start' | 'bottom' | 'bottom-end'
  | 'left-start' | 'left' | 'left-end'

// 触发方式
export type Trigger = 'hover' | 'click' | 'manual'
