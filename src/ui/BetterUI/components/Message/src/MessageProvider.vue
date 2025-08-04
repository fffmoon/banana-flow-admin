<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-19 12:58:08
 * @LastEditTime: 2025-05-23 14:19:57
-->
<script setup lang="ts">
import type { IMessage, IMessageInstance, IMessageKey, IMessageMethodOptions, IMessageProviderProps, IMessageType } from './types'
import { provide } from 'vue'
import { DEFAULT_CLOSEABLE, DEFAULT_DURATION, DEFAULT_MAX_MESSAGES, DEFAULT_PLACEMENT, MSG_DATA } from './constants'
import MessageList from './MessageList.vue'
import { MessageKey } from './types'

defineOptions({
  displayName: 'MessageProvider',
})

const props = withDefaults(defineProps<IMessageProviderProps>(), {
  placement: DEFAULT_PLACEMENT,
})

// 消息列表
const messages = reactive(new Map<string, IMessage>())
// 消息的层级，当用户同时使用了注入和脱离上下文的方式，层级可以用来展示最新的消息。
const zIndex = ref(1)

// 移除消息
function remove(id) {
  const msg = messages.get(id)
  if (msg && msg.instance) {
    messages.delete(id)
  }
}
// 全局控制暂停
function pauseAll() {
  messages.forEach((m) => {
    if (m && m.instance) {
      m.instance.pause()
      m.instance.manualPaused = true // 标记手动暂停
    }
  })
}
// 全局控制恢复
function resumeAll() {
  messages.forEach((m) => {
    if (m && m.instance) {
      if (m.instance.manualPaused) {
        m.instance.resume()
        m.instance.manualPaused = false
      }
    }
  })
}

/**
 * 创建消息方法
 * @param type 消息类型
 * @returns 消息方法
 */
function createMethod(type: IMessageType) {
  return (content: string, options: IMessageMethodOptions = {}): IMessageInstance => {
    MSG_DATA.zIndex = MSG_DATA.zIndex + 1
    zIndex.value = MSG_DATA.zIndex

    const defaultOptions = {
      duration: DEFAULT_DURATION,
      closable: DEFAULT_CLOSEABLE,
      placement: 'top',
    }
    const mergedOptions = { ...defaultOptions, ...options }

    let timeoutId: NodeJS.Timeout | null = null
    let startTime: number
    let remaining = mergedOptions.duration

    const id = generatedId()

    const instance: IMessageInstance = {
      destroy: () => {
        remove(id)
        timeoutId && clearTimeout(timeoutId)
      },
      pause: () => {
        if (timeoutId) {
          remaining -= Date.now() - startTime
          clearTimeout(timeoutId)
          timeoutId = null
        }
      },
      resume: () => {
        if (remaining > 0 && !timeoutId) {
          startTime = Date.now()
          timeoutId = setTimeout(() => {
            instance.destroy()
            timeoutId = null
          }, remaining)
        }
      },
      manualPaused: false,
    }

    messages.set(id, {
      id,
      type,
      content,
      duration: mergedOptions.duration,
      icon: mergedOptions.icon,
      closable: mergedOptions.closable,
      instance,
      addTime: Date.now(),
    })

    if (mergedOptions.duration && mergedOptions.duration > 0) {
      startTime = Date.now()
      timeoutId = setTimeout(instance.destroy, mergedOptions.duration)
    }

    return instance
  }
}
// 提供方法给子组件
const context: IMessageKey = {
  success: createMethod('success'),
  error: createMethod('error'),
  warning: createMethod('warning'),
  info: createMethod('info'),
  loading: createMethod('loading'),
}

provide(MessageKey, context)
</script>

<template>
  <slot />
  <MessageList
    :z-index="zIndex" :messages="messages" :max-messages="DEFAULT_MAX_MESSAGES" :placement="props.placement"
    @remove="remove" @pause-all="pauseAll" @resume-all="resumeAll"
  />
</template>
