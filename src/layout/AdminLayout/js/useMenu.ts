import { inject } from 'vue'
import { MenuKey } from '@/constants'

export function useMenu() {
  const context = inject(MenuKey)

  if (!context) {
    throw new Error('useMenu() 读取 MenuKey 失败')
  }

  return {
    ...context,
  }
}
