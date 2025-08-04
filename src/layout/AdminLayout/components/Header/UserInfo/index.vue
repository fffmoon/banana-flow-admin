<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-01 12:46:36
 * @LastEditTime: 2025-04-15 13:40:36
-->
<!-- 替换原来的renderCustomHeader函数 -->
<script lang="ts" setup>
const userStore = useUserStore()
</script>

<template>
  <div class="min-w-160px flex items-center border-b-1 border-b-color-[var(--custom-border-color)] border-b-solid p-2">
    <NAvatar round class="mr-3" :src="userStore.getDispalyUserInfo.avatar" />
    <div>
      <div class="line-height-[1.2]">
        <NText depth="2">
          {{ userStore.getDispalyUserInfo.userName }}
        </NText>
      </div>
      <div v-if="userStore.getDispalyUserInfo.role.length" class="mt-6px text-xs opacity-80%">
        <NTag v-for="(tag, idx) in userStore.getDispalyUserInfo.role" :key="idx" class="mr-6px" size="small" type="info">
          {{ tag }}
        </NTag>
      </div>
    </div>
  </div>
</template>
