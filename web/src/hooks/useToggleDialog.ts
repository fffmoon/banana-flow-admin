/**
 * @description 一个简单的对话框封装
 * @example
 * const { show, toggle, loading } = useToggleDialog<IParams>({ open: () => {}, close: () => {} })
 * @author Qing
 * @param {string}
 * @return {*}
 * @date 2025-04-08 14:21:49
 */

interface DialogOptions<T = unknown> {
  open: (data?: T) => void
  close: (data?: T) => void
  reset: () => void
}
export function useToggleDialog<T = unknown>(options: DialogOptions<T>) {
  const show = ref(false)
  const loading = ref(false)

  // 切换
  function toggle(status?: boolean, params?: T) {
    reset()
    show.value = status ?? !show.value
    if (show.value) {
      options.open(params)
    }
    else {
      options.close(params)
    }
  }

  // 重置
  function reset() {
    options.reset()
    loading.value = false
  }

  return { show, toggle, loading }
}
