/*
 * @Author: Qing
 * @Description: 智能的复制指令，当只有v-copy的时候，会自动寻找标签中的内容。
 * @Example: <div v-copy="{ value: '复制内容' }"></div>
 * @Date: 2025-04-15 14:59:41
 * @LastEditTime: 2025-04-15 15:04:07
 * @NextSteps：
 * - 双击输入框进行复制，并且全选内容
 */
import type { App, Directive } from 'vue'
import type { CopyDirectiveBinding } from './type'
import { copyHandler } from './utils'

interface CopyHTMLElement extends HTMLElement {
  // 清理引用
  _copyHandler?: (e: Event) => void
}
// 实现
const CopyDirective: Directive = {
  mounted(el: CopyHTMLElement, binding: CopyDirectiveBinding) {
    el.style.cursor = 'copy'
    el._copyHandler = (e: Event) => copyHandler(binding, e as MouseEvent)
    el.addEventListener('click', el._copyHandler)
  },
  updated(el: CopyHTMLElement, binding: CopyDirectiveBinding) {
    // 先移除旧监听
    if (el._copyHandler) {
      el.removeEventListener('click', el._copyHandler)
    }
    // 更新回调并重新绑定
    el._copyHandler = (e: Event) => copyHandler(binding, e as MouseEvent)
    el.addEventListener('click', el._copyHandler)
  },
  beforeUnmount(el: CopyHTMLElement) {
    // 安全移除
    if (el._copyHandler) {
      el.removeEventListener('click', el._copyHandler)
      delete el._copyHandler
    }
  },
}

// 注册
export function setupCopyDirective(app: App) {
  app.directive('copy', CopyDirective)
}
