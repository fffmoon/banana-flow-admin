/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-07-15 15:21:14
 * @LastEditTime: 2025-07-21 15:22:05
 */
declare namespace Settings {
  type LayoutMode
    = | 'vertical-mixed' // 侧边栏混合
      | 'classic' // 经典模式 (选中项)
      | 'sidebar' // 侧边栏
      | 'vertical' // 极简侧边栏
      | 'top' // 顶栏
      | 'mixed' // 分栏布局
      | 'top-mixed' // 顶栏混合
  // 侧边栏
  interface app {
    // 是否显示全局偏好设置菜单按钮
    showSettingDrawer: boolean
    // 主题模式
    colorScheme: 'system' | 'light' | 'dark'
    // 开启进度条
    enableProgress: boolean
    // 开启动态标题
    enableDynamicTitle: boolean
    // 页面切换动画类名
    transitionName: 'fade-slide' | 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'flip'
    // 网络请求的风格
    networkRequestLoadingStyle: 'dot' | 'load'
  }
  // 菜单
  interface menu {
    mode: LayoutMode
    // 侧边栏主要菜单宽度
    mainMenuWidth: number
    // 侧边栏次要菜单宽度
    subMenuWidth: number
    // 侧边栏折叠宽度
    collapsedWidth: number
  }
  // 标签页
  interface tabbar {
    // 是否开启标签栏
    enable: boolean
    // 开启标签栏图标显示
    enableIcon: boolean
  }
  // 工具栏
  interface toolbar {
    // 开启面包屑导航
    breadcrumb: boolean
    // 开启导航搜索
    navSearch: boolean
  }
  // 水印
  interface watermark {
    // 是否开启水印
    show: boolean
    // 默认水印内容
    content: string
    // 开启时间戳
    timestamp: boolean
    // 水印字体大小
    fontSize: number
    // 水印字体颜色
    textColor: string
    // 自定义水印内容
    customContent: boolean
  }

  interface PartialApp extends Partial<app> { }
  interface PartialMenu extends Partial<menu> { }
  interface PartialTabbar extends Partial<tabbar> { }
  interface PartialToolbar extends Partial<toolbar> { }
  interface PartialWatermark extends Partial<watermark> { }

  interface All {
    app?: PartialApp
    watermark?: PartialWatermark
    menu?: PartialMenu
    tabbar?: PartialTabbar
    toolbar?: PartialToolbar
  }

  interface RequiredApp extends Required<app> { }
  interface RequiredMenu extends Required<menu> { }
  interface RequiredTabbar extends Required<tabbar> { }
  interface RequiredToolbar extends Required<toolbar> { }
  interface RequiredWatermark extends Required<watermark> { }

  interface RequiredAll {
    app: RequiredApp
    watermark: RequiredWatermark
    menu: RequiredMenu
    tabbar: RequiredTabbar
    toolbar: RequiredToolbar
  }
}
