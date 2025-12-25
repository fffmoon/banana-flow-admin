/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-31 18:49:58
 * @LastEditTime: 2025-07-21 14:10:21
 */
import { defu } from 'defu'
import DEFAULT_SETTINGS from './settings.default'

const SETTINGS: Settings.All = {
  app: {
    showSettingDrawer: true,
    transitionName: 'fade-slide',
  },

  menu: {
    mainMenuWidth: 90,
    subMenuWidth: 180,
    collapsedWidth: 64,
  },

  watermark: {
    show: false,
    content: '这是默认水印',
    timestamp: false,
    fontSize: 16,
    fontColor: 'rgba(0,0,0,0.15)',
    customContent: false,
  },
}

export default defu(SETTINGS, DEFAULT_SETTINGS)
