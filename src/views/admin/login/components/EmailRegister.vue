<!--
  * @Author: Qing
  * @Description: 邮箱注册组件
  * @Date: 2025-04-02
 * @LastEditTime: 2025-04-21 14:35:57
-->
<script lang="ts" setup>
import type CaptchaPopup from '@/components/biz/CaptchaPopup/index.vue'
import type { ISendValidateCaptchaPayload } from '@/components/biz/ClickCaptchaPopup/index.vue'
import type { IMessageInstance } from '@ui/BetterUI'
import type { FormInst } from 'naive-ui'
import ClickCaptchaPopup from '@/components/biz/ClickCaptchaPopup/index.vue'
import * as ionicons5 from '@vicons/ionicons5'
import { reactive, ref } from 'vue'

const userStore = useUserStore()
const message = useMessage()
let messageReactive: IMessageInstance | null = null

// 表单字段定义
const registerForm = reactive({
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
})

// 验证规则
const step1Rules = {
  email: {
    required: true,
    pattern: /^[\w.%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: '请输入有效的邮箱地址',
    trigger: ['blur', 'input'],
  },
  verificationCode: {
    required: true,
    len: 4,
    message: '请输入4位验证码',
    trigger: 'blur',
  },
  password: {
    required: true,
    min: 8,
    max: 20,
    pattern: /^(?=.*[A-Z])(?=.*\d).+/i,
    message: '需8-20位字母+数字组合',
    trigger: 'blur',
  },
  confirmPassword: {
    required: true,
    validator: (rule: any, value: string) => {
      if (value !== registerForm.password)
        return new Error('两次输入的密码不一致')
      return true
    },
    trigger: 'blur',
  },
}

// 表单实例
const formRef = ref<FormInst | null>(null)

// 验证码相关状态
const countdown = ref(0)
const isSending = ref(false)
const captchaPopupRef = ref<typeof CaptchaPopup | null>(null)

// 发送验证码
function sendVerificationCode() {
  if (!registerForm.email) {
    message.error('请先填写邮箱地址')
    return
  }
  captchaPopupRef.value?.toggleModal(true)
}

// 验证码回调处理
async function validateCallback({ validateInfo, finish, close }: ISendValidateCaptchaPayload) {
  try {
    // 调用邮箱验证码接口
    await API.user.sendCodeWithEmail({
      email: registerForm.email,
      ...validateInfo,
    })

    isSending.value = true
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        isSending.value = false
      }
    }, 1000)
    message.success('验证码已发送至您的邮箱')
    close()
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

    // 调用邮箱注册接口
    await API.user.registerWithEmail({
      email: registerForm.email,
      password: registerForm.password,
      code: registerForm.verificationCode,
    })

    // 自动登录
    messageReactive.destroy()
    message.success('注册成功，正在登录...')
    await userStore.login('emailPassword', {
      username: registerForm.email,
      password: registerForm.password,
    })
  }
  catch (error) {
    console.error('注册失败:', error)
    messageReactive?.destroy()
  }
}
</script>

<template>
  <NForm ref="formRef" :model="registerForm" :rules="step1Rules" label-width="80">
    <!-- 邮箱输入 -->
    <NFormItem label="邮箱地址" path="email">
      <NInput
        v-model:value="registerForm.email" placeholder="示例：yourname@example.com" :input-props="{
          'autocomplete': 'email',
          'inputmode': 'email',
          'aria-describedby': 'email-hint',
          'spellcheck': 'false',
        }"
      >
        <template #prefix>
          <NIcon :component="ionicons5.MailOutline" class="text-gray-400" />
        </template>
      </NInput>
    </NFormItem>

    <!-- 密码输入 -->
    <NFormItem label="设置密码" path="password">
      <NInput
        v-model:value="registerForm.password" type="password" placeholder="8-20位字母+数字组合" :input-props="{
          'autocomplete': 'new-password',
          'aria-describedby': 'password-hint',
        }"
      >
        <template #prefix>
          <NIcon :component="ionicons5.LockClosed" class="text-gray-400" />
        </template>
      </NInput>
    </NFormItem>

    <!-- 确认密码 -->
    <NFormItem label="确认密码" path="confirmPassword">
      <NInput
        v-model:value="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" :input-props="{
          'autocomplete': 'new-password',
          'aria-describedby': 'confirm-password-hint',
        }"
      >
        <template #prefix>
          <NIcon :component="ionicons5.LockClosed" class="text-gray-400" />
        </template>
      </NInput>
    </NFormItem>

    <!-- 验证码 -->
    <NFormItem label="邮箱验证码" path="verificationCode">
      <div class="grid grid-cols-3 w-full gap-2">
        <NInput
          v-model:value="registerForm.verificationCode" class="col-span-2" placeholder="6位数字验证码" :input-props="{
            'autocomplete': 'one-time-code',
            'inputmode': 'numeric',
            'pattern': '[0-9]*',
            'maxlength': 6,
            'aria-describedby': 'code-hint',
          }"
        >
          <template #prefix>
            <NIcon :component="ionicons5.Key" class="text-gray-400" />
          </template>
        </NInput>
        <NButton class="col-span-1" :disabled="isSending" type="primary" @click="sendVerificationCode">
          {{ isSending ? `${countdown}s` : '获取验证码' }}
        </NButton>
      </div>
    </NFormItem>

    <!-- 提交按钮 -->
    <NFormItem :show-label="false">
      <NButton type="primary" class="mt-4 w-full" size="large" @click="handleRegister">
        立即注册
      </NButton>
    </NFormItem>
  </NForm>

  <!-- 图形验证码弹窗 -->
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
