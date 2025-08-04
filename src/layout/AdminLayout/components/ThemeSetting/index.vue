<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-01-28 15:03:29
 * @LastEditTime: 2025-07-16 10:19:00
-->
<script lang="ts" setup>
import type { IUserThemeMode } from '@/theme'
import { themeLoadingStyles } from '@/layout/AdminLayout/components/NetworkRequest'
import { themeDoms, themes, useThemeStore } from '@/theme'
import BaseWatermark from '@/views/admin/showcase/watermark/BaseWatermark.vue'

const themeStore = useThemeStore()
const globalStore = useGlobalStore()
const networkRequestStore = useNetworkRequestStore()

const show = ref(false)

function toggleDialog(state?: boolean) {
  show.value = state ?? !show.value
}
/* 色调 */
function handleConfirm(value: string) {
  console.info('自定义色调', value)
  themeStore.setCustomPrimaryColor(value)
}

/* 页面切换动画 */
const transitionNames = [
  { label: '滑动', class: 'fade-slide' },
  { label: '淡入淡出', class: 'fade' },
  { label: '向右滑动', class: 'slide-left' },
  { label: '向左滑动', class: 'slide-right' },
  { label: '缩放', class: 'zoom' },
  { label: '翻转', class: 'flip' },
]

defineExpose({
  toggleDialog,
})
</script>

<template>
  <NDrawer v-model:show="show" :width="320">
    <NDrawerContent title="设置" :native-scrollbar="false">
      <!-- 主题 -->
      <NDivider title-placement="center">
        主题
      </NDivider>
      <BSpace class="settings" vertical align="center">
        <div class="w-full">
          <NTabs
            type="segment" :value="themeStore.userThemeMode" animated
            @update:value="(val: IUserThemeMode) => themeStore.setUserThemeMode(val)"
          >
            <NTab v-for="item in themeDoms" :key="item.id" :name="item.value">
              <div class="flex-center gap-x-[3px]">
                <div :class="item.icon"></div>
                <div>{{ item.label }}</div>
              </div>
            </NTab>
          </NTabs>
        </div>
      </BSpace>

      <!-- 主色调 -->
      <NDivider title-placement="center">
        主色调
      </NDivider>
      <BSpace class="w-full" vertical>
        <!-- 切换预设主题 -->
        <div class="flex flex-wrap gap-[10px]">
          <template v-for="item in themes.filter((item) => item.showMenu)" :key="item.id">
            <NTooltip placement="top" trigger="hover">
              <template #trigger>
                <div
                  class="active:btn-active h-[24px] w-[24px] base-ani cursor-pointer border-[1px] rounded-[4px] border-solid hover:btn-hover p-[2px]"
                  :class="{
                    'border-[var(--custom-primary-color)]': themeStore.themeColorId === item.id,
                    'border-[var(--custom-border-color)]': themeStore.themeColorId !== item.id,
                    'btn-select': themeStore.themeColorId === item.id,
                  }" @click="themeStore.setThemeColorScheme(item.id)"
                >
                  <div
                    class="h-100% w-100% rounded-[4px]"
                    :style="{ backgroundColor: `${item.options[themeStore.themeMode].custom.primaryColor}` }"
                  />
                </div>
              </template>
              <span>{{ item.label }}</span>
            </NTooltip>
          </template>
        </div>
        <!-- 自定义主题 -->
        <NColorPicker
          :default-value="themeStore.getCustomOptions.primaryColor" :show-alpha="false"
          :actions="['confirm']" @confirm="handleConfirm"
        />
      </BSpace>

      <!-- 页面水印 -->
      <NDivider title-placement="center">
        页面水印
      </NDivider>
      <BaseWatermark orientation="horizontal"></BaseWatermark>

      <!-- 页面切换动画类名 -->
      <NDivider title-placement="center">
        页面切换动画
      </NDivider>
      <NRadioGroup
        :value="globalStore.getTransitionName" name="radiogroup"
        @update:value="globalStore.setTransitionName"
      >
        <NSpace>
          <NRadio v-for="item in transitionNames" :key="item.class" :value="item.class">
            {{ item.label }}
          </NRadio>
        </NSpace>
      </NRadioGroup>

      <!-- 网络请求效果 -->
      <NDivider title-placement="center">
        网络请求效果
      </NDivider>
      <div class="flex justify-between">
        <NRadioGroup
          :value="networkRequestStore.getThemeLoadingStyle" name="radiogroup"
          @update:value="networkRequestStore.setThemeModeLoadingStyle"
        >
          <NSpace>
            <NRadio v-for="item in themeLoadingStyles" :key="item.value" :value="item.value">
              {{ item.label }}
            </NRadio>
          </NSpace>
        </NRadioGroup>
      </div>

      <!-- 填充 -->
      <div class="h-200px w-full"></div>
    </NDrawerContent>
  </NDrawer>
</template>
