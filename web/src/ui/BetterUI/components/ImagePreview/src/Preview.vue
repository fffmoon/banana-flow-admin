<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  src: string
  alt?: string
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
}

withDefaults(defineProps<Props>(), {
  alt: 'preview-image',
  objectFit: 'contain',
})

const emit = defineEmits(['close'])

const isShow = ref(false)
// 正在关闭
const isClosing = ref(false)
const imageRef = ref<HTMLImageElement | null>(null)
const originStyle = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
})

function toggleModal(status: boolean, target?: DOMRect | null) {
  isShow.value = status ?? !isShow.value

  if (status) {
    if (target) {
      originStyle.value = {
        x: target.left + window.scrollX,
        y: target.top + window.scrollY,
        width: target.width,
        height: target.height,
      }
    }
    // 没有鼠标对象则居中显示
    else {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      originStyle.value = {
        x: viewportWidth / 2,
        y: viewportHeight / 2,
        width: 1,
        height: 1,
      }
    }
  }
  if (!status) {
    isClosing.value = false
    emit('close')
  }
}

// 准备关闭
function prepareClose() {
  isClosing.value = true
  setTimeout(() => toggleModal(false), 1000 * 0.4)
}

defineExpose({
  toggleModal,
})

function closePreview() {
  toggleModal(false)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closePreview()
  }
}

const imageStyle = computed(() => {
  if (!isShow.value)
    return {}

  const ratio = 0.80
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const targetWidth = Math.max(viewportWidth * ratio, originStyle.value.width)
  const targetHeight = Math.max(viewportHeight * ratio, originStyle.value.height)

  return {
    '--origin-x': `${originStyle.value.x}px`,
    '--origin-y': `${originStyle.value.y}px`,
    '--origin-width': `${originStyle.value.width}px`,
    '--origin-height': `${originStyle.value.height}px`,
    '--target-width': `${targetWidth}px`,
    '--target-height': `${targetHeight}px`,
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isShow" class="fullscreen-overlay" @click.self="prepareClose">
      <img
        ref="imageRef" draggable="false" :src="src" :alt="alt" class="fullscreen-image"
        :class="{ 'close-ani': isClosing }" :style="{
          objectFit,
          ...imageStyle,
        }"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.fullscreen-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 80%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  cursor: zoom-out;
}

.fullscreen-image {
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0.6, 1.2);
  animation: zoom-in 0.4s forwards;
  position: absolute;
  user-select: none;
  pointer-events: none;
  transform-origin: center;
}

.close-ani {
  animation: zoom-out 0.4s forwards;
}

@keyframes zoom-in {
  from {
    left: var(--origin-x);
    top: var(--origin-y);
    width: var(--origin-width);
    height: var(--origin-height);
    transform: translate(0, 0) scale(1);
  }

  to {
    left: 50%;
    top: 50%;
    width: var(--target-width);
    height: var(--target-height);
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes zoom-out {
  from {
    left: 50%;
    top: 50%;
    width: var(--target-width);
    height: var(--target-height);
    transform: translate(-50%, -50%) scale(1);
  }

  to {
    left: var(--origin-x);
    top: var(--origin-y);
    width: var(--origin-width);
    height: var(--origin-height);
    transform: translate(0, 0) scale(1);
  }
}
</style>
