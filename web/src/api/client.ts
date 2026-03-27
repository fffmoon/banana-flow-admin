/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-05-28 20:31:25
 * @LastEditTime: 2024-06-07 18:11:15
 */
interface IFetchStreamOptions {
  url: string
  requestInit: RequestInit
  autoDone?: boolean
  onmessage: (data: string, index: number) => void
  ondone?: () => void
  onerror?: (error: any) => void
  ontimeout?: () => void
}

export class FetchStream {
  url: string
  requestInit: RequestInit
  onmessage: IFetchStreamOptions['onmessage']
  ondone: IFetchStreamOptions['ondone']
  onerror: IFetchStreamOptions['onerror']
  controller: AbortController | null = null
  timer: number = 0
  ontimeout: IFetchStreamOptions['ontimeout']
  // 是否完成，用于手动结束
  isDone: boolean = false
  // 自动结束
  autoDone: boolean = true

  constructor(options: IFetchStreamOptions) {
    this.url = options.url
    this.requestInit = options.requestInit
    this.onmessage = options.onmessage
    this.ondone = options.ondone
    this.onerror = options.onerror
    this.autoDone = options.autoDone !== undefined
      ? options.autoDone
      : true
    this.createFetchRequest()
  }

  createFetchRequest() {
    // 开启中断控制器
    this.controller = new AbortController()
    // 开启超时计时器
    this.timeout()

    fetch(this.url, {
      method: 'POST',
      signal: this.controller.signal,
      ...this.requestInit,
    })
      .then((response) => {
        clearTimeout(this.timer) // 拿到结果，清除 timeout 计时器
        console.log(response, response.status)
        if (response.status === 200) {
          return response.body!
        }
        else {
          return Promise.reject(response)
        }
      })
      .then(async (readableStream) => {
        // 创建流队列
        const reader = readableStream.getReader()
        console.log('读取流列队', reader)
        // 索引
        let index: number = 0
        while (true) {
          try {
            const readData = await reader.read()
            // 自动结束
            if (this.autoDone && readData.done) {
              this.ondone?.()
              break
            }
            // 手动结束
            if (this.isDone) {
              this.ondone?.()
              break
            }
            // 将分块数据转换为 string 交给外部处理函数使用
            const dataText = new TextDecoder().decode(readData.value)
            console.log(dataText)
            try {
              this.onmessage(dataText, index++)
            }
            catch (error) {
              this.onerror?.(error)
              break
            }
          }
          catch (error: any) {
            this.onerror?.(error)
            break
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      })
      .catch((response) => {
        this.onerror?.(response)
      })
  }

  /* 中断 */
  abort() {
    if (this.controller)
      this.controller.abort()
  }

  /* 超时 */
  timeout(time: number = 60000) {
    this.timer = window.setTimeout(() => {
      this.abort()
      this.ontimeout?.()
    }, time)
  }
}
