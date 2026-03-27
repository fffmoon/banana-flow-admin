/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-15 14:49:55
 * @LastEditTime: 2025-04-15 15:05:51
 */
import type { IWaterMarkOptions } from './type'
import { debounce } from 'lodash-es'
// 弱映射存储监控对象
const observerMap = new WeakMap<HTMLElement, MutationObserver>()
const watermarkKey = '__ant_watermark_element__'

// 创建水印
export function createWatermarkElement(options: IWaterMarkOptions): HTMLElement {
  const watermark = document.createElement('div')
  watermark.style.position = 'absolute'
  watermark.style.top = '0'
  watermark.style.left = '0'
  watermark.style.width = '100%'
  watermark.style.height = '100%'
  watermark.style.pointerEvents = 'none !important'
  watermark.style.backgroundImage = `url(${createWatermark(options)})`
  watermark.style.backgroundRepeat = 'repeat'
  watermark.style.zIndex = String(9999)
  watermark.style.display = `${options.show ? 'block' : 'none'}`
  watermark.dataset.watermark = 'protected'
  watermark.style.touchAction = 'none  !important'
  watermark.style.pointerEvents = 'none !important'
  // 样式保护
  watermark.style.cssText += `
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;`
  // 重置
  const revertLs = ['opacity', 'visible', 'transform', 'clip-path']
  revertLs.forEach((v) => {
    watermark.style[v] = 'revert'
  })

  return watermark
}

// 删除水印
export function removeWatermarkElement(el: HTMLElement) {
  if (el[watermarkKey]) {
    el[watermarkKey].destroy()
    delete el[watermarkKey]
  }
  el.remove()
}

// 创建水印元素
function createWatermark(options: IWaterMarkOptions): string {
  const timestamp = options.timestamp ? new Date().toLocaleString() : undefined
  return createBase64(options.content, { ...options, timestampStr: timestamp })
}

// 创建水印图片
function createBase64(text: string, options: IWaterMarkOptions & { timestampStr?: string }) {
  const { fontSize = 18, timestampStr } = options
  let fontColor = options.fontColor || 'rgba(0,0,0,0.15)'
  // 判断fontColor是不是rgba格式，不是的话使用默认颜色。
  if (!fontColor.startsWith('rgba')) {
    fontColor = 'rgba(0,0,0,0.15)'
  }
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // 旋转尺寸计算器
  const calculateRotatedSize = (width: number, height: number, angle: number) => {
    const rad = Math.abs(angle * Math.PI / 180)
    return {
      w: width * Math.cos(rad) + height * Math.sin(rad),
      h: width * Math.sin(rad) + height * Math.cos(rad),
    }
  }

  // 测量基础文本尺寸
  ctx.font = `${fontSize}px system-ui, sans-serif`
  const textMetrics = ctx.measureText(text)
  // const timestampMetrics = timestampStr ? ctx.measureText(timestampStr) : null
  const lineHeight = fontSize * 1.5
  const totalHeight = timestampStr ? lineHeight * 2 : lineHeight

  // 计算旋转后实际需要的画布尺寸
  const baseWidth = textMetrics.width
  const baseHeight = totalHeight
  const rotationAngle = 20 // 旋转角度
  const rotatedSize = calculateRotatedSize(baseWidth, baseHeight, rotationAngle)
  const SAFE_PADDING = fontSize * 0.5 // 动态安全边距

  // 设置画布尺寸（包含安全边距）
  canvas.width = (rotatedSize.w + SAFE_PADDING) * 2
  canvas.height = (rotatedSize.h + SAFE_PADDING) * 2

  // 调整绘制原点位置
  ctx.save()
  const rad = rotationAngle * Math.PI / 180
  ctx.translate(
    canvas.width / 2 + rotatedSize.w / 2 * Math.sin(rad),
    canvas.height / 2 - rotatedSize.h / 2 * Math.cos(rad),
  )
  ctx.rotate(-rad)

  // 绘制逻辑
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = fontColor

  // 主文字
  ctx.font = `${fontSize}px system-ui, sans-serif`
  ctx.fillText(text, 0, -lineHeight / 2)

  // 时间戳
  if (timestampStr) {
    ctx.font = `${fontSize * 0.8}px system-ui, sans-serif`
    ctx.fillText(timestampStr, 0, lineHeight / 2)
  }

  ctx.restore()
  return canvas.toDataURL()
}

// 增强型防删除处理
export function applyAntiRemove(
  container: HTMLElement,
  watermark: HTMLElement,
  options: IWaterMarkOptions,
) {
  // 防抖处理
  const reAppendDebounce = debounce(() => {
    if (!container.contains(watermark)) {
      container.appendChild(watermark)
    }
  }, 1000 * 0.5)

  // 1. MutationObserver 监听
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const nodes = Array.from(mutation.removedNodes)
        if (nodes.includes(watermark)) {
          reAppendDebounce()
        }
      }
    }
  })

  observer.observe(container, {
    childList: true,
    subtree: false,
    attributes: false,
  })

  // 2. 定时属性校验 (每秒检查)
  const timer = setInterval(() => {
    if (!watermark.isConnected) {
      reAppendDebounce()
      return
    }

    // 校验关键样式是否被修改
    const criticalStyles = {
      position: 'absolute',
      pointerEvents: 'none',
      display: options.show ? 'block' : 'none',
      zIndex: '9999',
    }

    for (const [prop, value] of Object.entries(criticalStyles)) {
      if (watermark.style[prop as any] !== value) {
        Object.assign(watermark.style, criticalStyles)
        watermark.style.backgroundImage = `url(${createWatermark(options)})`
        break
      }
    }
  }, 1000 * 1)

  // 存储监控对象
  observerMap.set(watermark, observer)

  // 清理句柄
  watermark[watermarkKey] = {
    observer,
    timer,
    destroy: () => {
      observer.disconnect()
      clearInterval(timer)
    },
  }
}
