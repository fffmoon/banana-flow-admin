/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-07 21:45:16
 * @LastEditTime: 2024-06-07 21:55:06
 */
import { customAlphabet } from 'nanoid'

/**
 * @author Qing
 * @description 生成随机数
 * @param {number} len 数量
 * @return {number} 随机数
 * @date 2024-09-20 16:06:56
 */
export function generatedId(len: number = 10): string {
  const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', len)

  return nanoid()
}

/**
 * @author Qing
 * @description 随机数
 * @param {number} min 最小
 * @param {number} max 最大
 * @return {number} 随机数
 * @date 2024-09-20 16:06:56
 */
export function randnum(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min)
}
