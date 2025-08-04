/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-07-14 11:18:44
 * @LastEditTime: 2025-07-15 11:24:19
 */
import type { InjectionKey, VNode, VNodeChild } from 'vue'

export type MenuOptionType = 'menu' | 'group' | 'divider'

// 主要配置
export interface MenuOption {
  show?: boolean
  key: string
  label: string | (() => VNodeChild)
  type?: MenuOptionType
  icon?: () => Component | VNode
  disabled?: boolean
  children?: MenuOption[]
  expanded?: boolean // 是否展开
}

// 拍扁之后的配置
export interface FlatMenuOption extends MenuOption {
  parents: string[]
  depth: number
}

export interface MenuExposeMethods {
  showOption: (key?: string) => void
}

// 所有MenuOptions子类的接受参数
export interface IMenuItemProps {
  depth: number
  collapsed: boolean
  // selectedKey: string
  rootIndent: number
  collapsedIconSize: number
  indent: number
}

export interface IBetterMenuProvide {
  expandedMap: Ref<Record<string, boolean>>
  toggleExpandState: (key: string) => void
  handleSelect: (key: string, item: MenuOption) => void
  activeKeys: Ref<Set<string>>
  selectedKey: Ref<string>
}

export const BetterMenuProvideKey: InjectionKey<IBetterMenuProvide> = Symbol('BetterMenuProvideKey')
