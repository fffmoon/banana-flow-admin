/*
 * @Author: Qing
 * @Description: 基于指令的节流防抖模式，与js分离，方便复用
 * @Example:
 * - 使用方式1：<button v-debounce:click="{ handler: handleClick, wait: delay }"></button>
 * - 使用方式2：<button v-debounce:click="() => handleClick(param)"></button>
 * - 使用方式3：<button v-throttle="{ arg: 'click', value: { handler: handleClick, wait: 2000 } }"></button>
 * @Date: 2025-01-22 17:31:39
 * @LastEditTime: 2025-04-16 10:10:32
 */

import type { App, Directive, DirectiveBinding } from 'vue'

// 类型
interface DebounceHTMLElement extends HTMLElement {
  // 清理引用
  _debounced?: (e: Event) => void
}

type Func = (...args: any[]) => void

type DebounceBindingValue = {
  handler: Func
  wait?: number
} | (Func)

// 实现
const debounceDirective: Directive = {
  mounted(el: DebounceHTMLElement, binding: DirectiveBinding<DebounceBindingValue>) {
    const event = binding.arg || 'click'
    let handler: Func
    let wait = 500

    if (typeof binding.value === 'function') {
      handler = binding.value
    }
    else {
      handler = binding.value.handler
      wait = binding.value.wait || wait
    }

    const debounced = debounce(handler, wait)
    el._debounced = debounced // 保存引用用于卸载时移除

    el.addEventListener(event, debounced)
  },
  unmounted(el: DebounceHTMLElement, binding: DirectiveBinding<DebounceBindingValue>) {
    const event = binding.arg || 'click'
    if (el._debounced) {
      el.removeEventListener(event, el._debounced)
    }
  },
}

// 方法
function debounce(fn: Func, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: any[]) => {
    timeout && clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), wait)
  }
}

// 安装
export function setupDebounceDirective(app: App) {
  app.directive('debounce', debounceDirective)
}
