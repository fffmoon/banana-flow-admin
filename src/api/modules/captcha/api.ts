import type { GetCaptchaResponse, GetClickCaptchaResponse, VerifyCaptchaRequest, VerifyClickCaptchaRequest } from './types'
import request from '@apis/request'

// 获取图形验证码
export function GetCaptcha() {
  return request<GetCaptchaResponse>({
    url: '/api/captcha/generate',
    method: 'get',
  })
}

// 验证图形验证码
export function VerifyCaptcha(data: VerifyCaptchaRequest) {
  return request<boolean>({
    url: '/api/captcha/verify',
    method: 'post',
    data,
  })
}

// 获取点选图形验证码
export function GetClickCaptcha(data: { width: number, height: number }) {
  return request<GetClickCaptchaResponse>({
    url: '/api/click-captcha/captcha',
    method: 'get',
    params: data,
  })
}

// 验证点选图形验证码
export function VerifyClickCaptcha(data: VerifyClickCaptchaRequest) {
  return request<boolean>({
    url: '/api/click-captcha/verify',
    method: 'post',
    data,
  })
}
