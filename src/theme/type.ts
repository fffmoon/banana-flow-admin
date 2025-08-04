import type { GlobalThemeOverrides } from 'naive-ui'

// 用户主题模式
export type IUserThemeMode = 'light' | 'dark' | 'system'

// 主题类型
export type IThemeMode = 'light' | 'dark'

// 自定义的参数
export interface IThemeCustomOptions {
  /* 颜色系统 */
  primaryColor: string
  primaryColorHover?: string
  primaryColorPressed?: string
  primaryColorSuppl?: string
  primaryColorDisabled?: string

  infoColor?: string
  infoColorHover?: string
  infoColorPressed?: string
  infoColorSuppl?: string
  infoColorDisabled?: string

  successColor?: string
  successColorHover?: string
  successColorPressed?: string
  successColorSuppl?: string
  successColorDisabled?: string

  warningColor?: string
  warningColorHover?: string
  warningColorPressed?: string
  warningColorSuppl?: string
  warningColorDisabled?: string

  errorColor?: string
  errorColorHover?: string
  errorColorPressed?: string
  errorColorSuppl?: string
  errorColorDisabled?: string

  // 布局颜色相关
  baseColor: string // 全局画布背景
  bodyColor: string // 主内容区背景
  adminContentColor: string // 管理后台专用内容背景
  cardColor: string // 卡片
  modalColor: string // 对话框
  tagColor: string // 标签
  popoverColor: string // 弹出层

  // 字体颜色相关
  textColorBase: string // 基础
  textColor1: string // 主要
  textColor2: string // 次要
  textColor3: string // 次次要
  textColorDisabled: string // 文字禁用颜色

  // 输入框相关
  placeholderColor: string
  placeholderColorDisabled: string

  // 图标颜色相关
  iconColor: string
  iconColorHover: string
  iconColorPressed: string
  iconColorDisabled: string

  // 按钮颜色相关
  buttonColor2: string // 按钮
  buttonColor2Hover: string // 选中颜色
  buttonColor2Pressed: string // 按下颜色
  hoverColor: string // 悬浮
  borderColor: string // 边框
  dividerColor: string // 分割线

  // 滚动条颜色
  scrollbarColor: string
  scrollbarColorHover: string
  scrollbarColorPressed: string
  scrollbarColorThumb: string

  // 菜单
  menuColor: string
  menuItemTextColor: string
  menuItemColorHover: string
  menuItemColorActive: string
  menuItemTextColorDisabled: string
  menuItemDividerColor: string
  menuGroupTextColor: string
  menuItemHeight: string

  /* 字体系统 */
  fontSize: string
  fontSizeMini: string
  fontSizeTiny: string
  fontSizeSmall: string
  fontSizeMedium: string
  fontSizeLarge: string
  fontSizeHuge: string

  /* 阴影与效果 */
  // 阴影相关
  boxShadow1: string
  boxShadow2: string
  boxShadow3: string

  // 圆角相关
  borderRadius: string
  borderRadiusSmall: string
}

// Shadcnui 配置
export interface IShadcnuiOptions {
  '--background': string
  '--foreground': string
  '--card': string
  '--card-foreground': string
  '--popover': string
  '--popover-foreground': string
  '--primary': string
  '--primary-foreground': string
  '--secondary': string
  '--secondary-foreground': string
  '--muted': string
  '--muted-foreground': string
  '--accent': string
  '--accent-foreground': string
  '--destructive': string
  '--destructive-foreground': string
  '--border': string
  '--input': string
  '--ring': string
  '--radius': string
}

// 定义配置的类型
export interface IThemeConfig {
  light: IThemeSeries
  dark: IThemeSeries
}

// 主题色调
export interface IThemeSeries {
  naiveui: GlobalThemeOverrides
  custom: IThemeCustomOptions
  shadcn: IShadcnuiOptions
}

// 定义主题项
export interface ITheme {
  id: string
  label: string
  options: IThemeConfig
  showMenu: boolean
}

// 颜色变化
export interface ColorScale {
  base: string
  hover: string
  pressed: string
  suppl: string
  disabled: string
  // contrastText: string
}
