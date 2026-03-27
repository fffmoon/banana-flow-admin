/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-01-22 17:31:39
 * @LastEditTime: 2025-05-13 10:01:47
 */

import request from '@apis/request'

enum Api {
  MockTest = '/api/mock-page/test',
}

// 登录，通过手机
export function mockTest() {
  return request<string>({
    url: Api.MockTest,
    method: 'get',
  })
}
