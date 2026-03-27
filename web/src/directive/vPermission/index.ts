/*
 * @Author: Qing
 * @Description: 基于指令的权限控制
 * @Date: 2025-03-29 20:29:46
 * @LastEditTime: 2025-07-21 15:00:00
 */

import type { App, Directive, Ref } from 'vue'
import { ref, watchEffect } from 'vue'
import { useUserStore } from '@/store/modules/user' // 确保路径正确

// 定义绑定值的类型：字符串 或 字符串数组
type PermissionValue = string | string[]
type ValueRef = Ref<PermissionValue>

// 扩展 HTMLElement 类型以便存储副作用
declare global {
  interface HTMLElement {
    _permissionStopWatcher?: () => void
    _valueRef?: ValueRef
  }
}

/**
 * 核心检查逻辑
 * @param value 绑定的权限值
 * @param perms 当前用户拥有的权限列表
 */
function checkPermission(value: PermissionValue, perms: string[]): boolean {
  // 如果绑定值为空，直接显示
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return true
  }

  // 超级管理员逻辑，后续考虑扩展
  // if (perms.includes('*') || perms.includes('*:*:*')) return true

  // 处理数组情况
  if (Array.isArray(value)) {
    return value.some(item => perms.includes(item))
  }

  // 处理字符串情况
  return perms.includes(value)
}

export const permissionDirective: Directive<HTMLElement, PermissionValue> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const value = binding.value

    // 初始化响应式引用，用于在 updated 中更新值
    const valueRef = ref<PermissionValue>(value)
    el._valueRef = valueRef

    // 记录原始 display 属性，以便恢复
    const originalDisplay = el.style.display

    // 使用 watchEffect 自动追踪依赖 (userStore.perms 和 valueRef)
    const stopWatcher = watchEffect(() => {
      // 获取当前最新的权限列表
      const currentPerms = userStore.perms
      // 获取当前绑定的值
      const currentValue = valueRef.value

      const hasAuth = checkPermission(currentValue, currentPerms)

      if (hasAuth) {
        // 恢复显示 (如果原始是 'none'，这里可能需要设为 '' 或 'block'，视具体情况而定)
        el.style.display = originalDisplay === 'none' ? '' : originalDisplay
      }
      else {
        // 隐藏元素
        el.style.display = 'none'
      }
    })

    // 保存停止监听的函数
    el._permissionStopWatcher = stopWatcher
  },

  updated(el, binding) {
    // 当组件更新导致指令绑定的值变化时，更新 ref 的值
    // watchEffect 会自动捕获到 valueRef 的变化并重新执行检查逻辑
    if (el._valueRef && binding.value !== binding.oldValue) {
      el._valueRef.value = binding.value
    }
  },

  unmounted(el) {
    // 清理副作用，防止内存泄漏
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
