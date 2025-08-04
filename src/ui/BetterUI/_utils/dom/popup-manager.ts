export type TriggerType = 'hover' | 'click' | 'focus' | 'manual'

/**
 * 来自naiveui的灵感，优雅解决 弹窗外层关闭问题，是我实践中的最优解。
 */

interface PopupInstance {
  id: string
  triggerType: TriggerType
  close: () => void
}

export class PopupManager {
  private static instances: Map<string, PopupInstance> = new Map()
  private static eventAttached = false

  /**
   * 注册弹出层实例
   */
  static register(instance: PopupInstance) {
    this.instances.set(instance.id, instance)
    this.attachGlobalEvents()
  }

  /**
   * 注销弹出层实例
   */
  static unregister(id: string) {
    this.instances.delete(id)
    if (this.instances.size === 0) {
      this.detachGlobalEvents()
    }
  }

  /**
   * 全局事件绑定
   */
  private static attachGlobalEvents() {
    if (this.eventAttached)
      return

    // 点击事件
    document.addEventListener('click', this.handleGlobalClick, true)
    // 右键事件
    document.addEventListener('mousedown', this.handleGlobalMousedown, true)
    // ESC键
    document.addEventListener('keydown', this.handleGlobalKeydown)

    this.eventAttached = true
  }

  /**
   * 解绑全局事件
   */
  private static detachGlobalEvents() {
    document.removeEventListener('click', this.handleGlobalClick, true)
    document.addEventListener('mousedown', this.handleGlobalMousedown, true)
    document.removeEventListener('keydown', this.handleGlobalKeydown)
    this.eventAttached = false
  }

  /**
   * 全局点击处理
   */
  private static handleGlobalClick = (e: MouseEvent) => {
    for (const instance of this.instances.values()) {
      // 1. 检查是否点击在触发元素上 (click 触发模式保留)
      const triggerDom = document.querySelector(`[data-popup-trigger="${instance.id}"]`)
      const contentDom = document.querySelector(`[data-popup-content="${instance.id}"]`)
      if (triggerDom?.contains(e.target as Node)) {
        if (instance.triggerType === 'click')
          continue
        instance.close()
        continue
      }

      // 2. 检查是否点击在弹出内容上
      if (contentDom?.contains(e.target as Node)) {
        continue
      }

      // 3. 检查点击元素是否在嵌套弹出框中
      if ((e.target as Element).closest('[data-popup]')) {
        continue
      }

      // 4. 触发外部点击 - 关闭该弹出框
      instance.close()
    }
  }

  /**
   * 全局右键处理
   */
  private static handleGlobalMousedown = (e: MouseEvent) => {
    for (const instance of this.instances.values()) {
      const triggerDom = document.querySelector(`[data-popup-trigger="${instance.id}"]`)
      const contentDom = document.querySelector(`[data-popup-content="${instance.id}"]`)

      // 检查是否点击在触发元素上
      if (triggerDom?.contains(e.target as Node)) {
        // 右键菜单需要特殊处理 - 只在非手动触发模式时关闭
        if (e.button === 2 && instance.triggerType !== 'manual') {
          instance.close()
        }
        // 对非右键点击保持原有逻辑
        else if (instance.triggerType === 'click') {
          continue
        }
        else {
          instance.close()
        }
        continue
      }

      // 检查是否点击在弹出内容上
      if (contentDom?.contains(e.target as Node)) {
        continue
      }

      // 检查点击元素是否在嵌套弹出框中
      if ((e.target as Element).closest('[data-popup]')) {
        continue
      }

      // 触发外部点击 - 关闭该弹出框
      instance.close()
    }
  }

  /**
   * 全局按键处理
   */
  private static handleGlobalKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      for (const instance of this.instances.values()) {
        instance.close()
      }
    }
  }
}
