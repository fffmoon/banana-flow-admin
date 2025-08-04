import type { VNodeChild } from 'vue'
// 渲染标签内容 - 支持所有类型
export function renderLabelContent(label?: string | (() => VNodeChild)): VNodeChild {
  if (!label)
    return ''
  return typeof label === 'string' ? label : label()
}
