<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-10 23:23:50
 * @LastEditTime: 2025-03-16 23:03:19
-->
<script lang="ts" setup>
const router = useRouter()
</script>

<template>
  <div class="mt-20vh">
    <NEmpty description="404错误。非常抱歉，页面找不到了" size="large">
      <template #icon>
        <div class="icon-base i-mdi-alert-circle-outline h-full w-full" />
      </template>
      <template #extra>
        <NButton @click="router.push('/')">
          返回首页
        </NButton>
      </template>
    </NEmpty>
  </div>
</template>
