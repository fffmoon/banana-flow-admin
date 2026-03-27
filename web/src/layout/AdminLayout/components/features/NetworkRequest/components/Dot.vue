<script lang='ts' setup>
const requestCacheStore = useRequestCacheStore()
const loadComputed = computed(() => {
  return requestCacheStore.getRequestCount > 0
})
</script>

<template>
  <div
    v-show="loadComputed"
    class="loading-dot pointer-events-none absolute right-6px top-6px z-999"
  />
</template>

<style scoped>
.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--custom-primary-color);
  animation: blink 0.3s infinite; /* 动画周期 */
}

@keyframes blink {
  0%, 50% {
    opacity: 0;
  }

  50.01%, 100% {
    opacity: 1;
  }
}
</style>
