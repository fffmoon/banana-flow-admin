<script lang="ts" setup>
import { NButton, NCard, NText } from 'naive-ui'

const router = useRouter()
const { refresh } = usePageJump(router)

const content = ref('')
</script>

<template>
  <FeatureDemo title="页面刷新" content="局部页面刷新能力，无视浏览器缓存，提升用户体验">
    <NCard title="无视页面缓存特性演示">
      <BSpace vertical>
        <NText class="text-sm">
          1. 先在输入框输入任意内容
        </NText>
        <NInput v-model="content" type="textarea" placeholder="没有内容" />
        <NText class="text-sm">
          2. 然后点击刷新按钮，输入框的内容将会消失
        </NText>
        <NButton type="primary" secondary class="w-fit" @click="refresh">
          刷新页面
        </NButton>
      </BSpace>
    </NCard>
  </FeatureDemo>
</template>
