/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-01-22 17:31:40
 * @LastEditTime: 2025-07-29 13:19:54
 */
import type { GetPermmenuResponse, GetUserInfoResponse, LoginRquest, SmsCodeRequestPayload } from './type'
import request from '@apis/request'

// 登录，通过手机
export function loginWithSMS(data: LoginRquest) {
  return request<string>({
    url: '/api/auth/loginWithSMS',
    method: 'post',
    data,
  })
}

// 登录，通过邮箱
export function loginWithEmail(data: LoginRquest) {
  return request<string>({
    url: '/api/auth/loginWithEmail',
    method: 'post',
    data,
  })
}

// 获取用户信息
export function GetUserInfo() {
  return request<GetUserInfoResponse>({
    url: '/api/auth/getUserInfo',
    method: 'get',
  })
}

// 获取权限信息，包括按钮权限和菜单权限
export function GetPermmenu() {
  return request<GetPermmenuResponse>({
    url: '/api/admin/GetPermmenu',
    method: 'get',
  })
}

// 用户注册前发送验证码
export function SendSmsCode(data: SmsCodeRequestPayload) {
  return request<boolean>({
    url: '/api/user/sendCodeWithSMS',
    method: 'post',
    data,
  })
}

// 用户注册，通过手机短信
export function registerWithSMS(data: { mobilePhone: string, password: string, code: string }) {
  return request<boolean>({
    url: '/api/user/registerWithSMS',
    method: 'post',
    data,
  })
}

// [邮箱]用户注册前发送验证码
export function sendCodeWithEmail(params: { email: string }) {
  return request<boolean>({
    url: '/api/user/sendCodeWithEmail',
    method: 'get',
    params,
  })
}

// 用户注册，通过邮箱
export function registerWithEmail(data: { email: string, password: string, code: string }) {
  return request<boolean>({
    url: '/api/user/registerWithEmail',
    method: 'post',
    data,
  })
}

interface IClickPosition {
  x: number
  y: number
}

// 用户短信登录前，发送短信验证码
export function loginAfterSendSms(data: { mobilePhone: string, key: string, positions: IClickPosition[] }) {
  return request<boolean>({
    url: '/api/auth/loginAfterSendSms',
    method: 'post',
    data,
  })
}

// 用户短信登录，通过手机短信
export function loginWithSmsCode(data: { mobilePhone: string, code: string }) {
  return request<boolean>({
    url: '/api/auth/loginWithSmsCode',
    method: 'post',
    data,
  })
}
