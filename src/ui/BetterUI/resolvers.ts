import type { ComponentResolver } from 'unplugin-vue-components'

const components = ['BDropdown', 'BContentMenu', 'BImagePreview', 'BMenu', 'BPopover', 'BScrollbar', 'BSpace', 'BMessageProvider']

// 自定义解析器
export const resolvers: ComponentResolver = (name: string) => {
  if (components.includes(name)) {
    return {
      name,
      from: `@ui/BetterUI`,
    }
  }
}
