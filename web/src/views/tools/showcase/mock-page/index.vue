<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-05-08 16:41:06
 * @LastEditTime: 2025-05-09 16:49:16
-->
<script lang='ts' setup>
const message = useMessage()

async function onClick() {
  console.log('点击预览')
  const { data } = await API.example.mockTest()
  message.success(data)
}
</script>

<template>
  <FeatureDemo title="Mock" content="通过拦截 Ajax 请求，返回模拟的响应数据">
    <NCard title="Mock">
      <BSpace wrap>
        <NButton @click="onClick">
          点击预览
        </NButton>
      </BSpace>
    </NCard>
  </FeatureDemo>
</template>
