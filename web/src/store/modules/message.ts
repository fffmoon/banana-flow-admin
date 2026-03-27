import { defineStore } from 'pinia'
import { API } from '@/api'

export const useMessageStore = defineStore('message', () => {
  // 未读消息数量
  const unreadCount = ref(0)

  // 获取未读数量
  async function getUnreadCount() {
    try {
      const { data } = await API.account.notification.getUnreadCount()
      unreadCount.value = data.unreadCount
    }
    catch (error) {
      console.error('获取未读消息数量失败', error)
    }
  }

  // 轮询定时器
  let timer: any = null
  function startPolling(interval = 30000) {
    getUnreadCount()
    if (timer)
      clearInterval(timer)
    timer = setInterval(getUnreadCount, interval)
  }

  function stopPolling() {
    if (timer)
      clearInterval(timer)
    timer = null
  }

  return {
    unreadCount,
    getUnreadCount,
    startPolling,
    stopPolling,
  }
})
