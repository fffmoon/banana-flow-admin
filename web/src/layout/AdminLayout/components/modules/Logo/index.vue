<script lang='ts' setup>
const { go } = usePageJump(router)
const { t } = useLocale()
</script>

<template>
  <div class="flex-center select-none">
    <!-- @/assets/logo.png -->
    <img draggable="false" class="h-40px w-40px cursor-pointer"
      src="/logo.png" :alt="t('app.title')"
      :title="t('app.title')" @click="go('/', { checkUnsaved: true })" />
  </div>
</template>

<style lang='scss' scoped>
// .base-container {}</style>
