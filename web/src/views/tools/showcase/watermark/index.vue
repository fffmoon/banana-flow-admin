<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-14 09:28:55
 * @LastEditTime: 2025-05-06 10:30:36
-->
<script lang="ts" setup>
import { NCard } from 'naive-ui'
import BaseWatermark from './BaseWatermark.vue'

const options = reactive({
  show: true,
  content: '我是水印',
  timestamp: true,
})
</script>

<template>
  <FeatureDemo
    title="页面水印"
    content="基于指令的水印。在部分实际应用场景中，系统信息的随意截图转发可能带来信息泄露风险或对业务产生不利影响。基于此，可启用页面水印功能，以此降低用户随意截图并转发系统内信息行为的发生概率。"
  >
    <NCard title="整页水印">
      <div class="w-full">
        <BaseWatermark orientation="vertical"></BaseWatermark>
      </div>
    </NCard>
    <NCard title="局部水印">
      <BSpace vertical>
        <BSpace vertical>
          <div>
            局部水印
          </div>
          <div>
            <NSwitch :value="options.show" @update:value="(status: boolean) => options.show = status"></NSwitch>
          </div>
        </BSpace>
        <div
          v-waterMark="{ ...options }"
          class="h-300px max-w-500px b-[1px] b-color-[var(--custom-border-color)] b-solid"
        >
        </div>
      </BSpace>
    </NCard>
  </FeatureDemo>
</template>
