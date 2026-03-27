/*
 * @Author: Qing
 * @Description: 
 * @Date: 2025-01-22 17:31:39
 * @LastEditTime: 2025-05-13 10:01:47
 */

import type { MockMethod } from 'vite-plugin-mock'
import { resultSuccess } from '@mock/_util'

export default [
  {
    url: '/api/mock-page/test',
    timeout: 0,
    method: 'get',
    response: () => {
      return resultSuccess("这是一条 mock 测试消息")
    },
  },
] as MockMethod[]
