<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-14 14:41:33
 * @LastEditTime: 2025-03-15 03:47:40
-->
<script lang='ts' setup>
import type { IDirectoryItem } from '@apis/modules/image-management/type'
import * as ionicons5 from '@vicons/ionicons5'

interface IProps {
  cardInfo: IDirectoryItem
}
defineProps<IProps>()

const emits = defineEmits([
  'handleCardContextMenu',
  'handleFolderClick',
])
</script>

<template>
  <div class="file-item w-full">
    <NCard content-style="padding: 0;">
      <template #default>
        <div class="h-180px w-full flex-center bg-[var(--custom-border-color)]">
          <!-- 图片 -->
          <NImage
            v-if="cardInfo.type === 'file'" height="180" object-fit="cover"
            :src="cardInfo.filePath"
          >
            <template #error>
              <NIcon :size="80" color="lightGrey" :component="ionicons5.ImageOutline" />
            </template>
          </NImage>
          <!-- 文件夹 -->
          <NIcon v-else :size="80" :component="ionicons5.Folder" @click="emits('handleFolderClick', cardInfo.id)" />
        </div>

        <!-- 内容 -->
        <div class="p-[10px]">
          <div class="flex items-center">
            <NEllipsis class="text-center" :line-clamp="1">
              <span v-html="cardInfo.lightName" />
            </NEllipsis>
          </div>
        </div>
      </template>
    </NCard>
  </div>
</template>

<style lang='scss' scoped>
@keyframes light-fade {
    0% { background-color: rgb(24 160 88 / 30%); }

    100% { background-color: rgb(24 160 88 / 15%); }
  }

.file-item {
  transition: transform 0.2s;

  &:hover {
    box-shadow: var(--custom-box-shadow-1);
    transform: scale(1.04) translateY(-4px);
  }
}
  // 使用深度选择器穿透scoped限制
  :deep(.light) {
    color: var(--primary-color) !important;
    background-color: rgb(24 160 88 / 15%);
    padding: 2px 4px;
    border-radius: 4px;
    animation: light-fade 1.5s ease-out;
  }
</style>
