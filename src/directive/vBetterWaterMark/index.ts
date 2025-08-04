/*
 * @Author: Qing
 * @Description: 基于指令的水印，有自定义配置、防删除功能，可运用于局部或者全局
 * @Date: 2025-03-29 20:29:46
 * @LastEditTime: 2025-04-14 14:48:57
 */
import type { App, Directive } from 'vue'
import type { IWaterMarkOptions } from './type'
import { isEqual } from 'lodash-es'
import { applyAntiRemove, createWatermarkElement, removeWatermarkElement } from './utils'

const watermarkMap = new WeakMap<HTMLElement, HTMLElement>()
// const isDev = process.env.NODE_ENV === 'development'
const isDev = false

// 实现
export const waterMarkDirective: Directive = {
  mounted(el, binding) {
    isDev && console.info('mounted')
    applyWatermark(el, binding.value)
  },
  updated(el, binding) {
    isDev && console.info('mounted')
    if (!isEqual(binding.oldValue, binding.value)) {
      applyWatermark(el, binding.value, true)
    }
  },
  unmounted(el) {
    isDev && console.info('mounted')
    removeWatermarkElement(el)
    watermarkMap.delete(el)
  },
}

function applyWatermark(
  el: HTMLElement,
  options: IWaterMarkOptions,
  isUpdate = false,
) {
  if (isUpdate) {
    const oldWatermark = watermarkMap.get(el)
    if (oldWatermark) {
      removeWatermarkElement(oldWatermark)
      watermarkMap.delete(el)
    }
  }

  if (!options.show) {
    const existing = watermarkMap.get(el)
    if (existing) {
      existing.style.display = 'none'
      void existing.offsetHeight
    }
    return
  }

  const watermark = createWatermarkElement(options)
  applyAntiRemove(el, watermark, options)
  watermarkMap.set(el, watermark)
  el.style.position = 'relative'
  el.appendChild(watermark)
}

// 注册
export function setupWaterMark(app: App) {
  app.directive('waterMark', waterMarkDirective)
}
