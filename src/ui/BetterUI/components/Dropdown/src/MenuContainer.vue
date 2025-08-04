<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-19 16:22:22
 * @LastEditTime: 2025-05-21 16:53:27
-->
<script lang='ts' setup>
import type { CustomDropdownOption, Placement } from './types'
import {
  defineEmits,
  defineProps,
} from 'vue'
import MenuItem from './MenuItem.vue'

interface IProps {
  containerPosition: {
    top?: number
    left?: number
    width?: number
    height?: number
  }
  menuItems: CustomDropdownOption[]
  placement?: Placement
}
const props = withDefaults(defineProps<IProps>(), {
  placement: 'bottom-start',
})

const emits = defineEmits(['close', 'select'])

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

const menuItemRef = ref<typeof MenuItem | null>(null)

watch(() => props.containerPosition, () => {
  menuItemRef.value?.updatePosition()
}, { immediate: true, deep: true })
</script>

<template>
  <div class="context-menu-container">
    <div class="contenxt-wrap" :style="style">
      <MenuItem
        ref="menuItemRef" :placement="placement" :menu-items="menuItems" @contextmenu.prevent
        @close="() => emits('close')" @select="(key, item) => emits('select', key, item)"
      >
      </MenuItem>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.context-menu-container {
  position: fixed;
  inset: 0;
  z-index: 998;
  width: 0;
  height: 0;

  .contenxt-wrap {
    position: absolute;
  }
}
</style>
