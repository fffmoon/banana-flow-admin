/**
 * @Author: Qing
 * @description: 将指定的文本复制到剪贴板
 * @param {string} text 要复制到剪贴板的文本内容
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // 首先尝试使用 Clipboard API
    await navigator.clipboard.writeText(text)
    console.log('Text copied to clipboard')
  }
  catch (err) {
    console.error('Failed to copy text using Clipboard API:', err)
    // 如果 Clipboard API 不可用,则使用传统方式
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    console.log('Text copied to clipboard using traditional method')
  }
}
