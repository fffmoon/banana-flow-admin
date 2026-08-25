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
import { LoginParams, LoginType } from '@stores/user'

const { t } = useLocale()
const userStore = useUserStore()
const message = useMessage()
const route = useRoute()

const formRef = ref<FormInst | null>(null)
const loginForm = reactive({
  username: route.query?.username?.[0] ?? 'superAdmin',
  password: '123456',
})

const isLoading = ref(false)
let messageReactive: IMessageInstance | null = null

// 登录处理函数
async function handleLogin() {
  const { username, password } = loginForm
  if (!username || !password) {
    message.error(t('login.emptyAccountWarning'))
    return
  }
  if (isLoading.value)
    return
  isLoading.value = true
  messageReactive = message.loading(t('login.signingIn'), { duration: 0 })
  try {
    await userStore.login('accountName', loginForm)
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
async function handleLoginWithAccount(type: LoginType, params: LoginParams) {
  messageReactive = message.loading(t('login.signingIn'), { duration: 0 })
  isLoading.value = true
  try {
    await userStore.login(type, params)
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
    <NFormItem :label="t('login.account')" path="username">
      <NInput v-model:value="loginForm.username" :disabled="isLoading" :placeholder="t('login.inputUsername')" class="mb-10px" clearable
        :input-props="{
          autocomplete: 'tel',
          inputmode: 'tel',
        }" maxlength="30">
        <template #prefix>
          <NIcon :component="ionicons5.Person" />
          <!-- ionicons5.Mail ionicons5.PhonePortraitSharp  -->
        </template>
      </NInput>
    </NFormItem>

    <NFormItem :label="t('login.password')" path="password">
      <NInput v-model:value="loginForm.password" :disabled="isLoading" type="password" :placeholder="t('login.inputPassword')"
        class="mb-10px" show-password-on="click" maxlength="30" :input-props="{
          'autocomplete': 'current-password',
          'aria-describedby': 'password-hint',
        }" @keyup.enter="handleLogin">
        <template #prefix>
          <NIcon :component="ionicons5.LockClosed" />
        </template>
      </NInput>
    </NFormItem>

    <NFormItem>
      <NButton :loading="isLoading" type="primary" class="w-full"
        :class="[isLoading ? 'cursor-wait pointer-events-auto' : '']" native-type="submit" @click="handleLogin">
        {{ isLoading ? t('login.signingInDots') : t('login.signIn') }}
      </NButton>
    </NFormItem>
  </NForm>
</template>