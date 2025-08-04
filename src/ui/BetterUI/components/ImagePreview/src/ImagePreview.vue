<script setup lang="ts">
import type { ImageProps } from './type'
import { ref } from 'vue'
import PreviewOverlay from './Preview.vue'

defineOptions({
  displayName: 'ImagePreview',
})
const props = withDefaults(defineProps<ImageProps>(), {
  alt: 'preview-image',
  width: '100%',
  height: 'auto',
  objectFit: 'cover',
  fullscreenObjectFit: 'contain',
})
const previewOverlayRef = ref<InstanceType<typeof PreviewOverlay> | null>(null)

function handlePreview(event: MouseEvent) {
  const target = (event.currentTarget as HTMLElement).getBoundingClientRect()
  previewOverlayRef.value?.toggleModal(true, target)
}

function processSize(size: string | number) {
  if (typeof size === 'number')
    return `${size}px`
  if (/^\d+$/.test(size))
    return `${size}px`
  return size
}

const imageStyle = computed(() => ({
  width: processSize(props.width),
  height: processSize(props.height),
  objectFit: props.objectFit,
  cursor: 'zoom-in',
}))

function closePreview() {
  console.log('closePreview')
}
</script>

<template>
  <div class="preview-wrapper">
    <img :src="src" :alt="alt" :style="imageStyle" @click="handlePreview" />

    <PreviewOverlay
      ref="previewOverlayRef" :src="src" :alt="alt" :object-fit="fullscreenObjectFit"
      @close="closePreview"
    />
  </div>
</template>

<style scoped>
.preview-wrapper img {
  transition: transform 0.3s ease;
}
</style>
