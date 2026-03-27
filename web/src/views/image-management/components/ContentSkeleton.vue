<script lang='ts' setup>
import { NSkeleton } from 'naive-ui'
</script>

<template>
  <div class="file-item w-full">
    <NCard content-style="padding: 0;">
      <template #default>
        <!-- 图片/文件夹区域 -->
        <div class="h-full w-100% flex-center bg-[var(--custom-border-color)]">
          <NSkeleton height="160px" width="100%" :sharp="false" class="skeleton-animation" />
        </div>

        <!-- 内容区域 -->
        <div class="p-[10px]">
          <div class="flex items-center">
            <NSkeleton height="20px" width="100%" class="mx-auto" />
          </div>
        </div>
      </template>
    </NCard>
  </div>
</template>

<style lang='scss' scoped>
.skeleton-animation {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}

.file-item:hover {
  :deep(.n-card) {
    box-shadow: var(--custom-box-shadow-1);
  }

  // 加载状态禁用缩放
  &:not(.is-loading) {
    transform: scale(1.04) translateY(-4px);
  }
}
</style>
