<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-16 13:50:23
 * @LastEditTime: 2025-04-22 10:35:36
-->
<script lang="ts" setup>
import { NButton, NCard, NText } from 'naive-ui'
import { storeToRefs } from 'pinia'

const tabsViewStore = useTabsViewStore()
const { isMaximized } = storeToRefs(tabsViewStore)
</script>

<template>
  <FeatureDemo title="局部最大化" content="提供局部最大化展示能力，提升内容浏览体验。平滑的过渡动画，与浏览器原生全屏功能解耦">
    <NCard title="标签页最大化控制器">
      <BSpace vertical>
        <NText depth="3" class="text-sm">
          当前状态：{{ isMaximized ? '最大化中' : '正常模式' }}
        </NText>
        <NButton type="primary" secondary class="w-fit" aria-label="切换最大化状态" @click="tabsViewStore.toggleMaximize()">
          {{ isMaximized ? '还原窗口' : '最大化窗口' }}
        </NButton>
      </BSpace>
    </NCard>
  </FeatureDemo>
</template>
