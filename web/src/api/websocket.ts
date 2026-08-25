// src/services/websocket.service.ts
interface WebSocketConfig {
  path: string
  onMessage: (data: any) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  autoReconnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectCount = 0
  private isManualClose = false
  private reconnectTimer: number | null = null

  public isConnected = false
  public isConnecting = false

  constructor(config: WebSocketConfig) {
    this.config = {
      autoReconnect: true,
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      ...config,
    }

    if (this.config.autoReconnect) {
      this.connect()
    }
  }

  private getWebSocketUrl(): string {
    const path = this.config.path.startsWith('/') ? this.config.path : `/${this.config.path}`

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}${path}`
  }

  public connect(): void {
    if (this.isConnecting || this.isConnected) {
      console.warn('WebSocket is already connecting or connected')
      return
    }

    try {
      this.isConnecting = true
      const wsUrl = this.getWebSocketUrl()

      console.log(`Connecting to WebSocket: ${wsUrl}`)
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
    }
    catch (error) {
      console.error('WebSocket connection failed:', error)
      this.isConnecting = false
      this.handleReconnect()
    }
  }

  private handleOpen(): void {
    console.log('WebSocket connected successfully')
    this.isConnected = true
    this.isConnecting = false
    this.reconnectCount = 0
    this.config.onOpen?.()
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      this.config.onMessage(data)
    }
    catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      this.config.onMessage(event.data)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason)
    this.isConnected = false
    this.isConnecting = false
    this.config.onClose?.()

    if (!this.isManualClose && this.config.autoReconnect) {
      this.handleReconnect()
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event)
    this.isConnecting = false
    this.config.onError?.(event)
  }

  private handleReconnect(): void {
    if (this.reconnectCount >= this.config.reconnectAttempts!) {
      console.error('WebSocket reconnection attempts exhausted')
      return
    }

    this.reconnectCount++
    console.log(`Reconnecting... (${this.reconnectCount}/${this.config.reconnectAttempts})`)

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, this.config.reconnectInterval)
  }

  public send(data: any): void {
    if (!this.ws || !this.isConnected) {
      console.warn('WebSocket is not connected')
      return
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      this.ws.send(message)
    }
    catch (error) {
      console.error('Failed to send WebSocket message:', error)
    }
  }

  public close(): void {
    this.isManualClose = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.isConnected = false
    this.isConnecting = false
  }
}

// 单例模式（可选）
let instance: WebSocketService | null = null

export function createWebSocket(config: WebSocketConfig): WebSocketService {
  if (instance) {
    instance.close()
  }
  instance = new WebSocketService(config)
  return instance
}
