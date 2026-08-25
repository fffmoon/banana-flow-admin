<script lang="ts" setup>
import type CaptchaPopup from '@/components/biz/CaptchaPopup/index.vue'
import type { ISendValidateCaptchaPayload } from '@/components/biz/ClickCaptchaPopup/index.vue'
import type { IMessageInstance } from '@ui/BetterUI'
import type { FormInst } from 'naive-ui'
import ClickCaptchaPopup from '@/components/biz/ClickCaptchaPopup/index.vue'
import * as ionicons5 from '@vicons/ionicons5'
import { reactive, ref } from 'vue'

const { t } = useLocale()
const userStore = useUserStore()
let messageReactive: IMessageInstance | null = null

// 定义表单字段
const registerForm = reactive({
  phone: '',
  smsCode: '', // 短信验证码
  username: '',
  password: '',
  confirmPassword: '',
})

// 验证码倒计时
const countdown = ref(0)
// 是否发送中
const isSending = ref(false)

// 验证规则
const step1Rules = {
  phone: {
    required: true,
    pattern: /^1[3-9]\d{9}$/,
    message: t('login.validPhone'),
    trigger: 'blur',
  },
  smsCode: {
    required: true,
    len: 4,
    message: t('login.input4Code'),
    trigger: 'blur',
  },
  password: {
    required: true,
    min: 6,
    message: t('login.passwordMinRule'),
    trigger: 'blur',
  },
  confirmPassword: {
    required: true,
    validator: (rule: any, value: any) => {
      if (value !== registerForm.password)
        return new Error(t('login.passwordMismatch2'))
      return Promise.resolve()
    },
    trigger: 'blur',
  },
}

// 表单实例
const formRef = ref<FormInst | null>(null)
const message = useMessage()

// 图形验证码
const captchaPopupRef = ref<typeof CaptchaPopup | null>(null)

// 发送短信按钮
function sendSmsCode() {
  if (!registerForm.phone) {
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
  if (!registerForm.phone) {
    message.error(t('login.fillPhoneFirst'))
    return
  }

  try {
    // 发送短信验证码接口
    await API.auth.SendSmsCode({ mobilePhone: registerForm.phone, ...validateInfo })
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

// 提交注册
async function handleRegister() {
  try {
    await formRef.value?.validate()
    messageReactive = message.loading(t('login.registering'), { duration: 0 })
    await API.auth.registerWithSMS({
      mobilePhone: registerForm.phone,
      password: registerForm.password,
      code: registerForm.smsCode,
    })
    messageReactive?.destroy()
    messageReactive = message.success(t('login.registerSuccess2'))
    await userStore.login('mobilePassword', { username: registerForm.phone, password: registerForm.password })
    messageReactive?.destroy()
  }
  catch (error) {
    console.error('表单验证失败', error)
    messageReactive?.destroy()
  }
}
</script>

<template>
  <NForm ref="formRef" :model="registerForm" :rules="step1Rules" label-width="80">
    <NFormItem :label="t('login.phone')" path="phone">
      <NInput
        v-model:value="registerForm.phone" :placeholder="t('login.inputPhone')" :input-props="{
          'autocomplete': 'tel',
          'inputmode': 'tel',
          'pattern': '[0-9]*',
          'aria-describedby': 'phone-hint',
          'maxlength': 11,
        }"
      >
        <template #prefix>
          <NIcon :component="ionicons5.PhonePortraitSharp" />
        </template>
      </NInput>
    </NFormItem>

    <NFormItem :label="t('login.password')" path="password">
      <NInput
        v-model:value="registerForm.password" type="password" :placeholder="t('login.passwordFormat')" :input-props="{
          'autocomplete': 'new-password',
          'aria-describedby': 'password-hint',
        }"
      >
        <template #prefix>
          <NIcon :component="ionicons5.LockClosed" />
        </template>
      </NInput>
    </NFormItem>

    <NFormItem :label="t('login.confirmPassword')" path="confirmPassword">
      <NInput
        v-model:value="registerForm.confirmPassword" type="password" :placeholder="t('login.inputConfirmPassword')" :input-props="{
          'autocomplete': 'new-password',
          'aria-describedby': 'confirm-password-hint',
        }"
      >
        <template #prefix>
          <NIcon :component="ionicons5.LockClosed" />
        </template>
      </NInput>
    </NFormItem>

    <NFormItem :label="t('login.code')" path="smsCode">
      <div class="grid grid-cols-3 w-full gap-2">
        <NInput
          v-model:value="registerForm.smsCode" class="col-span-2" :placeholder="t('login.inputSmsCode')" :input-props="{
            'autocomplete': 'one-time-code',
            'inputmode': 'numeric',
            'pattern': '[0-9]*',
            'aria-describedby': 'smscode-hint',
            'maxlength': 6,
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

    <NFormItem :show-label="false">
      <NButton class="w-full" type="primary" @click="handleRegister">
        {{ t('login.register') }}
      </NButton>
    </NFormItem>
  </NForm>

  <ClickCaptchaPopup ref="captchaPopupRef" @send-validate-captcha="validateCallback" />
</template>

<style lang="scss" scoped>
.captcha-container {
  background-color: var(--custom-base-color);

  :deep(svg) {
    width: 100%;
    height: 100%;
  }

}
</style>