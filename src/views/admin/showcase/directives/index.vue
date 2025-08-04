<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-15 15:15:41
 * @LastEditTime: 2025-04-30 17:07:23
-->
<script lang="ts" setup>
const message = useMessage()

function onDebounceClick() {
  message.info(`防抖`)
}
function onThrottleClick() {
  message.info(`节流`)
}
</script>

<template>
  <FeatureDemo title="基于指令（Directive）的" content="指令可以快捷的实现需要操作DOM的功能">
    <BSpace vertical>
      <NCard title="文本复制">
        <BSpace vertical>
          <div>
            文本复制指令（单击复制）可复制的文本
          </div>
          <div>
            <NButton v-copy>
              复制
            </NButton>
          </div>
        </BSpace>
      </NCard>
      <NCard title="防抖">
        <BSpace vertical>
          <div>
            防抖指令，连续点击，只会执行第一次点击事件
          </div>
          <div>
            <NButton v-debounce:click="{ handler: onDebounceClick, wait: 1000 * 1 }">
              连续点击我
            </NButton>
          </div>
        </BSpace>
      </NCard>
      <NCard title="节流">
        <BSpace vertical>
          <div>
            节流指令，连续输入，每一秒只会执行一次事件
          </div>
          <div>
            <NButton v-throttle:click="{ handler: onThrottleClick, wait: 1000 * 1 }">
              连续点击我
            </NButton>
          </div>
        </BSpace>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>
