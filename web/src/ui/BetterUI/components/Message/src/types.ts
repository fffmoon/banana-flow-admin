/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-19 16:22:22
 */
import type { InjectionKey } from 'vue'

// 消息的类型
export type IMessageType = 'success' | 'error' | 'warning' | 'info' | 'loading'

// 将实例方法和数据合并到响应式对象类型中，类似 Naive UI 的 MessageReactive
export interface IMessageReactive {
  id: string
  type: IMessageType
  content: string
  duration?: number
  icon?: string
  closable?: boolean
  addTime: number
  // 实例方法
  destroy: () => void
  pause: () => void
  resume: () => void
  manualPaused?: boolean
}

// 兼容原有的 IMessage 类型名称
export type IMessage = IMessageReactive

// 消息的上下文
export interface IMessageKey {
  create: (content: string, options?: IMessageMethodOptions & { type?: IMessageType }) => IMessageReactive
  success: (content: string, options?: IMessageMethodOptions) => IMessageReactive
  error: (content: string, options?: IMessageMethodOptions) => IMessageReactive
  warning: (content: string, options?: IMessageMethodOptions) => IMessageReactive
  info: (content: string, options?: IMessageMethodOptions) => IMessageReactive
  loading: (content: string, options?: IMessageMethodOptions) => IMessageReactive
}

// 消息的注入
export const MessageKey: InjectionKey<IMessageKey> = Symbol('MessageKey')

// 可选的配置类型
export interface IMessageMethodOptions {
  duration?: number
  icon?: string
  closable?: boolean
  placement?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

// 添加类型映射类型
export type IconType = IMessageType

export interface IMessageProviderProps {
  // 位置
  placement?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}
