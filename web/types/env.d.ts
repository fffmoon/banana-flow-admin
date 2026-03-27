/*
 * @Author: Qing
 * @Description: 环境变量
 * @Date: 2024-05-22 16:57:14
 * @LastEditTime: 2024-06-04 19:20:21
 */

interface ImportMetaEnv {
  /** 环境 */
  readonly VITE_ENV: 'development' | 'production'
  /** 标题 */
  readonly VITE_APP_TITLE: string
  /** 部署的目录 */
  readonly VITE_BASE_URL: string
  /** API接口路径 */
  readonly VITE_BASE_API: string
  /** console.log 开关 */
  readonly VITE_CONSOLE_SW: string
  /** vconsole 开关 */
  readonly VITE_VCONSOLE_SW: string
  /** 服务端口 */
  readonly VITE_SERVE_PORT: string
  /** mock 开关 */
  readonly VITE_MOCK_SW: string
  /** 动态路由开关，关闭后不向后台请求路由更新 */
  readonly VITE_DYNAMIC_ROUTE_SW: string
  /** 打包分析开关 */
  readonly VITE_REPORT_SW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
