<script lang="ts" setup>
const router = useRouter()
</script>

<template>
  <div class="mt-20vh">
    <NEmpty description="403错误。抱歉，你无权访问该页面" size="large">
      <template #icon>
        <div class="icon-base i-mdi-lock-outline h-full w-full font-size-4" />
      </template>
      <template #extra>
        <NButton @click="router.push('/')">
          返回首页
        </NButton>
      </template>
    </NEmpty>
  </div>
</template>
