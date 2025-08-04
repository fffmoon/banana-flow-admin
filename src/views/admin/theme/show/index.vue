<!--
  * @Author: Qing
  * @Description:
  * @Date: 2024-10-08 10:09:51
 * @LastEditTime: 2025-04-25 16:02:35
-->
<script setup lang="ts">
const themeSettingKey = inject(ThemeSettingKey)
function openSettingClick() {
  if (!themeSettingKey)
    return
  themeSettingKey.openThemeSetting()
}
</script>

<template>
  <FeatureDemo title="主题展示" content="来自naiveui、shadcnui的灵感，使用JS桥的方式实现的可高度定制化的主题系统">
    <BSpace vertical>
      <NCard title="主题演示请点击偏好设置" class="">
        <NButton @click="openSettingClick">
          偏好设置
        </NButton>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>
