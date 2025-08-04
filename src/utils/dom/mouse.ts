/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-30 13:20:30
 * @LastEditTime: 2025-04-30 13:22:41
 */
/**
 * @author Qing
 * @description 获取鼠标相对于指定元素的位置坐标。
 * @param event - 鼠标事件对象，用于获取鼠标的屏幕坐标。
 * @param referenceElement - 参考元素，默认为 document.body。如果传入其他元素，鼠标位置将相对于该元素。
 * @returns { x: number, y: number } - 返回一个包含 X 和 Y 坐标的对象，表示鼠标相对于参考元素的位置。
 * @date 2024-11-20 11:22:06
 */
export function getMousePosition(event: MouseEvent, referenceElement?: HTMLElement) {
  if (!(referenceElement instanceof HTMLElement)) {
    // console.warn('referenceElement 不是有效的 DOM 元素，已经重置为 document.body');
    referenceElement = document.body
  }
  const rect = referenceElement.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  return { x: mouseX, y: mouseY }
}
