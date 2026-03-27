/**
 * @Author: Qing
 * @description: px转rem
 * @param {number} px
 * @return {number} rem
 */
export function px2rem(px: number): number {
  return (px / 750) * 10
}

/**
 * @Author: Qing
 * @description: vh转px
 * @param {number} vh
 * @return {number} px
 */
export function convertVhToPx(vh: number): number {
  const viewportHeight = window.innerHeight
  const pixelsPerVh = viewportHeight / 100
  const pixelValue = vh * pixelsPerVh

  return pixelValue
}

export function convertDesignPxToPx(designPx) {
  // 设计稿基准宽度
  const designWidth = 750

  // 当前应用的宽度
  const currentWidth = window.innerWidth

  // 转换为当前应用使用的 px 值
  return (designPx * currentWidth) / designWidth
}
