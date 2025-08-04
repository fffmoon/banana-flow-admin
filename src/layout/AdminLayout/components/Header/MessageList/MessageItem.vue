<script lang='ts' setup>
import type { Message } from './index.vue'

defineProps<{
  messages: Message[]
}>()

// 从父组件导入类型

const message = useMessage()

// 图标相关逻辑保持不变
function getIconClass(type: string) {
  const iconMap = {
    daily: 'i-mdi-email',
    friend: 'i-mdi-account-plus',
    system: 'i-mdi-bell-alert',
  }
  return iconMap[type] || 'i-mdi-information'
}

const typeColor = {
  daily: 'text-blue-500',
  friend: 'text-green-500',
  system: 'text-orange-500',
}
</script>

<template>
  <!-- 模板部分保持不变 -->
  <div class="scroll-container">
    <BScrollbar
      :content-style="{
        maxHeight: '220px',
      }"
    >
      <NList clickable hoverable>
        <NListItem v-for="item in messages" :key="item.id">
          <div class="list-item">
            <div class="icon-box">
              <div
                class="icon-base--lg" :class="[
                  getIconClass(item.type),
                  typeColor[item.type],
                ]"
              />
            </div>
            <div class="content">
              <div class="title">
                {{ item.title }}
              </div>
              <div class="date">
                {{ item.date }}
              </div>
            </div>
          </div>
        </NListItem>
      </NList>
    </BScrollbar>
    <div class="mt-10px h-30px w-full flex-center">
      <NButton text class="h-full w-full" @click="() => message.info('开发中...')">
        查看全部
      </NButton>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.scroll-container {
  position: relative;
}

.scroll-container::after {
  content: '';
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(to bottom, transparent 0%, var(--custom-base-color) 100%);
  pointer-events: none;
}

.list-item {
  --at-apply: ' h-full w-full flex items-center';

  .icon-box {
    --at-apply: ' h-36px w-36px flex-center';

    .icon {
      --at-apply: 'icon-base--lg h-full w-full';
    }
  }

  .content {
    --at-apply: ' ml-12px w-full flex flex-1 flex-col flex-gap-4px';

    .title {
      --at-apply: ' w-full color-[var(--custom-text-color-1)] font-size-[var(--custom-font-size)]';
    }

    .date {
      --at-apply: ' w-full color-[var(--custom-text-color-2)] font-size-[var(--custom-font-size-mini)]';
    }
  }
}
</style>
