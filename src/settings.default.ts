/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-31 18:49:58
 * @LastEditTime: 2025-07-21 13:21:06
 */
const SETTINGS: Settings.RequiredAll = {
  app: {
    showSettingDrawer: true,
    transitionName: 'fade-slide',
    colorScheme: 'light',
    enableProgress: true,
    enableDynamicTitle: true,
    networkRequestLoadingStyle: 'dot',
  },

  menu: {
    mainMenuWidth: 90,
    subMenuWidth: 180,
    collapsedWidth: 64,
    mode: 'vertical-mixed',
  },

  tabbar: {
    enable: true,
    enableIcon: true,
  },

  toolbar: {
    breadcrumb: true,
    navSearch: true,
  },

  watermark: {
    show: false,
    content: '默认水印',
    timestamp: false,
    fontSize: 16,
    fontColor: 'rgba(0,0,0,0.15)',
    customContent: false,
  },
}

export default SETTINGS
