import type { IPreviewOptions } from './type'
import { createApp } from 'vue'
import ImagePreview from './Preview.vue'

export function imagePreview(options: IPreviewOptions) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 创建应用实例
  const app = createApp(ImagePreview, {
    src: options.src,
    alt: options.alt,
    objectFit: options.objectFit || 'contain',
    onClose: () => {
      app.unmount()
      container.remove()
    },
  })

  // 挂载并获取组件实例
  const instance = app.mount(container) as InstanceType<typeof ImagePreview>

  return {
    close: () => instance.toggleModal(false),
    show: (target?: DOMRect | null) => instance.toggleModal(true, target),
  }
}
