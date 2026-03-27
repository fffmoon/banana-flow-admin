<script lang='ts' setup>
import { useRouter } from 'vue-router'
import type { NotificationItem } from '@/api/modules/account/notification/api'
import moment from 'moment'
import { NOTIFICATION_TYPE_META } from '@/constants';

const props = defineProps<{
  messages: NotificationItem[]
}>()

const emit = defineEmits(['close'])
const router = useRouter()
const { go } = usePageJump(router)

function getIcon(type: NotificationItem['noticeType']) {
  const meta = NOTIFICATION_TYPE_META.find(item => item.id === type)
  return meta?.icon
}
function getColor(type: NotificationItem['noticeType']) {
  const meta = NOTIFICATION_TYPE_META.find(item => item.id === type)
  return meta?.color
}

function formatTime(time: string) {
  return moment(time).fromNow()
}

function handleItemClick(item: NotificationItem) {
  emit('close')
  go('/account/message', {
    query: {
      id: item.id
    },
  })
}
</script>

<template>
  <div class="w-full">
    <div class="max-h-280px w-full">
      <NList hoverable clickable>
        <NListItem v-for="item in messages" :key="item.id" @click="handleItemClick(item)">
          <div class="flex items-center gap-3 w-full">
            <!-- 图标区 -->
            <div class="flex-shrink-0 h-32px w-32px flex-center rounded-full bg-gray-100 dark:bg-gray-700">
              <div class="icon-base--md" :class="[getIcon(item.noticeType), getColor(item.noticeType)]" />
            </div>

            <!-- 内容区 -->
            <div class="flex-1 min-w-0 flex flex-col gap-1">
              <div class="text-sm font-medium  line-clamp-1 break-all text-[var(--n-text-color)]">
                {{ item.title }}
              </div>
              <div class="text-xs text-gray-500 line-clamp-1 break-all" v-if="item.content">
                {{ formatTime(item.createTime) }}
              </div>
            </div>
          </div>
        </NListItem>
      </NList>
    </div>
  </div>
</template>