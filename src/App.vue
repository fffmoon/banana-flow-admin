<!--
  * @Author: Qing
  * @Description: 主应用
  * @Date: 2024-06-21 20:09:25
 * @LastEditTime: 2025-04-02 14:07:08
-->
<script setup lang="ts">
import SuspenseFallback from '@/components/SuspenseFallback/index.vue'
import WaterMark from '@/components/WaterMark/index.vue'
import { useThemeStore } from '@/theme'
import { darkTheme } from 'naive-ui'

const themeStore = useThemeStore()
const { getNaiveuiLocale }
  = useLocale()
themeStore.initTheme()
const getTheme = computed(() => (themeStore.getIsDarkTheme
  ? darkTheme
  : undefined))
</script>

<template>
  <NConfigProvider
    class="wh-full" :locale="getNaiveuiLocale.options" :date-locale="getNaiveuiLocale.dateOptions"
    :theme="getTheme" :theme-overrides="themeStore.getNaiveuiOptions"
  >
    <BMessageProvider>
      <NDialogProvider>
        <NNotificationProvider :max="3">
          <Suspense>
            <main>
              <WaterMark />
              <RouterView />
            </main>

            <template #fallback>
              <SuspenseFallback />
            </template>
          </Suspense>
        </NNotificationProvider>
      </NDialogProvider>
      <NGlobalStyle />
    </BMessageProvider>
  </NConfigProvider>
</template>
