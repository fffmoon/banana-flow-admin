<script lang='ts' setup>
import type { Ref } from 'vue'
import { API } from '@/api'
import { NModal } from 'naive-ui'
import { reactive, ref } from 'vue'

interface CaptchaData {
  svg: string
  key: string
}

interface EmitsType {
  (event: 'validateCaptchaResult', result: boolean): void
}

// 定义组件事件
const emits = defineEmits<EmitsType>()

// 响应式状态
const show = ref(false)
const captchaInput: Ref<string> = ref('')
const showSuccess = ref(false)
const isLoading = ref(false)

// 验证码信息
const captchaInfo = reactive<CaptchaData>({
  svg: '',
  key: '',
})

const message = useMessage()

defineExpose({
  toggleModal,
})

// 获取图形验证码
async function refreshCaptcha(): Promise<void> {
  try {
    const { data } = await API.captcha.GetCaptcha()
    captchaInfo.svg = data.svg
    captchaInfo.key = data.key
  }
  catch (error) {
    console.error('获取验证码失败:', error)
    message.error('获取验证码失败，请重试')
  }
}

// 重置验证码状态
function resetCaptchaState(): void {
  showSuccess.value = false
  captchaInfo.svg = ''
  captchaInfo.key = ''
  captchaInput.value = ''
}

// 切换模态框显示状态
function toggleModal(state: boolean): void {
  show.value = state
  if (show.value) {
    resetCaptchaState()
    refreshCaptcha()
  }
}

// 验证图形验证码
async function validateCaptcha(): Promise<boolean> {
  if (!captchaInput.value.trim()) {
    message.warning('请输入验证码')
    emits('validateCaptchaResult', false)
    return false
  }

  try {
    isLoading.value = true
    const { data } = await API.captcha.VerifyCaptcha({
      key: captchaInfo.key,
      code: captchaInput.value.trim(),
    })
    isLoading.value = false

    if (!data) {
      message.error('验证码错误，请重新输入')
      refreshCaptcha()
      captchaInput.value = ''
      emits('validateCaptchaResult', false)
      return false
    }

    showSuccess.value = true
    emits('validateCaptchaResult', true)

    // 延迟关闭，展示成功状态
    await new Promise(resolve => setTimeout(resolve, 300))
    show.value = false
    return true
  }
  catch (error) {
    console.error('验证失败:', error)
    message.error('验证失败，请重试')
    emits('validateCaptchaResult', false)
    return false
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <NModal v-model:show="show" preset="dialog" title="请输入图形验证码" :show-icon="false">
    <template v-if="showSuccess">
      <NResult status="success" title="验证成功" />
    </template>
    <template v-else>
      <div
        class="captcha-container mb-[12px] min-h-[100px] flex cursor-pointer select-none items-center justify-center bg-[var(--custom-base-color)]"
        role="button" tabindex="0" aria-label="点击刷新验证码" @click="refreshCaptcha"
      >
        <div class="h-100% w-100%" v-html="captchaInfo.svg" />
      </div>
      <NGrid cols="3" :x-gap="10">
        <NGridItem span="2">
          <NInput v-model:value="captchaInput" placeholder="请输入图形验证码" maxlength="6" @keyup.enter="validateCaptcha" />
        </NGridItem>
        <NGridItem span="1">
          <NButton :loading="isLoading" style="width: 100%;" type="info" @click="validateCaptcha">
            确认
          </NButton>
        </NGridItem>
      </NGrid>
      <div class="mt-[12px] text-center font-size-[var(--custom-font-size-mini)] text-[var(--custom-text-color-3)]">
        点击图片可刷新验证码
      </div>
    </template>
  </NModal>
</template>

<style lang='scss' scoped>
.captcha-container {
  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}
</style>
