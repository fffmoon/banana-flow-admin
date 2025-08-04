import type { IValidateInfo } from '@/components/biz/ClickCaptchaPopup/index.vue'
import type { IRouteDataRaw } from 'types/vue-router'

export interface LoginRquest {
  password: string
  mobilePhone?: string
  email?: string
}

// DOTO：完善登录响应的类型
export interface LoginResponse { }

export interface GetUserInfoRquest { }

export interface Role {
  name: string
  description: string
}

export interface GetUserInfoResponse {
  id: string // 用户 ID，类型为 string，因返回的是 UUID
  userName: string // 用户名，类型为 string
  avatar: string // 用户头像，类型为 string（如果为空字符串表示没有头像）
  email: string | null // 用户邮箱，类型为 string 或 null
  mobilePhone: string // 手机号码，类型为 string
  createTime: string // 创建时间，类型为 string（可以根据需要转换为 Date 类型）
  role: Role[] // 角色信息，类型为 Role 数组
}

export interface GetPermmenuRequest { }

export interface GetPermmenuResponse {
  perms: string[]
  menus: IRouteDataRaw[]
  version: string
}

export type SmsCodeRequestPayload = {
  mobilePhone: string
} & IValidateInfo
