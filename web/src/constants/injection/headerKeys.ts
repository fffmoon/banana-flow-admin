import type { InjectionKey } from 'vue'
import type { useMenuData } from '@/layout/AdminLayout/js/useMenuData'

export interface IThemeSettingKey {
  openThemeSetting: () => void
}

export const ThemeSettingKey: InjectionKey<IThemeSettingKey> = Symbol('ThemeSettingKey')

export const MenuKey: InjectionKey<ReturnType<typeof useMenuData>> = Symbol('MenuKey')
