<script lang='ts' setup>
import type { IDirectoryItem } from '@apis/modules/image-management/type'

interface IProps {
  rowData: IDirectoryItem
}
defineProps<IProps>()
</script>

<template>
  <div class="base-container">
    <!-- 文件夹类型 -->
    <template v-if="rowData.type === 'folder'">
      <i class="icon-box i-mdi-folder color-[#409eff]" />
    </template>

    <!-- 图片类型 -->
    <template v-else-if="rowData.fileType?.startsWith('image/')">
      <NImage
        :src="rowData.filePath" :preview-src="rowData.filePath"
        style="cursor: pointer; object-fit: cover;height: 32px;width: 32px;" @click.stop
      />
    </template>

    <!-- 其他文件类型 -->
    <template v-else>
      <i class="icon-box i-mdi-file-question color-[#666]" />
    </template>
  </div>
</template>

<style lang='scss' scoped>
.base-container {

  // 统一图标容器大小
  .icon-box {
    width: 32px;
    height: 32px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  // 图片容器样式
  .n-image {
    border-radius: 4px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>
