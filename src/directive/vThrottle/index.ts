/*
 * @Author: Qing
 * @Description: 基于指令的节流防抖模式，与js分离，方便复用
 * @Example: 见 vDebounce
 * @Date: 2025-01-22 17:31:39
 * @LastEditTime: 2025-04-10 19:19:37
 */

import type { App, Directive, DirectiveBinding } from 'vue'

// 类型
interface ThrottleHTMLElement extends HTMLElement {
  // 清理引用
  _throttled?: (e: Event) => void
}

type Func = (...args: any[]) => void

type ThrottleBindingValue = {
  handler: Func
  wait?: number
} | (Func)

// 实现
const throttleDirective: Directive = {
  mounted(el: ThrottleHTMLElement, binding: DirectiveBinding<ThrottleBindingValue>) {
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

    const throttled = throttle(handler, wait)
    el._throttled = throttled // 保存引用用于卸载时移除

    el.addEventListener(event, throttled)
  },
  unmounted(el: ThrottleHTMLElement, binding: DirectiveBinding<ThrottleBindingValue>) {
    const event = binding.arg || 'click'
    if (el._throttled) {
      el.removeEventListener(event, el._throttled)
    }
  },
}

// 方法
function throttle(fn: Func, wait: number) {
  let lastTime: number = 0
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: any[]) => {
    const now = Date.now()
    const remaining = wait - (now - lastTime)

    if (remaining <= 0) {
      timeout && clearTimeout(timeout)
      lastTime = now
      fn(...args)
    }
    else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now()
        timeout = null
        fn(...args)
      }, remaining)
    }
  }
}

// 安装
export function setupThrottleDirective(app: App) {
  app.directive('throttle', throttleDirective)
}
