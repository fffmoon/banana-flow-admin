export interface GetCaptchaResponse {
  svg: string
  key: string
}

export interface VerifyCaptchaRequest {
  key: string
  code: string
}

export interface GetClickCaptchaResponse {
  image: string
  hint: string
  key: string
}

export interface VerifyClickCaptchaRequest {
  key: string
  positions: IPoint[]
}

export interface IPoint {
  x: number
  y: number
}
