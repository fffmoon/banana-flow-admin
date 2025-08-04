<script lang="ts" setup>
import type CaptchaPopup from '@/components/biz/CaptchaPopup/index.vue'
import type { ISendValidateCaptchaPayload } from '@/components/biz/ClickCaptchaPopup/index.vue'
import type { IMessageInstance } from '@ui/BetterUI'
import type { FormInst } from 'naive-ui'
import ClickCaptchaPopup from '@/components/biz/ClickCaptchaPopup/index.vue'
import * as ionicons5 from '@vicons/ionicons5'
import { reactive, ref } from 'vue'

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
    message: '请输入有效的手机号码',
    trigger: 'blur',
  },
  smsCode: {
    required: true,
    len: 4,
    message: '请输入4位验证码',
    trigger: 'blur',
  },
  password: {
    required: true,
    min: 6,
    message: '密码必须至少包含6个字符',
    trigger: 'blur',
  },
  confirmPassword: {
    required: true,
    validator: (rule: any, value: any) => {
      if (value !== registerForm.password)
        return new Error('确认密码与密码不一致')
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
  if (!registerForm.phone) {
    message.error('请先填写手机号')
    return
  }

  try {
    // 发送短信验证码接口
    await API.user.SendSmsCode({ mobilePhone: registerForm.phone, ...validateInfo })
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

// 提交注册
async function handleRegister() {
  try {
    await formRef.value?.validate()
    messageReactive = message.loading('注册中...', { duration: 0 })
    await API.user.registerWithSMS({
      mobilePhone: registerForm.phone,
      password: registerForm.password,
      code: registerForm.smsCode,
    })
    messageReactive?.destroy()
    messageReactive = message.success('注册成功，正在登录中...')
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
    <NFormItem label="手机号" path="phone">
      <NInput
        v-model:value="registerForm.phone" placeholder="请输入手机号" :input-props="{
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

    <NFormItem label="密码" path="password">
      <NInput
        v-model:value="registerForm.password" type="password" placeholder="8-20位字母+数字组合" :input-props="{
          'autocomplete': 'new-password',
          'aria-describedby': 'password-hint',
        }"
      >
        <template #prefix>
          <NIcon :component="ionicons5.LockClosed" />
        </template>
      </NInput>
    </NFormItem>

    <NFormItem label="确认密码" path="confirmPassword">
      <NInput
        v-model:value="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" :input-props="{
          'autocomplete': 'new-password',
          'aria-describedby': 'confirm-password-hint',
        }"
      >
        <template #prefix>
          <NIcon :component="ionicons5.LockClosed" />
        </template>
      </NInput>
    </NFormItem>

    <NFormItem label="验证码" path="smsCode">
      <div class="grid grid-cols-3 w-full gap-2">
        <NInput
          v-model:value="registerForm.smsCode" class="col-span-2" placeholder="请输入短信验证码" :input-props="{
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
          {{ isSending ? `${countdown}s` : '发送' }}
        </NButton>
      </div>
    </NFormItem>

    <NFormItem :show-label="false">
      <NButton class="w-full" type="primary" @click="handleRegister">
        注册
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
