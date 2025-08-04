/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-07 21:43:40
 * @LastEditTime: 2024-12-24 09:22:43
 */
/**
 * 检查给定的输入是否为有效的 JSON 格式。
 * @param {any} text - 要检查的输入。
 * @returns {boolean} 如果输入是有效的 JSON,返回 `true`；否则返回 `false`。
 */
export function isValidJSON(text: any): boolean {
  try {
    JSON.parse(text)

    return true
  }
  catch (error) {
    console.error('无效JSON', error)
    return false
  }
}
