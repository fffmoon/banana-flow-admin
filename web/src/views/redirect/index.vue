<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-10 23:23:50
 * @LastEditTime: 2025-03-29 21:49:02
-->
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onBeforeMount(() => {
  // 解析重定向参数
  const { params, query } = route
  const redirectType = params._redirect_type
  // 解码
  const path = redirectType === 'name' ? params.path : decodeURI(params.path as string)
  // console.info('解析重定向参数', params, query, path, redirectType)
  router.replace(
    redirectType === 'name'
      ? { name: path as string, query }
      : { path: path as string, query },
  )
})
</script>

<template>
  <div class="wh-full flex-center">
    Loading...
  </div>
</template>
