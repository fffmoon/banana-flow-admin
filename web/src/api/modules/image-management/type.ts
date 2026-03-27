export type IDirId = number | null
// 目录结构接口
export interface IDirectoryItem {
  id: IDirId
  name: string
  parentId: IDirId
  type: 'folder' | 'file' | 'skeleton'
  lightName: string
  fileType?: string
  filePath?: string
  children?: IDirectoryItem[]
}

// 图片文件接口
export interface ImageFile {
  id: number
  name: string
  url: string
  directoryId: number
  size: number
  createTime: string
}
