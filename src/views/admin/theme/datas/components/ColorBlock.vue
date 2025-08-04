<script lang='ts' setup>
// 逻辑，处理
interface IProps {
  color: string
}

defineProps<IProps>()
</script>

<template>
  <div class="wh-full flex items-center">
    <div class="color-block" :style="{ background: color }"></div>
  </div>
</template>

<style scoped>
.color-block {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  box-shadow: 0 0 2px rgb(0 0 0 / 10%);
  border: 1px solid rgb(0 0 0 / 6%);
}
</style>
