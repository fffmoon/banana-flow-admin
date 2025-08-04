/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-19 16:22:23
 * @LastEditTime: 2025-04-15 15:11:03
 */
import type { App } from 'vue'
import { setupWaterMark } from '@/directive/vBetterWaterMark'
import { setupCopyDirective } from './vCopy'
import { setupDebounceDirective } from './vDebounce'
import { setupPermissionDirective } from './vPermission/index'
import { setupThrottleDirective } from './vThrottle'

export function setupDirective(app: App) {
  setupPermissionDirective(app)
  setupWaterMark(app)
  setupCopyDirective(app)
  setupDebounceDirective(app)
  setupThrottleDirective(app)
}
