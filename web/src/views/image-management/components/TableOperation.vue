<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-01 15:53:08
 * @LastEditTime: 2025-04-08 15:50:12
-->
<script lang='ts' setup>
import type { IDirectoryItem } from '@apis/modules/image-management/type'
import type { IFileActionType } from '@inters/management'
import { NButton } from 'naive-ui'

interface IProps {
  rowData: IDirectoryItem
}

const props = defineProps<IProps>()

// 定义可派发的事件类型
const emit = defineEmits<{
  (e: 'action', type: IFileActionType, data: IDirectoryItem): void
}>()

function handleAction(type: string, e: MouseEvent) {
  e.stopPropagation()
  emit('action', type as any, props.rowData)
}

const imageRef = ref<HTMLElement | null>(null)
function preview() {
  imageRef.value?.click()
}
</script>

<template>
  <BSpace>
    <!-- 文件夹操作 -->
    <template v-if="rowData.type === 'folder'">
      <NButton text size="small" type="primary" @click.stop="handleAction('open', $event)">
        <template #icon>
          <div class="i-mdi-folder-open"></div>
        </template>
        打开
      </NButton>
      <NButton text size="small" type="warning" @click.stop="handleAction('renameFolder', $event)">
        <template #icon>
          <div class="i-mdi-rename-outline"></div>
        </template>
        重命名
      </NButton>
      <NButton text size="small" type="warning" @click.stop="handleAction('moveFolder', $event)">
        <template #icon>
          <div class="i-mdi-folder-move"></div>
        </template>
        移动
      </NButton>
    </template>

    <!-- 文件操作 -->
    <template v-if="rowData.type === 'file'">
      <NButton text size="small" type="info" @click.stop="preview">
        <template #icon>
          <div class="i-mdi-eye-outline"></div>
        </template>
        预览
      </NButton>
      <NImage ref="imageRef" :src="rowData.filePath" :preview-src="rowData.filePath" class="hidden" @click.stop />
      <NButton text size="small" type="warning" @click.stop="handleAction('renameFile', $event)">
        <template #icon>
          <div class="i-mdi-rename-outline"></div>
        </template>
        重命名
      </NButton>
      <NButton text size="small" type="warning" @click.stop="handleAction('moveFile', $event)">
        <template #icon>
          <div class="i-mdi-file-move"></div>
        </template>
        移动
      </NButton>
    </template>

    <!-- 通用删除操作 -->
    <NButton text size="small" type="error" @click.stop="handleAction('delete', $event)">
      <template #icon>
        <div class="i-mdi-delete-outline"></div>
      </template>
      删除
    </NButton>
  </BSpace>
</template>

<style lang='scss' scoped></style>
