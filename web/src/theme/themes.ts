/*
 * @Author: Qing
 * @Description: 默认主题
 * @Date: 2025-01-26 21:22:26
 * @LastEditTime: 2025-07-31 15:14:19
 */
import type { ITheme, IThemeConfig } from './type'

export const themeDefault: IThemeConfig = {
  light: {
    // 兼容 naiveui 使用方法：var(--common-primary-color)
    naiveui: {
      common: {
        // primaryColor: '#2d8cf0',
        // primaryColorHover: '#3c9bff',
        // primaryColorPressed: '#3c9bff',
        // primaryColorSuppl: '#2d8cf0',
      },
    },
    // 自定义样式 var(--custom-)
    custom: {

      primaryColor: '#2d8cf0',
      infoColor: '#2080f0',
      successColor: '#18a058',
      warningColor: '#f0a020',
      errorColor: '#d03050',

      fontSize: '14px',
      fontSizeMini: '12px',
      fontSizeTiny: '12px',
      fontSizeSmall: '14px',
      fontSizeMedium: '14px',
      fontSizeLarge: '15px',
      fontSizeHuge: '16px',

      borderRadius: '3px',
      borderRadiusSmall: '2px',

      textColorBase: '#000',
      textColor1: 'rgb(31, 34, 37)',
      textColor2: 'rgb(51, 54, 57)',
      textColor3: 'rgb(118, 124, 130)',
      textColorDisabled: 'rgba(194, 194, 194, 1)',

      iconColor: 'rgba(194, 194, 194, 1)',
      iconColorHover: 'rgba(146, 146, 146, 1)',
      iconColorPressed: 'rgba(175, 175, 175, 1)',
      iconColorDisabled: 'rgba(209, 209, 209, 1)',

      baseColor: '#ffffff',
      bodyColor: '#ffffff',
      adminContentColor: '#f5f7f9',
      cardColor: '#ffffff',
      modalColor: '#ffffff',
      tagColor: '#eeeeee',
      popoverColor: '#ffffff',

      hoverColor: 'rgb(243, 243, 245)',
      borderColor: 'rgb(224, 224, 230)',
      buttonColor2: 'rgba(2, 3, 3, 0.05)',
      buttonColor2Hover: 'rgba(46, 51, 56, .09)',
      buttonColor2Pressed: 'rgba(46, 51, 56, .13)',
      dividerColor: 'rgb(239,239,245)',

      scrollbarColor: 'rgba(195, 199, 207, 1)',
      scrollbarColorHover: 'rgba(179, 184, 194, 1)',
      scrollbarColorPressed: 'rgba(163, 169, 181, 1)',
      scrollbarColorThumb: 'transparent',

      menuColor: '#ffffff',
      menuItemTextColor: '#1f1f1f',
      menuItemColorHover: 'rgb(51 150 255 / 10 %)',
      menuItemColorActive: 'rgb(51 150 255 / 20 %)',
      menuItemTextColorDisabled: 'rgb(77 77 77 / 45 %)',
      menuItemDividerColor: 'rgb(0 0 0 / 10 %)',
      menuGroupTextColor: 'rgb(0 0 0 / 45 %)',
      menuItemHeight: '42px',

      placeholderColor: 'rgba(194, 194, 194, 1)',
      placeholderColorDisabled: 'rgba(209, 209, 209, 1)',

      boxShadow1:
        '0 1px 2px -2px rgba(0, 0, 0, .08), 0 3px 6px 0 rgba(0, 0, 0, .06), 0 5px 12px 4px rgba(0, 0, 0, .04)',
      boxShadow2:
        '0 3px 6px -4px rgba(0, 0, 0, .12), 0 6px 16px 0 rgba(0, 0, 0, .08), 0 9px 28px 8px rgba(0, 0, 0, .05)',
      boxShadow3:
        '0 6px 16px -9px rgba(0, 0, 0, .08), 0 9px 28px 0 rgba(0, 0, 0, .05), 0 12px 48px 16px rgba(0, 0, 0, .03)',

    },
  },
  dark: {
    naiveui: {
      common: {
        // primaryColor: '#2d8cf0',
        // primaryColorHover: '#3c9bff',
        // primaryColorPressed: '#3c9bff',
        // primaryColorSuppl: '#2d8cf0',
      },
    },
    custom: {
      primaryColor: '#2d8cf0',
      infoColor: '#70c0e8',
      successColor: '#63e2b7',
      warningColor: '#f2c97d',
      errorColor: '#e88080',

      // 字体
      fontSize: '14px',
      fontSizeMini: '12px',
      fontSizeTiny: '12px',
      fontSizeSmall: '14px',
      fontSizeMedium: '14px',
      fontSizeLarge: '15px',
      fontSizeHuge: '16px',

      borderRadius: '3px',
      borderRadiusSmall: '2px',

      textColorBase: '#fff',
      textColor1: 'rgba(255, 255, 255, 0.9)',
      textColor2: 'rgba(255, 255, 255, 0.82)',
      textColor3: 'rgba(255, 255, 255, 0.52)',
      textColorDisabled: 'rgba(255, 255, 255, 0.38)',

      iconColor: 'rgba(255, 255, 255, 0.38)',
      iconColorDisabled: 'rgba(255, 255, 255, 0.28)',
      iconColorHover: 'rgba(255, 255, 255, 0.475)',
      iconColorPressed: 'rgba(255, 255, 255, 0.35)',

      baseColor: '#000000',
      bodyColor: 'rgb(16, 16, 20)',
      adminContentColor: '#101014',
      cardColor: 'rgb(24, 24, 28)',
      modalColor: 'rgb(44, 44, 50)',
      tagColor: 'rgba(51, 51, 51, 1)',
      popoverColor: 'rgb(72, 72, 78)',

      hoverColor: 'rgba(255, 255, 255, 0.09)',
      borderColor: 'rgba(255, 255, 255, 0.24)',
      buttonColor2: 'rgba(255, 255, 255, .08)',
      buttonColor2Hover: 'rgba(255, 255, 255, .12)',
      buttonColor2Pressed: 'rgba(255, 255, 255, .08)',
      dividerColor: 'rgba(255, 255, 255, 0.09)',

      scrollbarColor: 'rgba(137, 142, 149, 1)',
      scrollbarColorHover: 'rgba(153, 158, 165, 1)',
      scrollbarColorPressed: 'rgba(169, 173, 179, 1)',
      scrollbarColorThumb: 'transparent',

      menuColor: '#17171c',
      menuItemTextColor: 'rgb(255 255 255 / 90%)',
      menuItemColorHover: 'rgb(64 158 255 / 12%)',
      menuItemColorActive: 'rgb(64 158 255 / 30%)',
      menuItemTextColorDisabled: 'rgb(255 255 255 / 30%)',
      menuItemDividerColor: 'rgb(255 255 255 / 10%)',
      menuGroupTextColor: 'rgb(255 255 255 / 45%)',
      menuItemHeight: '42px',

      placeholderColor: 'rgba(255, 255, 255, 0.38)',
      placeholderColorDisabled: 'rgba(255, 255, 255, 0.28)',

      boxShadow1:
        '0 1px 2px -2px rgba(0, 0, 0, .24), 0 3px 6px 0 rgba(0, 0, 0, .18), 0 5px 12px 4px rgba(0, 0, 0, .12)',
      boxShadow2:
        '0 3px 6px -4px rgba(0, 0, 0, .24), 0 6px 12px 0 rgba(0, 0, 0, .16), 0 9px 18px 8px rgba(0, 0, 0, .10)',
      boxShadow3:
        '0 6px 16px -9px rgba(0, 0, 0, .08), 0 9px 28px 0 rgba(0, 0, 0, .05), 0 12px 48px 16px rgba(0, 0, 0, .03)',

    },
  },
}

export const themeFF3D68: IThemeConfig = {
  light: {
    naiveui: {
      common: {
      },
    },
    custom: {
      ...themeDefault.light.custom,
      ...{
        primaryColor: '#FF3D68',
      },
    },
  },
  dark: {
    naiveui: {
      common: {
      },
    },
    custom: {
      ...themeDefault.dark.custom,
      ...{
        primaryColor: '#FF3D68',
      },
    },
  },
}

export const themef97316: IThemeConfig = {
  light: {
    naiveui: {
      common: {
      },
    },
    custom: {
      ...themeDefault.light.custom,
      ...{
        primaryColor: '#f97316',
      },
    },
  },
  dark: {
    naiveui: {
      common: {
      },
    },
    custom: {
      ...themeDefault.dark.custom,
      ...{
        primaryColor: '#f97316',
      },
    },
  },
}

export const theme16a34a: IThemeConfig = {
  light: {
    naiveui: {
      common: {
      },
    },
    custom: {
      ...themeDefault.light.custom,
      ...{
        primaryColor: '#16a34a',
      },
    },
  },
  dark: {
    naiveui: {
      common: {
      },
    },
    custom: {
      ...themeDefault.dark.custom,
      ...{
        primaryColor: '#16a34a',
      },
    },
  },
}

export const themeCustom: IThemeConfig = JSON.parse(JSON.stringify(themeDefault)) as IThemeConfig

// 主题列表
export const themes: ITheme[] = [
  { id: 'themeDefault', label: '默认主题', options: themeDefault, showMenu: true },
  { id: 'themeCustom', label: '自定义主题', options: themeCustom, showMenu: false },
  { id: 'themeFF3D68', label: '粉色主题', options: themeFF3D68, showMenu: true },
  { id: 'themef97316', label: '橘色主题', options: themef97316, showMenu: true },
  { id: 'theme16a34a', label: '绿色主题', options: theme16a34a, showMenu: true },
]

// 切换主题的列表
export const themeDoms = [
  { id: 0, label: '亮色', icon: 'i-mdi-brightness-5', value: 'light' },
  { id: 1, label: '黑暗', icon: 'i-mdi-brightness-4', value: 'dark' },
  { id: 2, label: '系统', icon: 'i-mdi-brightness-auto', value: 'system' },
]
