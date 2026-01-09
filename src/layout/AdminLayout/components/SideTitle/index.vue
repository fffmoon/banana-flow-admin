<script lang='ts' setup>
const props = withDefaults(defineProps<IProps>(), { width: 'auto' })
const { goToShouldConfirm } = usePageJump(router)
const { t } = useLocale()

interface IProps {
  width?: string
}
</script>

<template>
  <!-- 标题区域 -->
  <div
    class="min-w-0 flex-center transform cursor-pointer overflow-hidden line-height-[var(--header-height)] duration-248 ease-in-out"
    :style="props.width === 'auto' ? {} : { width: props.width, flex: 'none' }"
  >
    <h2
      class="h-full w-full select-none text-truncate text-center text-[var(--font-size-huge)] text-[var(--n-text-color)] font-600"
      :title="t('app.title')" @click="goToShouldConfirm('/')"
    >
      {{ t('app.title') }}
    </h2>
  </div>
</template>

<style lang='scss' scoped>
// .base-container {}
</style>
