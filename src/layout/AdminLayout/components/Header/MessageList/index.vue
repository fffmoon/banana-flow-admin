<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-01 12:46:36
 * @LastEditTime: 2025-03-14 15:09:59
-->
<script lang="ts" setup>
import { ref } from 'vue'
import MessageItem from './MessageItem.vue'

// 在父组件定义数据
export interface Message {
  id: number
  type: 'daily' | 'friend' | 'system'
  title: string
  date: string
}

const messages = ref<Message[]>([
  {
    id: 1,
    type: 'daily',
    title: '你收到 8 份日报',
    date: '2025-01-29 20:00:00',
  },
  {
    id: 2,
    type: 'friend',
    title: '你收到了 3 位同事的好友申请，请及时处理',
    date: '2025-01-29 20:00:00',
  },
  {
    id: 3,
    type: 'system',
    title: '系统维护通知',
    date: '2025-01-30 09:00:00',
  },
])
</script>

<template>
  <div class="w-320px p-10px">
    <NTabs type="segment" animated>
      <NTabPane name="chap1" tab="消息">
        <MessageItem :messages="messages" />
      </NTabPane>
      <NTabPane name="chap2" tab="待办">
        <NEmpty description="没有新的待办" />
      </NTabPane>
    </NTabs>
  </div>
</template>
