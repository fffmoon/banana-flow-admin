/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-21 20:09:25
 * @LastEditTime: 2025-01-27 21:34:14
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const Component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default Component
}

declare module 'mitt' {
  import mitt from 'mitt'

  export default mitt
}

declare module 'blueimp-md5' {
  import md5 from 'blueimp-md5'

  export default md5
}

declare module 'virtual:*' {
  const result: any
  export default result
}
