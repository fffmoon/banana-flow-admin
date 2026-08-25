<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-19 12:58:08
-->
<script setup lang="ts">
import type { IMessage, IMessageReactive, IMessageKey, IMessageMethodOptions, IMessageProviderProps, IMessageType } from './types'
import { provide, reactive, ref } from 'vue'
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
// 消息的层级
const zIndex = ref(1)

// 简单的 ID 生成器
let seed = 0
function generatedId() {
  return `msg_${Date.now()}_${seed++}`
}

// 移除消息
function remove(id: string) {
  messages.delete(id)
}

// 全局控制暂停
function pauseAll() {
  messages.forEach((m) => {
    m.pause()
    m.manualPaused = true // 标记手动暂停
  })
}

// 全局控制恢复
function resumeAll() {
  messages.forEach((m) => {
    if (m.manualPaused) {
      m.resume()
      m.manualPaused = false
    }
  })
}

/**
 * 核心创建消息方法，返回响应式对象
 */
function create(content: string, options: IMessageMethodOptions & { type?: IMessageType } = {}): IMessageReactive {
  MSG_DATA.zIndex = MSG_DATA.zIndex + 1
  zIndex.value = MSG_DATA.zIndex

  const defaultOptions = {
    duration: DEFAULT_DURATION,
    closable: DEFAULT_CLOSEABLE,
    placement: 'top',
    type: 'info' as IMessageType
  }
  const mergedOptions = { ...defaultOptions, ...options }

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let startTime: number
  let remaining = mergedOptions.duration

  const id = generatedId()

  // 1. 创建响应式对象，这样外部修改 content 或 type 时，视图会自动更新
  const msgReactive = reactive<IMessageReactive>({
    id,
    type: mergedOptions.type,
    content,
    duration: mergedOptions.duration,
    icon: mergedOptions.icon,
    closable: mergedOptions.closable,
    addTime: Date.now(),
    manualPaused: false,
    destroy: () => {
      remove(id)
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
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
          msgReactive.destroy()
        }, remaining)
      }
    }
  })

  // 2. 存入 Map
  messages.set(id, msgReactive)

  // 3. 启动定时器
  if (mergedOptions.duration && mergedOptions.duration > 0) {
    startTime = Date.now()
    timeoutId = setTimeout(msgReactive.destroy, mergedOptions.duration)
  }

  // 4. 返回响应式实例给外部使用
  return msgReactive
}

/**
 * 快捷创建方法包装器
 */
function createMethod(type: IMessageType) {
  return (content: string, options: IMessageMethodOptions = {}): IMessageReactive => {
    return create(content, { ...options, type })
  }
}

// 提供方法给子组件
const context: IMessageKey = {
  create,
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
  <MessageList :z-index="zIndex" :messages="messages" :max-messages="DEFAULT_MAX_MESSAGES" :placement="props.placement"
    @remove="remove" @pause-all="pauseAll" @resume-all="resumeAll" />
</template>