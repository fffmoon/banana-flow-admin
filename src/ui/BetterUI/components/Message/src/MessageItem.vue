<script lang='ts' setup>
import type { IconType, IMessage } from './types'
// 逻辑，处理
interface IProps {
  msg: IMessage
}
defineProps<IProps>()
const emit = defineEmits(['remove'])

// 类型与图标的映射
const typeIcons: Record<IconType, string> = {
  success: 'i-mdi-check-circle-outline',
  error: 'i-mdi-alert-circle-outline',
  warning: 'i-mdi-alert-outline',
  info: 'i-mdi-information-outline',
  loading: 'i-mdi-loading',
}

// 获取对应图标
function getIconClass(msg: IMessage) {
  return `${msg.icon || typeIcons[msg.type]} icon-status--${msg.type}`
}

// 图标关闭
function handleIconClose(msg: IMessage) {
  if (msg.closable) {
    emit('remove', msg.id)
  }
}
</script>

<template>
  <div class="msg-item-container" role="alert">
    <div class="icon" :class="getIconClass(msg)" />
    <div class="content">
      {{ msg.content }}
    </div>
    <div v-show="msg.closable" class="i-mdi-close" @click="handleIconClose(msg)"></div>
  </div>
</template>

<style lang='scss' scoped>
.msg-item-container {
  --at-apply: "flex items-center gap-2 w-full px-4 py-3 rounded-lg shadow-[--custom-box-shadow-2] text-sm font-medium bg-[var(--custom-base-color)] text-[var(--custom-text-color-base)] transition-transform duration-248 cursor-pointer transform pointer-events-auto border-1px border-solid border-color-[var(--custom-border-color)]";

  .icon {
    --at-apply: flex-shrink-0 text-lg;
  }

  .content {
    --at-apply: flex-grow;
  }

}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.icon-status--loading {
  --at-apply: bg-[var(--custom-info-color)];

  animation: spin 1s linear infinite;
}

.icon-status--primary {
  --at-apply: bg-[var(--custom-primary-color)];
}

.icon-status--success {
  --at-apply: bg-[var(--custom-success-color)];
}

.icon-status--error {
  --at-apply: bg-[var(--custom-error-color)];
}

.icon-status--warning {
  --at-apply: bg-[var(--custom-warning-color)];
}

.icon-status--info {
  --at-apply: bg-[var(--custom-info-color)];
}
</style>
