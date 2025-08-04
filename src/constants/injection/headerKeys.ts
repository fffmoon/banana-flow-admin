import type { InjectionKey } from 'vue'

export interface IThemeSettingKey {
  openThemeSetting: () => void
}

export const ThemeSettingKey: InjectionKey<IThemeSettingKey> = Symbol('ThemeSettingKey')
