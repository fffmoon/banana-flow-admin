<script setup lang="ts">
</script>

<template>
  <FeatureDemo title="更好的间距" content="相比naiveui，支持高度的100%的继承">
    <div class="grid grid-cols-1 gap-x-3 gap-y-2 min-[600px]:grid-cols-2 !min-[1200px]:grid-cols-3">
      <NCard title="一排显示">
        <BSpace>
          <div v-for="i in 5" :key="i" class="blocks">
            东西
          </div>
        </BSpace>
      </NCard>
      <NCard title="垂直">
        <BSpace vertical>
          <div v-for="i in 5" :key="i" class="blocks">
            东西
          </div>
        </BSpace>
      </NCard>
      <NCard title="从尾部">
        <BSpace justify="end">
          <div v-for="i in 5" :key="i" class="blocks">
            东西
          </div>
        </BSpace>
      </NCard>
      <NCard title="间隙 ">
        <BSpace justify="space-between">
          <div v-for="i in 5" :key="i" class="blocks">
            东西
          </div>
        </BSpace>
      </NCard>
      <NCard title="空间围绕  ">
        <BSpace justify="space-around">
          <div v-for="i in 5" :key="i" class="blocks">
            东西
          </div>
        </BSpace>
      </NCard>
      <NCard title="从中间   ">
        <BSpace justify="center">
          <div v-for="i in 5" :key="i" class="blocks">
            东西
          </div>
        </BSpace>
      </NCard>
      <NCard title="反向">
        <BSpace reverse>
          <div v-for="i in 5" :key="i" class="blocks">
            {{ i }}
          </div>
        </BSpace>
      </NCard>
    </div>
  </FeatureDemo>
</template>

<style lang="scss" scoped>
.blocks {
  --at-apply: 'border-1px border-solid border-color-[var(--custom-border-color)]] p-6px'
}
</style>
