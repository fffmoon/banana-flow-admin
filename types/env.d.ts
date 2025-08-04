/*
 * @Author: Qing
 * @Description: 环境变量
 * @Date: 2024-05-22 16:57:14
 * @LastEditTime: 2024-06-04 19:20:21
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 环境
  readonly VITE_ENV: 'development' | 'production'
  // 标题
  readonly VITE_APP_TITLE: string
  // 部署的目录
  readonly VITE_BASE_URL: string
  // API接口路径
  readonly VITE_BASE_API: string
  // console.log 开关
  readonly VITE_CONSOLE_SW: boolean
  // vconsole 开关
  readonly VITE_VCONSOLE_SW: boolean
  // 服务端口
  readonly VITE_SERVE_PORT: number
  // mock 开关
  readonly VITE_MOCK_SW: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
