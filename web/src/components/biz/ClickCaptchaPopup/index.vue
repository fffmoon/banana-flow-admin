<script lang='ts' setup>
import type { IPoint } from '@apis/modules/captcha/types'
import type { IMessageInstance } from '@ui/BetterUI'
import type { Ref } from 'vue'
import * as ionicons5 from '@vicons/ionicons5'
import { NModal } from 'naive-ui'
import { reactive, ref } from 'vue'

interface EmitsType {
  (event: 'validateCaptchaResult', result: boolean): void
  (event: 'sendValidateCaptcha', payload: ISendValidateCaptchaPayload): void
}

export interface ISendValidateCaptchaPayload {
  validateInfo: IValidateInfo
  finish: () => void
  close: () => void
}
export interface IValidateInfo {
  key: string
  positions: Array<{ x: number, y: number }>
}

const emits = defineEmits<EmitsType>()
const message = useMessage()

const showModal = ref(false)
const captchaInput: Ref<string> = ref('')
const isLoading = ref(false)

interface CaptchaData {
  image: string
  hint: string
  key: string
  width: number
  height: number
}
// 验证码信息
const captchaInfo = reactive<CaptchaData>({
  image: '',
  hint: '',
  key: '',
  width: 300,
  height: 150,
})
const clickPoints = ref<IPoint[]>([])
let loadMes: IMessageInstance | null = null
const captchaWrapper = ref<HTMLDivElement | null>(null)

// 组件显示
function toggleModal(state: boolean): void {
  showModal.value = state
  if (showModal.value) {
    resetCaptchaState()
    refreshCaptcha()
  }
}

// 获取图形验证码
async function refreshCaptcha(): Promise<void> {
  try {
    const { data } = await API.captcha.GetClickCaptcha({
      width: captchaInfo.width,
      height: captchaInfo.height,
    })
    captchaInfo.image = data.image
    captchaInfo.hint = data.hint
    captchaInfo.key = data.key
    clickPoints.value = []
  }
  catch (error) {
    console.error('获取验证码失败:', error)
  }
}

// 重置验证码状态
function resetCaptchaState(): void {
  captchaInfo.image = ''
  captchaInfo.hint = ''
  captchaInfo.key = ''
  captchaInput.value = ''
  clickPoints.value = []
}

// 处理点击事件
function handleClick(event: MouseEvent) {
  if (!captchaWrapper.value)
    return

  const container = captchaWrapper.value
  const rect = container.getBoundingClientRect()
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  // 计算百分比坐标
  const xPercent = ((event.clientX - rect.left) / containerWidth) * 100
  const yPercent = ((event.clientY - rect.top) / containerHeight) * 100

  // 保留两位小数
  clickPoints.value = [
    ...clickPoints.value,
    {
      x: Number(xPercent.toFixed(2)),
      y: Number(yPercent.toFixed(2)),
    },
  ]
}

// 处理点击点事件
function handlePointClick(index: number) {
  clickPoints.value = clickPoints.value.filter((_, i) => i !== index)
}

// 验证图形验证码
function validateCaptcha() {
  if (clickPoints.value.length === 0) {
    message.warning('请点击图片')
    emits('validateCaptchaResult', false)
    return false
  }
  isLoading.value = true
  loadMes && loadMes.destroy()
  loadMes = message.loading('验证中...', { duration: 0 })
  const validateInfo = {
    key: captchaInfo.key,
    positions: clickPoints.value.map(p => ({
      x: p.x / 100,
      y: p.y / 100,
    })),
  }
  emits('sendValidateCaptcha', {
    validateInfo,
    finish: () => {
      handleValidateFinish()
      refreshCaptcha()
    },
    close: () => {
      handleValidateFinish()
      toggleModal(false)
    },
  })
}

// 处理验证图形验证码结束
function handleValidateFinish() {
  loadMes && loadMes.destroy()
  isLoading.value = false
  clickPoints.value = []
}

defineExpose({
  toggleModal,
  refreshCaptcha,
  handleValidateFinish,
})
</script>

<template>
  <NModal v-model:show="showModal" preset="dialog" :show-icon="false">
    <!-- 标题 -->
    <div class="h-[32px] flex line-height-[32px]">
      <div>
        请在下图<span class="text-[var(--custom-primary-color)]">依次</span>点击
      </div>
      <div class="ml-[12px] h-[32px]">
        <img class="h-100% w-100%" :src="captchaInfo.hint">
      </div>
    </div>
    <!-- 验证图容器 -->
    <div class="mt-[12px] flex-center">
      <div
        ref="captchaWrapper"
        class="position-relative mb-[12px] w-full flex cursor-pointer select-none items-center justify-center bg-[var(--custom-base-color)]"
        @click="handleClick"
      >
        <img class="w-full" :src="captchaInfo.image">
        <div
          v-for="(point, index) in clickPoints" :key="index" class="click-point" :style="{
            left: `${point.x}%`,
            top: `${point.y}%`,
          }" @click.stop="handlePointClick(index)"
        >
          <span>{{ index + 1 }}</span>
        </div>
      </div>
    </div>
    <!-- 操作区 -->
    <div class="flex items-center justify-between gap-[12px]">
      <div class="flex gap-[12px]">
        <NTooltip placement="top-start" trigger="hover">
          <template #trigger>
            <NIcon size="22" class="icon" :component="ionicons5.CloseCircleOutline" @click="toggleModal(false)" />
          </template>
          关闭
        </NTooltip>
        <NTooltip placement="top-start" trigger="hover">
          <template #trigger>
            <NIcon size="22" class="icon" :component="ionicons5.RefreshCircleOutline" @click="refreshCaptcha" />
          </template>
          刷新验证码
        </NTooltip>
        <NTooltip placement="top-start" trigger="hover">
          <template #trigger>
            <NIcon size="22" class="icon" :component="ionicons5.AlertCircleOutline" />
          </template>
          请依次点击图片中的字符
        </NTooltip>
      </div>
      <div class="flex">
        <NButton
          :disabled="clickPoints.length === 0" :loading="isLoading" style="width: 100%;" type="info"
          @click="validateCaptcha"
        >
          确认
        </NButton>
      </div>
    </div>
  </NModal>
</template>

<style lang='scss' scoped>
.click-point {
  z-index: 10;
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid #fff;
  background: #539ffe;
  border-radius: 50%;
  pointer-events: auto;
  color: white;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 0 0 2px black;
}
</style>
