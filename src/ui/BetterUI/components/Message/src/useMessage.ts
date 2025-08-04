import { inject } from 'vue'
import { MessageKey } from './types'

export function useMessage() {
  const context = inject(MessageKey)

  if (!context) {
    throw new Error('useMessage() 需要在 MessageProvider 下使用')
  }

  return {
    ...context,
  }
}
