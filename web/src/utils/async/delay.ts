/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-04 20:47:26
 * @LastEditTime: 2024-06-07 19:34:03
 */

/**
 * 延迟执行一个 Promise 一定时间。
 * @param {number} [t] - 延迟时间,单位为毫秒。默认为 500 毫秒。
 * @returns {Promise<boolean>} 一个在指定时间后解析为 `true` 的 Promise。
 */
export function delay(t: number = 500): Promise<boolean> {
  return new Promise(resolve => setTimeout(() => resolve(true), t))
}
