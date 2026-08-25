<script lang="ts" setup>
import { API } from '@/api'
import type { NotificationItem } from '@/api/modules/account/notification/api'
import MessageItem from './MessageItem.vue'
import { useLocale } from '@i18n/index'

const emit = defineEmits(['close'])
const router = useRouter()
const { go } = usePageJump(router)
const { t } = useLocale()

const activeTab = ref('message')
const loading = ref(false)
const messageList = ref<NotificationItem[]>([])

// 获取最新消息
async function fetchLatestMessages() {
  loading.value = true
  try {
    const { data } = await API.account.notification.getList({
      page: 1,
      size: 3,
      isRead: false,
    })
    messageList.value = data.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchLatestMessages()
})

function handleClose() {
  emit('close')
}

function handleViewAll() {
  emit('close')
  go('/account/message')
}
</script>

<template>
  <div class="w-320px">
    <NTabs v-model:value="activeTab" type="segment" animated class="p-10px pb-0">
      <NTabPane name="message" :label="t('notificationPopover.tabs.message')">
        <div class="min-h-0px">
          <div v-if="loading" class="flex-center py-6">
            <NSpin size="small" />
          </div>
          <NEmpty v-else-if="messageList.length === 0" :description="t('notificationPopover.empty.message')" class="py-6" />
          <MessageItem v-else :messages="messageList" @close="handleClose" />

          <!-- 底部按钮 -->
          <div class="border-t border-gray-100 dark:border-gray-700 py-2 text-center bg-[var(--n-color)]">
            <NButton text size="small" type="primary" @click="handleViewAll">
              {{ t('notificationPopover.actions.viewAll') }}
            </NButton>
          </div>
        </div>
      </NTabPane>
      <NTabPane name="todo" :label="t('notificationPopover.tabs.todo')">
        <NEmpty :description="t('notificationPopover.empty.todo')" class="py-6" />
      </NTabPane>
    </NTabs>
  </div>
</template>