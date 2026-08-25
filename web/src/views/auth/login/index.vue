<!--
  * @Author: Qing
  * @Description: 登录页面
  * @Date: 2025-01-26 21:22:26
 * @LastEditTime: 2025-05-21 15:38:35
-->
<script lang="ts" setup>
import pkg from '@/../package.json'
import FloatMenu from '@/components/FloatMenu/index.vue'
import { useThemeStore } from '@/theme'
import AccountLoginForm from './components/AccountLoginForm.vue'
import EmailRegister from './components/EmailRegister.vue'
import PhoneLoginForm from './components/PhoneLoginForm.vue'
import PhoneRegister from './components/PhoneRegister.vue'

const { t } = useLocale()
const themeStore = useThemeStore()
const { name } = pkg
const { isMobile } = useResponsive()
const loginTabValue = ref<'account' | 'sms'>()
const isLogin = ref(true)
const userStore = useUserStore()

// 动态生成左边背景的渐变颜色
const bannerBackground = computed(() => {
  const color = themeStore.getCustomOptions.adminContentColor
  if (!color)
    return ''
  // 修改方向控制逻辑
  const gradientDirection = isMobile.value ? '180deg' : '90deg'
  return `linear-gradient(${gradientDirection}, ${lighten(color, 20)} 0%, ${lighten(color, 10)} 50%, ${color} 100%)`
})

const accountLoginFormRef = ref<InstanceType<typeof AccountLoginForm>>()

// 一键登录
async function handleDemoLogin(type: 'superAdmin' | 'admin' | 'user') {
  isLogin.value = true
  loginTabValue.value = 'account'

  if (!accountLoginFormRef.value) {
    await delay(1000 * 0.3)
  }
  nextTick(() => {
    if (type === 'superAdmin') {
      accountLoginFormRef.value?.handleLoginWithAccount('accountName', { username: 'superAdmin', password: '123456' })
    } else if (type === 'admin') {
      accountLoginFormRef.value?.handleLoginWithAccount('accountName', { username: 'admin', password: '123456' })
    } else {
      accountLoginFormRef.value?.handleLoginWithAccount('accountName', { username: 'user', password: '123456' })
    }
  })
}
</script>

<template>
  <div class="login-container h-100vh w-full flex flex-row flex-wrap bg-[var(--custom-body-color)]">
    <FloatMenu class="fixed right-4 top-4" />
    <!-- 左侧部分 -->
    <div class="login-section banner" :style="{ background: bannerBackground }">
      <div class="flex items-center justify-center gap-4 pt-36px">
        <img src="/logo.png" :alt="name" class="h-40px w-40px">
        <div class="stand-title">
          {{ t('app.title') }}
        </div>
      </div>
      <div class="pt-36px text-center text-[1.5rem] text-[var(--custom-text-color-1)] font-600">
        {{ t('login.slogan1') }}
      </div>
      <div class="pt-36px text-center text-[1.1rem] text-[var(--custom-text-color-2)]">
        {{ t('login.slogan2') }}
      </div>
      <div class="mx-auto mb-0px mt-50px h-auto max-w-440px w-40%">
        <img src="https://img.dashixiong.site/2025/04/eac334aef7d98bc0c63b57a561308181.png" alt=""
          class="block h-auto max-w-full">
      </div>
    </div>

    <!-- 右侧部分 -->
    <div class="login-section form-container p-12">
      <div class="w-full">
        <Transition name="fade-transform" mode="out-in" :duration="{ enter: 300, leave: 200 }">
          <div :key="isLogin ? 'login' : 'register'">
            <!-- 登录 -->
            <template v-if="isLogin">
              <div class="m-y-20px text-left">
                <div class="form-title">
                  {{ t('login.loginAccount') }}
                </div>
                <div>
                  <span class="mr-4px text-[var(--custom-text-color-2)]">{{ t('login.noAccount') }}</span>
                  <NButton type="primary" text @click="isLogin = false">
                    {{ t('login.goRegister') }}
                  </NButton>
                </div>
              </div>
              <NTabs type="segment" animated :value="loginTabValue">
                <NTabPane name="account" :tab="t('login.accountLogin')">
                  <AccountLoginForm ref="accountLoginFormRef" />
                </NTabPane>
                <NTabPane name="sms" :tab="t('login.smsLogin')">
                  <PhoneLoginForm />
                </NTabPane>
              </NTabs>
            </template>

            <!-- 注册 -->
            <template v-else>
              <div class="m-y-20px text-left">
                <div class="form-title">
                  {{ t('login.registerAccount') }}
                </div>
                <div>
                  <span>{{ t('login.hasAccount') }}</span>
                  <NButton type="primary" text @click="isLogin = true">
                    {{ t('login.goLogin') }}
                  </NButton>
                </div>
              </div>
              <NTabs type="segment" animated>
                <NTabPane name="chap1" :tab="t('login.phoneRegister')">
                  <PhoneRegister />
                </NTabPane>
                <NTabPane name="chap2" :tab="t('login.emailRegister')">
                  <EmailRegister />
                </NTabPane>
              </NTabs>
            </template>
          </div>
        </Transition>

        <!-- 使用演示账号直接登录 -->
        <NDivider>
          <template #default>
            <span class="text-14px text-[var(--custom-text-color-3)]">{{ t('login.demoLogin') }}</span>
          </template>
        </NDivider>
        <div class="pb-8">
          <NSpace justify="space-around">
            <NButton class="hover:shadow-md transition-transform! duration-248! hover:scale-110!" ghost size="small"
              @click="handleDemoLogin('superAdmin')">
              {{ t('login.superAdmin') }}
            </NButton>
            <NButton class="hover:shadow-md transition-transform! duration-248! hover:scale-110!" ghost size="small"
              @click="handleDemoLogin('admin')">
              {{ t('login.admin') }}
            </NButton>
            <NButton class="hover:shadow-md transition-transform! duration-248! hover:scale-110!" ghost size="small"
              @click="handleDemoLogin('user')">
              {{ t('login.normalUser') }}
            </NButton>
          </NSpace>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 保持原有样式不变 */
.login-container {
  .login-section {
    --at-apply: "m-0 flex-row flex-grow-0";
  }

  .banner {
    --at-apply: "w-full flex items-center flex-col justify-center py-4 px-2 bg-[var(--custom-body-color)]";

    .stand-title {
      --at-apply: "text-28px font-600 leading-[1.25]";

      flex-basis: 96%;
      background: linear-gradient(92.06deg,
          hsl(0deg 92% 72%) 0%,
          hsl(30deg 92% 72%) 15%,
          hsl(55deg 92% 78%) 35%,
          hsl(145deg 92% 72%) 65%,
          hsl(210deg 92% 72%) 85%,
          hsl(275deg 92% 72%) 100%);
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .form-container {
    --at-apply: "flex-1 bg-[var(--custom-body-color)] box-border flex flex-row flex-wrap justify-center items-center";

    .form-title {
      --at-apply: "font-[SourceHanSansCN_Bold] text-[var(--custom-text-color-1)] text-[1.5rem] leading-30px mb-6px";
    }
  }
}

/* 新增动画样式 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
  transform-origin: center top;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-transform-enter-to,
.fade-transform-leave-from {
  opacity: 1;
  transform: translateY(0);
}

// 移动优先，增强大屏幕

@media screen and (min-width: $breakpoint-md) {
  .login-container {
    --at-apply: "flex flex-nowrap";

    .banner {
      --at-apply: "flex-auto mt-0";
    }

    .form-container {
      --at-apply: "flex-[0_0_500px] mx-5vh";

    }
  }
}
</style>