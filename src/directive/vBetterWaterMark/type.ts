export interface IWaterMarkOptions {
  // 是否显示
  show: boolean
  // 主要文字
  content: string
  // 是否显示时间
  timestamp?: boolean
  // 文字大小
  fontSize?: number
  // 文字颜色 rgba
  textColor?: string
  // 自定义水印内容
  customContent?: boolean
}
