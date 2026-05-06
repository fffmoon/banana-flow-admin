<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-01-28 15:03:29
 * @LastEditTime: 2025-07-16 10:19:00
-->
<script lang="ts" setup>
import type { IUserThemeMode } from '@/theme'
import { themeLoadingStyles } from '@/layout/AdminLayout/components/features/NetworkRequest'
import { useThemeStore } from '@/theme'
import BaseWatermark from '@/views/tools/showcase/watermark/BaseWatermark.vue'

// 由于您启用了 auto-import，直接使用 useLocale 即可
const { t } = useLocale()

const themeStore = useThemeStore()
const globalStore = useGlobalStore()
const networkRequestStore = useNetworkRequestStore()

const show = ref(false)

function toggleDialog(state?: boolean) {
  show.value = state ?? !show.value
}
/* 色调 */
function handleConfirm(value: string) {
  console.info(t('settings.customColor'), value)
  themeStore.setCustomPrimaryColor(value)
}

/* 页面切换动画：使用 computed 保证语言切换时的响应性 */
const transitionNames = computed(() => [
  { label: t('settings.transition.slide'), class: 'fade-slide' },
  { label: t('settings.transition.fade'), class: 'fade' },
  { label: t('settings.transition.slideRight'), class: 'slide-left' },
  { label: t('settings.transition.slideLeft'), class: 'slide-right' },
  { label: t('settings.transition.zoom'), class: 'zoom' },
  { label: t('settings.transition.flip'), class: 'flip' },
])

defineExpose({
  toggleDialog,
})

/* 导航栏模式 */

interface LayoutOption {
  value: Settings.LayoutMode
  label: string
}

const layoutOptions = computed<LayoutOption[]>(() => [
  { value: 'vertical-mixed', label: t('settings.layout.verticalMixed') },
  { value: 'classic', label: t('settings.layout.classic') },
  { value: 'sidebar', label: t('settings.layout.sidebar') },
  // { value: 'vertical', label: t('settings.layout.vertical') },
  /* { value: 'top', label: t('settings.layout.top') },
  { value: 'mixed', label: t('settings.layout.mixed') },
  { value: 'top-mixed', label: t('settings.layout.topMixed') }, */
])

// 切换处理
const handleSelect = (mode: Settings.LayoutMode) => globalStore.menu.mode = mode

const themesToShow = computed(() => themeStore.themeColorOptions.filter((item) => item.showMenu))

const themeModeOptions = computed(() => themeStore.themeModeOptions)

/* 主题loading风格选项 */
const themeLoadingStylesOptions = computed(() => themeLoadingStyles.map((item) => ({ label: t(`loading.labels.${item.label}`), value: item.value })))
</script>

<template>
  <NDrawer v-model:show="show" :width="320">
    <NDrawerContent :title="t('settings.title')" :native-scrollbar="false">
      <!-- 主题 -->
      <NDivider title-placement="center">
        {{ t('settings.theme') }}
      </NDivider>
      <BSpace class="settings" vertical align="center">
        <div class="w-full">
          <NTabs type="segment" :value="themeStore.userThemeMode" animated
            @update:value="(val: IUserThemeMode) => themeStore.setUserThemeMode(val)">
            <NTab v-for="item in themeModeOptions" :key="item.id" :name="item.value">
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
        {{ t('settings.primaryColor') }}
      </NDivider>
      <BSpace class="w-full" vertical>
        <!-- 切换预设主题 -->
        <div class="flex flex-wrap gap-[10px]">
          <template v-for="item in themesToShow" :key="item.id">
            <NTooltip placement="top" trigger="hover">
              <template #trigger>
                <div
                  class="active:btn-active h-[24px] w-[24px] base-ani cursor-pointer border-[1px] rounded-[4px] border-solid hover:btn-hover p-[2px]"
                  :class="{
                    'border-[var(--custom-primary-color)]': themeStore.themeColorId === item.id,
                    'border-[var(--custom-border-color)]': themeStore.themeColorId !== item.id,
                    'btn-select': themeStore.themeColorId === item.id,
                  }" @click="themeStore.setColorTheme(item.id)">
                  <div class="h-100% w-100% rounded-[4px]"
                    :style="{ backgroundColor: `${item.options[themeStore.themeMode].custom.primaryColor}` }" />
                </div>
              </template>
              <span>{{ item.label }}</span>
            </NTooltip>
          </template>
        </div>
        <!-- 自定义主题 -->
        <NColorPicker :default-value="themeStore.getCustomOptions.primaryColor" :show-alpha="false"
          :actions="['confirm']" @confirm="handleConfirm" />
      </BSpace>

      <!-- 导航栏模式 -->
      <NDivider title-placement="center">
        {{ t('settings.navbarMode') }}
      </NDivider>

      <BSpace class="w-full" vertical>
        <!-- 布局选择区容器：使用 Flex 居中并自动换行 -->
        <div class="flex flex-wrap justify-center gap-6 py-4">
          <template v-for="item in layoutOptions" :key="item.value">
            <NTooltip trigger="hover">
              <template #trigger>
                <!-- 单个选项卡片 -->
                <div
                  class="relative box-border h-12 w-20 cursor-pointer overflow-hidden border-2 rounded-lg border-solid bg-[var(--custom-base-color)] shadow-sm transition-all duration-200"
                  :class="[
                    globalStore.menu.mode === item.value
                      ? 'border-[var(--custom-primary-color)] ring-2 ring-[var(--custom-primary-color)]/20'
                      : 'border-[var(--custom-border-color)] hover:border-[var(--custom-primary-color-hover)] hover:shadow',
                  ]" @click="handleSelect(item.value)">
                  <!-- 1. 侧边栏混合模式: 左深窄 | 左浅宽 | 右虚线 -->
                  <div v-if="item.value === 'vertical-mixed'" class="h-full w-full flex gap-1 p-1">
                    <div class="h-full w-2 rounded-l-sm bg-[var(--custom-primary-color)]"></div>
                    <div class="h-full w-5 rounded-sm bg-[var(--custom-primary-color-hover)]/80"></div>
                    <div
                      class="h-full flex-1 border border-[var(--custom-primary-color)]/60 rounded-sm border-dashed bg-[var(--custom-primary-color-suppl)]">
                    </div>
                  </div>

                  <!-- 2. 经典模式 (图示选中项): 上深 | 下(左浅+右虚线) -->
                  <div v-else-if="item.value === 'classic'" class="h-full w-full flex flex-col gap-1 p-1">
                    <div class="h-3.5 w-full rounded-t-sm bg-[var(--custom-primary-color)]"></div>
                    <div class="w-full flex flex-1 gap-1 overflow-hidden">
                      <div class="h-full w-6 rounded-bl-sm bg-[var(--custom-primary-color-hover)]/80"></div>
                      <div
                        class="h-full flex-1 border border-[var(--custom-primary-color)]/60 rounded-br-sm border-dashed bg-[var(--custom-primary-color-suppl)]">
                      </div>
                    </div>
                  </div>

                  <!-- 3. 侧边栏模式: 左浅宽 | 右虚线 -->
                  <div v-else-if="item.value === 'sidebar'" class="h-full w-full flex gap-1 p-1">
                    <div class="h-full w-7 rounded-l-sm bg-[var(--custom-primary-color-hover)]/80"></div>
                    <div
                      class="h-full flex-1 border border-[var(--custom-primary-color)]/60 rounded-r-sm border-dashed bg-[var(--custom-primary-color-suppl)]">
                    </div>
                  </div>

                  <!-- 4. 极简侧边栏: 左深窄 | 右虚线 -->
                  <div v-else-if="item.value === 'vertical'" class="h-full w-full flex gap-1 p-1">
                    <div class="h-full w-2.5 rounded-l-sm bg-[var(--custom-primary-color)]"></div>
                    <div
                      class="h-full flex-1 border border-[var(--custom-primary-color)]/60 rounded-r-sm border-dashed bg-[var(--custom-primary-color-suppl)]">
                    </div>
                  </div>

                  <!-- 5. 顶栏模式: 上深 | 下虚线 -->
                  <div v-else-if="item.value === 'top'" class="h-full w-full flex flex-col gap-1 p-1">
                    <div class="h-3.5 w-full rounded-t-sm bg-[var(--custom-primary-color)]"></div>
                    <div
                      class="w-full flex-1 border border-[var(--custom-primary-color)]/60 rounded-b-sm border-dashed bg-[var(--custom-primary-color-suppl)]">
                    </div>
                  </div>

                  <!-- 6. 分栏布局: 左深窄 | 右虚线(含内嵌块) -->
                  <div v-else-if="item.value === 'mixed'" class="h-full w-full flex gap-1 p-1">
                    <div class="h-full w-2.5 rounded-l-sm bg-[var(--custom-primary-color)]"></div>
                    <div
                      class="h-full flex flex-1 items-center justify-center border border-[var(--custom-primary-color)]/60 rounded-r-sm border-dashed bg-[var(--custom-primary-color-suppl)]">
                      <div class="h-5 w-8 rounded-sm bg-[var(--custom-primary-color-hover)]/60"></div>
                    </div>
                  </div>

                  <!-- 7. 顶栏混合: 上深 | 下虚线(含内嵌块) -->
                  <div v-else-if="item.value === 'top-mixed'" class="h-full w-full flex flex-col gap-1 p-1">
                    <div class="h-3.5 w-full rounded-t-sm bg-[var(--custom-primary-color)]"></div>
                    <div
                      class="w-full flex flex-1 items-center justify-center border border-[var(--custom-primary-color)]/60 rounded-b-sm border-dashed bg-[var(--custom-primary-color-suppl)]">
                      <div class="h-5 w-10 rounded-sm bg-[var(--custom-primary-color-hover)]/60"></div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- Tooltip 内容 -->
              {{ item.label }}
            </NTooltip>
          </template>
        </div>
      </BSpace>

      <!-- 页面水印 -->
      <NDivider title-placement="center">
        {{ t('settings.watermark') }}
      </NDivider>
      <BaseWatermark orientation="horizontal"></BaseWatermark>

      <!-- 页面切换动画类名 -->
      <NDivider title-placement="center">
        {{ t('settings.pageTransition') }}
      </NDivider>
      <NRadioGroup :value="globalStore.getTransitionName" name="radiogroup"
        @update:value="globalStore.setTransitionName">
        <NSpace>
          <NRadio v-for="item in transitionNames" :key="item.class" :value="item.class">
            {{ item.label }}
          </NRadio>
        </NSpace>
      </NRadioGroup>

      <!-- 网络请求效果 -->
      <NDivider title-placement="center">
        {{ t('settings.networkRequest') }}
      </NDivider>
      <div class="flex justify-between">
        <NRadioGroup :value="networkRequestStore.getThemeLoadingStyle" name="radiogroup"
          @update:value="networkRequestStore.setThemeModeLoadingStyle">
          <NSpace>
            <NRadio v-for="item in themeLoadingStylesOptions" :key="item.value" :value="item.value">
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