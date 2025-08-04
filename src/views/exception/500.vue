<script lang="ts" setup>
const router = useRouter()
const route = useRoute()

// 接收消息
const msg = computed(() => route.query.msg || '500错误。抱歉，服务器出错了')
</script>

<template>
  <div class="mt-20vh">
    <NEmpty :description="msg" size="large">
      <template #icon>
        <div class="icon-base i-mdi-bug-outline h-full w-full font-size-4" />
      </template>
      <template #extra>
        <div class="flex gap-2">
          <NButton @click="router.push('/')">
            返回首页
          </NButton>
        </div>
      </template>
    </NEmpty>
  </div>
</template>
