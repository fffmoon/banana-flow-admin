import Dot from './components/Dot.vue'
import Load from './components/Load.vue'

// 定义主题loading风格类型
export type IThemeLoadingStyle = 'dot' | 'load'

// 定义主题loading风格项
export interface IThemeLoadingStyles { label: string, value: IThemeLoadingStyle, component: Component }

// 主题loading风格列表
export const themeLoadingStyles: IThemeLoadingStyles[] = [
  { label: '闪烁的点', value: 'dot', component: Dot },
  { label: '转圈的圆环', value: 'load', component: Load },
]
