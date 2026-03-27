<script lang='ts' setup>
import type { Placement } from '@ui/BetterUI'
import PopoverItem from './PopoverItem.vue'

interface IProps {
  containerPosition: {
    top: number
    left: number
    width: number
    height: number
  }
  placement: Placement
}
const props = withDefaults(defineProps<IProps>(), {
})

defineEmits(['close'])

const style = computed(() => {
  if (!props.containerPosition)
    return {}
  return {
    top: `${props.containerPosition.top}px`,
    left: `${props.containerPosition.left}px`,
    width: `${props.containerPosition.width}px`,
    height: `${props.containerPosition.height}px`,
  }
})
</script>

<template>
  <div class="popover-container">
    <div class="contenxt-wrap" :style="style">
      <PopoverItem :placement="placement">
        <slot></slot>
      </PopoverItem>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.popover-container {
  position: fixed;
  inset: 0;
  z-index: 998;
  width: 0;
  height: 0;

  .contenxt-wrap {
    position: absolute;
    pointer-events: none;
  }
}
</style>
