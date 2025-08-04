<script lang='ts' setup>
import type CaptchaPopup from '@/components/biz/CaptchaPopup/index.vue'
import type { ISendValidateCaptchaPayload } from '@/components/biz/ClickCaptchaPopup/index.vue'
import type { IMessageInstance } from '@ui/BetterUI'
import type { FormInst } from 'naive-ui'
import ClickCaptchaPopup from '@/components/biz/ClickCaptchaPopup/index.vue'
import * as ionicons5 from '@vicons/ionicons5'

const message = useMessage()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInst | null>(null)
const loginForm = reactive({
  phone: route.query?.phone?.[0] ?? '',
  smsCode: '', // 短信验证码
})

const isLoading = ref(false)
let messageReactive: IMessageInstance | null = null

// 验证码倒计时
const countdown = ref(0)
// 是否发送中
const isSending = ref(false)

const captchaPopupRef = ref<typeof CaptchaPopup | null>(null)

// 发送短信按钮
function sendSmsCode() {
  if (!loginForm.phone) {
    message.error('请先填写手机号')
    return
  }
  if (isSending.value) {
    return
  }

  captchaPopupRef.value?.toggleModal(true)
}

// 发送短信验证码
async function validateCallback({ validateInfo, finish, close }: ISendValidateCaptchaPayload) {
  if (!loginForm.phone) {
    message.error('请先填写手机号')
    return
  }

  try {
    // 发送短信验证码接口
    await API.user.loginAfterSendSms({ mobilePhone: loginForm.phone, ...validateInfo })
    isSending.value = true
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        isSending.value = false
      }
    }, 1000)
    close()
    message.success('验证码发送成功')
  }
  catch (error: any) {
    console.error(error)
    if (['VAL_3003', 'VAL_3004'].includes(error.bizCode)) {
      finish()
      return
    }
    close()
  }
}

// 登录处理函数
async function handleLogin() {
  const { phone, smsCode } = loginForm
  if (!phone || !smsCode) {
    message.error('手机号或者短信验证码不能为空')
    return
  }
  if (isLoading.value)
    return
  isLoading.value = true
  messageReactive = message.loading('登录中', { duration: 0 })
  try {
    await userStore.login('mobileSmsCode', { username: phone, password: smsCode })
    isLoading.value = false
    messageReactive?.destroy()
  }
  catch (error) {
    console.error(error)
    isLoading.value = false
    messageReactive?.destroy()
  }
}
</script>

<template>
  <NForm ref="formRef" :model="loginForm" label-width="80" :show-feedback="false">
    <NFormItem label="手机号码" path="username">
      <NInput
        v-model:value="loginForm.phone" :disabled="isLoading" placeholder="请输入手机号码" :input-props="{
          'autocomplete': 'tel',
          'inputmode': 'tel',
          'aria-describedby': 'phone-hint',
        }" class="mb-10px" clearable maxlength="20"
      >
        <template #prefix>
          <NIcon :component="ionicons5.PhonePortraitSharp" />
        </template>
      </NInput>
    </NFormItem>

    <NFormItem label="验证码" path="smsCode">
      <div class="grid grid-cols-3 w-full gap-2">
        <NInput
          v-model:value="loginForm.smsCode" class="col-span-2" placeholder="请输入短信验证码" :input-props="{
            'autocomplete': 'one-time-code',
            'inputmode': 'numeric',
            'pattern': '[0-9]*',
            'aria-describedby': 'smscode-hint',
          }"
        >
          <template #prefix>
            <NIcon :component="ionicons5.Mail" />
          </template>
        </NInput>
        <NButton class="col-span-1" :disabled="isSending" type="primary" @click="sendSmsCode">
          {{ isSending ? `${countdown}s` : '发送' }}
        </NButton>
      </div>
    </NFormItem>

    <NFormItem>
      <NButton
        :loading="isLoading" type="primary" class="w-full"
        :class="[isLoading ? 'cursor-wait pointer-events-auto' : '']" native-type="submit" @click="handleLogin"
      >
        {{ isLoading ? '登录中...' : '登录' }}
      </NButton>
    </NFormItem>
  </NForm>

  <ClickCaptchaPopup ref="captchaPopupRef" @send-validate-captcha="validateCallback" />
</template>
