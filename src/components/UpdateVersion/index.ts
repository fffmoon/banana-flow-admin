import { useVersionStore } from './index.store'

export function useUpdateVersion() {
  const versionStore = useVersionStore()

  watch(() => versionStore.showUpdateDialog, (val) => {
    if (val) {
      // 处理弹出逻辑
      console.log('网页内容有更新')
      window.$dialog.info({
        title: '网页内容有更新',
        content: '点击确定按钮更新网页内容',
        positiveText: '确定',
        negativeText: '取消',
        draggable: true,
        onPositiveClick: () => {
          versionStore.handleUpdate()
        },
      })
    }
  })
}
