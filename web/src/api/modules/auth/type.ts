import type { IRouteDataRaw } from 'types/vue-router'
import type { IValidateInfo } from '@/components/biz/ClickCaptchaPopup/index.vue'

export interface LoginRquest {
  password: string
  mobilePhone?: string
  email?: string
  username?: string
}

// 登录响应 OAuth 2.0 的标准
export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number // 过期时间，单位为秒
}

export interface GetUserInfoRquest { }

export interface Role {
  roleCode: string
  roleName: string
  isSystem: boolean
  roleLevel: number
}

export interface GetUserInfoResponse {
  id: string // 用户 ID，因返回的是 UUID
  userName: string // 用户名
  avatar: string // 用户头像（如果为空字符串表示没有头像）
  email: string | null // 用户邮箱 或 null
  mobilePhone: string // 手机号码
  createTime: string // 创建时间（可以根据需要转换为 Date 类型）
  roles: Role[] // 角色信息，类型为 Role 数组
  username?: string // 用户名
  nickname: string // 昵称
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

// 个人资料更新参数
export interface UserProfileUpdateParams {
  nickname?: string
  email?: string
  mobilePhone?: string
  gender?: 0 | 1 | 2 // 0-未知, 1-男, 2-女
  avatar?: string
}

// 修改密码参数
export interface UserPasswordUpdateParams {
  oldPassword: string
  newPassword: string
}
