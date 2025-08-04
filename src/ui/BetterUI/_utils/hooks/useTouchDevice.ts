import { onMounted, ref } from 'vue'
/**
 * @description: 判断是否是移动端
 * @return {*}
 */
export function useTouchDevice(): {
  isTouchDevice: Ref<boolean>
} {
  const isTouchDevice = ref(false)
  onMounted(() => {
    if (typeof window === 'undefined')
      return
    isTouchDevice.value = window.matchMedia('(pointer: coarse)').matches
  })
  return {
    isTouchDevice,
  }
}
