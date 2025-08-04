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
async function handleDemoLogin(type: 'admin' | 'user') {
  isLogin.value = true
  loginTabValue.value = 'account'

  if (!accountLoginFormRef.value) {
    await delay(1000 * 0.3)
  }
  nextTick(() => {
    if (type === 'admin') {
      accountLoginFormRef.value?.handleLoginWithAccount({
        username: '13812345678',
        password: '123456',
      })
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
        <img
          src="https://img.dashixiong.asia/2025/04/7467aed7bd9c2a21ea4bcaf0916ae782.png" :alt="name"
          class="h-40px w-40px"
        >
        <!-- <div :alt="name" class="text-28px">🍌</div> -->
        <div class="stand-title">
          {{ t('app.title') }}
        </div>
      </div>
      <div class="pt-36px text-center text-[1.5rem] text-[var(--custom-text-color-1)] font-600">
        开箱即用，后台、前端、设计师的解决方案
      </div>
      <div class="pt-36px text-center text-[1.1rem] text-[var(--custom-text-color-2)]">
        多生态支持、功能丰富、高颜值模板
      </div>
      <div class="mx-auto mb-0px mt-50px h-auto max-w-440px w-40%">
        <img
          src="https://img.dashixiong.asia/2025/04/eac334aef7d98bc0c63b57a561308181.png" alt=""
          class="block h-auto max-w-full"
        >
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
                  登录你的账户
                </div>
                <div>
                  <span class="mr-4px text-[var(--custom-text-color-2)]">没有账户？</span>
                  <NButton type="primary" text @click="isLogin = false">
                    去注册
                  </NButton>
                </div>
              </div>
              <NTabs type="segment" animated :value="loginTabValue">
                <NTabPane name="account" tab="账号登录">
                  <AccountLoginForm ref="accountLoginFormRef" />
                </NTabPane>
                <NTabPane name="sms" tab="短信登录">
                  <PhoneLoginForm />
                </NTabPane>
              </NTabs>
            </template>

            <!-- 注册 -->
            <template v-else>
              <div class="m-y-20px text-left">
                <div class="form-title">
                  注册你的账户
                </div>
                <div>
                  <span>已经有账户？</span>
                  <NButton type="primary" text @click="isLogin = true">
                    去登录
                  </NButton>
                </div>
              </div>
              <NTabs type="segment" animated>
                <NTabPane name="chap1" tab="手机号注册">
                  <PhoneRegister />
                </NTabPane>
                <NTabPane name="chap2" tab="邮箱注册">
                  <EmailRegister />
                </NTabPane>
              </NTabs>
            </template>
          </div>
        </Transition>

        <!-- 使用演示账号直接登录 -->
        <NDivider>
          <template #default>
            <span class="text-14px text-[var(--custom-text-color-3)]">使用演示账号直接登录</span>
          </template>
        </NDivider>
        <div class="pb-8">
          <NSpace justify="space-around">
            <NTooltip placement="top">
              <template #trigger>
                <NButton
                  class="hover:shadow-md transition-transform! duration-248! hover:scale-110!" ghost circle
                  @click="handleDemoLogin('admin')"
                >
                  <template #icon>
                    <div class="i-mdi-shield-account" />
                  </template>
                </NButton>
              </template>
              使用管理员账号登录
            </NTooltip>

            <NTooltip placement="top">
              <template #trigger>
                <NButton
                  class="hover:shadow-md transition-transform! duration-248! hover:scale-110!" ghost circle
                  @click="handleDemoLogin('admin')"
                >
                  <template #icon>
                    <div class="i-mdi-account-outline" />
                  </template>
                </NButton>
              </template>
              使用普通用户登录
            </NTooltip>
          </NSpace>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  .login-section {
    --at-apply: "m-0 flex-row flex-grow-0";
  }

  .banner {
    --at-apply: "w-full flex items-center flex-col justify-center py-4 px-2 bg-[var(--custom-body-color)]";

    .stand-title {
      --at-apply: "text-28px font-600 leading-[1.25]";

      flex-basis: 75%;
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
