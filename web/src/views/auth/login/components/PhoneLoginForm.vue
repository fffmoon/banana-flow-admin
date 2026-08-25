<script lang='ts' setup>
import type CaptchaPopup from '@/components/biz/CaptchaPopup/index.vue'
import type { ISendValidateCaptchaPayload } from '@/components/biz/ClickCaptchaPopup/index.vue'
import type { IMessageInstance } from '@ui/BetterUI'
import type { FormInst } from 'naive-ui'
import ClickCaptchaPopup from '@/components/biz/ClickCaptchaPopup/index.vue'
import * as ionicons5 from '@vicons/ionicons5'

const { t } = useLocale()
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
    message.error(t('login.fillPhoneFirst'))
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
    message.error(t('login.fillPhoneFirst'))
    return
  }

  try {
    // 发送短信验证码接口
    await API.auth.loginAfterSendSms({ mobilePhone: loginForm.phone, ...validateInfo })
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
    message.success(t('login.smsSentSuccess'))
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
    message.error(t('login.emptyPhoneWarning'))
    return
  }
  if (isLoading.value)
    return
  isLoading.value = true
  messageReactive = message.loading(t('login.signingIn'), { duration: 0 })
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
    <NFormItem :label="t('login.phoneDesc')" path="username">
      <NInput
        v-model:value="loginForm.phone" :disabled="isLoading" :placeholder="t('login.inputPhoneDesc')" :input-props="{
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

    <NFormItem :label="t('login.code')" path="smsCode">
      <div class="grid grid-cols-3 w-full gap-2">
        <NInput
          v-model:value="loginForm.smsCode" class="col-span-2" :placeholder="t('login.inputSmsCode')" :input-props="{
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
          {{ isSending ? `${countdown}s` : t('login.send') }}
        </NButton>
      </div>
    </NFormItem>

    <NFormItem>
      <NButton
        :loading="isLoading" type="primary" class="w-full"
        :class="[isLoading ? 'cursor-wait pointer-events-auto' : '']" native-type="submit" @click="handleLogin"
      >
        {{ isLoading ? t('login.signingInDots') : t('login.signIn') }}
      </NButton>
    </NFormItem>
  </NForm>

  <ClickCaptchaPopup ref="captchaPopupRef" @send-validate-captcha="validateCallback" />
</template>