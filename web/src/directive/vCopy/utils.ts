import type { CopyDirectiveBinding } from './type'

export async function copyHandler(binding: CopyDirectiveBinding, event: MouseEvent) {
  try {
    // 获取要复制的文本
    let text = ''
    if (typeof binding.value === 'string') {
      text = binding.value
    }
    else if (typeof binding.value === 'function') {
      text = binding.value()
    }
    else if (typeof binding.value === 'object') {
      text = binding.value.text || ''
    }
    else {
      text = (event.currentTarget as HTMLElement)?.textContent || ''
    }

    // 执行复制操作
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
    else {
      // 兼容旧版浏览器
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    // 成功反馈
    if (typeof binding.value === 'object' && binding.value.onSuccess) {
      binding.value.onSuccess()
    }
    else {
      window.$message.success('复制成功')
    }
  }
  catch (err) {
    // 错误处理
    const error = err as Error
    if (typeof binding.value === 'object' && binding.value.onError) {
      binding.value.onError(error)
    }
    else {
      window.$message.error(`复制失败: ${error.message}`)
    }
  }
}
