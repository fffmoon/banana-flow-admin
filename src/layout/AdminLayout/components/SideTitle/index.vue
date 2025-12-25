<script lang='ts' setup>
const props = withDefaults(defineProps<IProps>(), {
  width: 'auto',
})
const { goToShouldConfirm } = usePageJump(router)
const { t } = useLocale()

interface IProps {
  width?: string
}
</script>

<template>
  <!-- 标题区域 -->
  <div
    class="min-w-0 flex-center flex-shrink-0 transform cursor-pointer px-3 line-height-[var(--header-height)] duration-248 ease-in-out"
    :style="{ width: `${props.width}` }"
  >
    <h2
      class="wh-full select-none text-truncate text-center text-[var(--font-size-huge)] text-[var(--n-text-color)] font-600"
      :title="t('app.title')" @click="goToShouldConfirm('/')"
    >
      <!-- DOTO 名字太长导致溢出效果，考虑使用滚动文字 -->
      {{ t('app.title') }}
    </h2>
  </div>
</template>

<style lang='scss' scoped>
// .base-container {}
</style>
