<script lang='ts' setup>
const { goToShouldConfirm } = usePageJump(router)
const { t } = useLocale()
</script>

<template>
  <div class="flex-center select-none">
    <!-- @/assets/logo.png -->
    <img
      draggable="false" class="h-40px w-40px cursor-pointer"
      src="https://img.dashixiong.asia/2025/04/7467aed7bd9c2a21ea4bcaf0916ae782.png" :alt="t('app.title')"
      :title="t('app.title')" @click="goToShouldConfirm('/')"
    />
  </div>
</template>

<style lang='scss' scoped>
// .base-container {}
</style>
