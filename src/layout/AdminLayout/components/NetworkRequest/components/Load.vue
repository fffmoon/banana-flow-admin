<script lang='ts' setup>
const requestCacheStore = useRequestCacheStore()
const loadComputed = computed(() => {
  return requestCacheStore.getRequestCount > 0
})
</script>

<template>
  <NSpin
    v-show="loadComputed"
    class="pointer-events-none absolute right-6px top-6px z-999 color-[var(--custom-primary-color)]" size="small"
  />
</template>
