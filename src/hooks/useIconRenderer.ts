/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-02 13:28:01
 * @LastEditTime: 2025-04-02 14:12:03
 */
import type { Component } from 'vue'
import UnocssIcon from '@/components/UnocssIcon/index.vue'

export function useIconRenderer(icon: string, size?: number, color?: string) {
  return (): Component => {
    return h(UnocssIcon, {
      icon,
      size: size || 18,
      color: color || '',
    })
  }
}
