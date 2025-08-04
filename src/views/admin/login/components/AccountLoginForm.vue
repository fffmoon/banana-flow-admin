<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-21 18:39:22
 * @LastEditTime: 2025-04-21 15:09:18
-->
<script lang='ts' setup>
import type { IMessageInstance } from '@ui/BetterUI'
import type { FormInst } from 'naive-ui'
import * as ionicons5 from '@vicons/ionicons5'

const userStore = useUserStore()
const message = useMessage()
const route = useRoute()

const formRef = ref<FormInst | null>(null)
const loginForm = reactive({
  username: route.query?.username?.[0] ?? '',
  password: '',
})

const isLoading = ref(false)
let messageReactive: IMessageInstance | null = null

// 登录处理函数
async function handleLogin() {
  const { username, password } = loginForm
  if (!username || !password) {
    message.error('账号或者密码不能为空')
    return
  }
  if (isLoading.value)
    return
  isLoading.value = true
  messageReactive = message.loading('登录中', { duration: 0 })
  try {
    const isEmail = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(username)
    const type = isEmail ? 'emailPassword' : 'mobilePassword'
    await userStore.login(type, loginForm)
    isLoading.value = false
    messageReactive?.destroy()
  }
  catch (error) {
    console.error(error)
    isLoading.value = false
    messageReactive?.destroy()
  }
}

// 使用指定账号登录
async function handleLoginWithAccount({ username, password }: { username: string, password: string }) {
  messageReactive = message.loading('登录中', { duration: 0 })
  isLoading.value = true
  try {
    const isEmail = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(username)
    const type = isEmail ? 'emailPassword' : 'mobilePassword'
    await userStore.login(type, { username, password })
  }
  catch (error) {
    console.error(error)
  }
  isLoading.value = false
  messageReactive?.destroy()
}

defineExpose({
  handleLoginWithAccount,
})
</script>

<template>
  <NForm ref="formRef" :model="loginForm" label-width="80" :show-feedback="false">
    <NFormItem label="手机/邮箱" path="username">
      <NInput
        v-model:value="loginForm.username" :disabled="isLoading" placeholder="请输入手机号或邮箱" class="mb-10px" clearable
        :input-props="{
          autocomplete: 'tel',
          inputmode: 'tel',
        }" maxlength="30"
      >
        <template #prefix>
          <NIcon
            :component="loginForm.username.includes('@')
              ? ionicons5.Mail
              : ionicons5.PhonePortraitSharp"
          />
          <!-- <div class="icon-base--md i-mdi-email"></div> -->
        </template>
      </NInput>
    </NFormItem>

    <NFormItem label="密码" path="password">
      <NInput
        v-model:value="loginForm.password" :disabled="isLoading" type="password" placeholder="请输入密码"
        class="mb-10px" show-password-on="click" maxlength="30" :input-props="{
          'autocomplete': 'current-password',
          'aria-describedby': 'password-hint',
        }" @keyup.enter="handleLogin"
      >
        <template #prefix>
          <NIcon :component="ionicons5.LockClosed" />
        </template>
      </NInput>
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
</template>
