/*
 * @Author: Qing
 * @Description: 系统设置类型定义
 * @namespace Settings
 * @Date: 2025-07-15 15:21:14
 * @LastEditTime: 2025-07-21 15:22:05
 */
declare namespace Settings {
  /**
   * 布局模式
   * 'vertical-mixed' 侧边栏混合
   * 'classic' 经典模式 (选中项)
   * 'sidebar' 侧边栏
   * 'vertical' 极简侧边栏
   * 'top' 顶栏
   * 'mixed' 分栏布局
   * 'top-mixed' 顶栏混合
   */
  type LayoutMode = 'vertical-mixed' | 'classic' | 'sidebar' | 'vertical' | 'top' | 'mixed' | 'top-mixed'

  /**
   * 应用设置
   */
  interface app {
    /** 是否显示全局偏好设置菜单按钮 */
    showSettingDrawer: boolean
    /** 主题模式 */
    colorScheme: 'system' | 'light' | 'dark'
    /** 开启进度条 */
    enableProgress: boolean
    /** 开启动态标题 */
    enableDynamicTitle: boolean
    /** 页面切换动画类名 */
    transitionName: 'fade-slide' | 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'flip'
    /** 网络请求的风格 */
    networkRequestLoadingStyle: 'dot' | 'load'
  }

  /**
   * 菜单设置
   */
  interface menu {
    /** 布局模式 */
    mode: LayoutMode
    /** 侧边栏主要菜单宽度 */
    mainMenuWidth: number
    /** 侧边栏次要菜单宽度 */
    subMenuWidth: number
    /** 侧边栏折叠宽度 */
    collapsedWidth: number
  }

  /**
   * 标签页设置
   */
  interface tabbar {
    /** 是否开启标签栏 */
    enable: boolean
    /** 开启标签栏图标显示 */
    enableIcon: boolean
  }

  /**
   * 工具栏设置
   */
  interface toolbar {
    /** 开启面包屑导航 */
    breadcrumb: boolean
    /** 开启导航搜索 */
    navSearch: boolean
  }

  /**
   * 水印设置
   */
  interface watermark {
    /** 是否开启水印 */
    show: boolean
    /** 默认水印内容 */
    content: string
    /** 开启时间戳 */
    timestamp: boolean
    /** 水印字体大小 */
    fontSize: number
    /** 水印字体颜色 */
    fontColor: string
    /** 自定义水印内容 */
    customContent: boolean
  }

  /**
   * 部分应用设置（可选）
   */
  interface PartialApp extends Partial<app> { }

  /**
   * 部分菜单设置（可选）
   */
  interface PartialMenu extends Partial<menu> { }

  /**
   * 部分标签页设置（可选）
   */
  interface PartialTabbar extends Partial<tabbar> { }

  /**
   * 部分工具栏设置（可选）
   */
  interface PartialToolbar extends Partial<toolbar> { }

  /**
   * 部分水印设置（可选）
   */
  interface PartialWatermark extends Partial<watermark> { }

  /**
   * 所有设置（可选）
   */
  interface All {
    /** 应用设置 */
    app?: PartialApp
    /** 水印设置 */
    watermark?: PartialWatermark
    /** 菜单设置 */
    menu?: PartialMenu
    /** 标签页设置 */
    tabbar?: PartialTabbar
    /** 工具栏设置 */
    toolbar?: PartialToolbar
  }

  /**
   * 完整的应用设置（必填）
   */
  interface RequiredApp extends Required<app> { }

  /**
   * 完整的菜单设置（必填）
   */
  interface RequiredMenu extends Required<menu> { }

  /**
   * 完整的标签页设置（必填）
   */
  interface RequiredTabbar extends Required<tabbar> { }

  /**
   * 完整的工具栏设置（必填）
   */
  interface RequiredToolbar extends Required<toolbar> { }

  /**
   * 完整的水印设置（必填）
   */
  interface RequiredWatermark extends Required<watermark> { }

  /**
   * 所有设置的完整版本（必填）
   */
  interface RequiredAll {
    /** 应用设置 */
    app: RequiredApp
    /** 水印设置 */
    watermark: RequiredWatermark
    /** 菜单设置 */
    menu: RequiredMenu
    /** 标签页设置 */
    tabbar: RequiredTabbar
    /** 工具栏设置 */
    toolbar: RequiredToolbar
  }
}
