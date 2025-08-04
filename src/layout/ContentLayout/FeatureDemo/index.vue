<script lang="ts" setup>
import { NCard } from 'naive-ui'

interface IProps {
  title: string
  content: string
  isFixedHeader?: boolean
}
withDefaults(defineProps<IProps>(), {
  isFixedHeader: false,
})
</script>

<template>
  <BSpace vertical class="wh-full">
    <NCard>
      <h1>{{ title }}</h1>
      <div class="explain">
        {{ content }}
      </div>
    </NCard>
    <div :class="{ 'flex-1 overflow-hidden': isFixedHeader }">
      <slot />
    </div>
  </BSpace>
</template>
