/*
 * @Author: Qing
 * @Description: 基于指令的权限控制，用于DOM元素
 * @Date: 2025-03-29 20:29:46
 * @LastEditTime: 2025-04-14 14:48:57
 */

import type { App, Directive, Ref } from 'vue'
import { ref, watchEffect } from 'vue'

type ValueRef = Ref<string>

declare global {
  interface HTMLElement {
    _permissionStopWatcher?: () => void
    _valueRef?: ValueRef
  }
}
export const permissionDirective: Directive<HTMLElement, string> = {

  mounted(el, binding) {
    const userStore = useUserStore()
    const value = binding.value

    if (typeof value !== 'string') {
      console.error('v-perm 指令需要字符串类型的权限码')
      return
    }

    // 创建响应式的权限值引用
    const valueRef = ref(value)
    el._valueRef = valueRef

    // 创建权限检查的响应式监听
    const stopWatcher = watchEffect(() => {
      const hasPermission = userStore.perms.includes(valueRef.value)

      // 保留原始display值用于恢复
      if (!el.style.display) {
        el.dataset.originalDisplay = el.style.display || 'inline-block'
      }

      el.style.display = hasPermission ? el.dataset.originalDisplay! : 'none'
    })

    el._permissionStopWatcher = stopWatcher
  },
  updated(el, binding) {
    const value = binding.value

    if (typeof value !== 'string') {
      console.error('v-permission指令需要字符串类型的权限码')
      return
    }

    // 更新响应式的权限值
    if (el._valueRef) {
      el._valueRef.value = value
    }
  },
  unmounted(el) {
    // 清理副作用
    if (el._permissionStopWatcher) {
      el._permissionStopWatcher()
      delete el._permissionStopWatcher
    }
    if (el._valueRef) {
      delete el._valueRef
    }
  },
}

export function setupPermissionDirective(app: App) {
  app.directive('perm', permissionDirective)
}
