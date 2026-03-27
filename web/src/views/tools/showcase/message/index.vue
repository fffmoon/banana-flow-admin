<script setup lang="ts">
import type { IMessageInstance } from '@ui/BetterUI'
import { useMessage } from '@ui/BetterUI'

const message = useMessage()

let instance: IMessageInstance | null = null
function click() {
  instance?.destroy()
  instance = message.info('一直显示', { duration: 0, closable: true })
}
function colse() {
  instance?.destroy()
}

onUnmounted(() => {
  instance?.destroy()
})

function handleClick1() {
  window.$message?.info('我是脱离上下文的消息')
}
</script>

<template>
  <FeatureDemo title="更好的消息通知" content="基于提供者的消息通知，支持离散型API的方式调用、支持在使用过程中切换主题">
    <div class="grid grid-cols-1 gap-x-3 gap-y-2 min-[600px]:grid-cols-2 !min-[1200px]:grid-cols-3">
      <NCard title="基础用法">
        <BSpace wrap>
          <NButton type="success" @click="message.success('成功的消息')">
            成功的消息
          </NButton>
          <NButton type="info" @click="message.info('普通的消息')">
            普通的消息
          </NButton>
          <NButton type="warning" @click="message.warning('警告的消息')">
            警告的消息
          </NButton>
          <NButton type="error" @click="message.error('错误的消息')">
            错误的消息
          </NButton>
          <NButton @click="message.loading('loading的消息', { duration: 5000 })">
            加载中的消息
          </NButton>
        </BSpace>
      </NCard>
      <NCard title="一直显示">
        <BSpace wrap>
          <NButton @click="click">
            消息一直显示
          </NButton>
          <NButton @click="colse">
            点击关闭显示
          </NButton>
        </BSpace>
      </NCard>
      <NCard title="附带关闭按钮">
        <BSpace wrap>
          <NButton @click="message.info('附带关闭按钮的消息', { closable: true, duration: 1000 * 10 })">
            附带关闭按钮的消息
          </NButton>
        </BSpace>
      </NCard>
      <NCard title="自定义图标">
        <BSpace wrap>
          <NButton @click="message.info('自定义图标', { icon: 'i-mdi-check' })">
            自定义图标
          </NButton>
        </BSpace>
      </NCard>
      <NCard title="脱离上下文的消息">
        <BSpace wrap>
          <NButton @click="handleClick1">
            脱离上下文的消息
          </NButton>
        </BSpace>
      </NCard>
      <!-- <NCard title="设置位置">
        <BSpace wrap>
          <NButton @click="message.info('顶部的消息', {})">
            顶部
          </NButton>
        </BSpace>
      </NCard> -->
    </div>
  </FeatureDemo>
</template>
