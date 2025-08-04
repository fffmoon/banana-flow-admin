/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-19 16:22:22
 * @LastEditTime: 2025-03-31 15:11:49
 */
import type { InjectionKey } from 'vue'

// 一条完整的消息
export interface IMessage {
  id: string
  type: IMessageType
  content: string
  duration?: number
  icon?: string
  closable?: boolean
  instance: IMessageInstance
  // 添加时间
  addTime: number
}

// 消息的类型
export type IMessageType = 'success' | 'error' | 'warning' | 'info' | 'loading'

// 消息的上下文
export interface IMessageKey {
  success: (content: string, options?: IMessageMethodOptions) => IMessageInstance
  error: (content: string, options?: IMessageMethodOptions) => IMessageInstance
  warning: (content: string, options?: IMessageMethodOptions) => IMessageInstance
  info: (content: string, options?: IMessageMethodOptions) => IMessageInstance
  loading: (content: string, options?: IMessageMethodOptions) => IMessageInstance
}

// 消息的注入
export const MessageKey: InjectionKey<IMessageKey> = Symbol('MessageKey')

// 可选的类型
export interface IMessageMethodOptions extends Omit<IMessage, 'id' | 'type' | 'content' | 'instance' | 'addTime'> {

}

// 添加类型映射类型
export type IconType = IMessageType

// 添加消息实例类型
export interface IMessageInstance {
  destroy: () => void
  pause: () => void
  resume: () => void
  manualPaused?: boolean
}

export interface IMessageProviderProps {
  // 位置
  placement?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}
