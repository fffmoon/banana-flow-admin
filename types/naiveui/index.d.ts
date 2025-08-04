/** 扩展lib.dom.d.ts的window类型定义 */
interface Window {
  $message: MessageApiInjection | null
  $loadingBar: DialogApiInjection | null
  $notification: notification | null
  $dialog: loadingBar | null
  $vconsole: any
  $globalRequestingApiCount: number // 全局的正在请求的接口数量
}
