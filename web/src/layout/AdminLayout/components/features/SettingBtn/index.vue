<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-31 14:46:14
 * @LastEditTime: 2025-07-31 16:00:07
-->
<script lang='ts' setup>
import CONFIG from '@/settings'

const { isMobile } = useResponsive()

const themeSettingKey = inject(ThemeSettingKey)
function openSettingClick() {
  if (!themeSettingKey)
    return
  themeSettingKey.openThemeSetting()
}
</script>

<template>
  <div v-show="!isMobile && CONFIG.app.showSettingDrawer" class="setting-container">
    <div
      class="active:btn-active fixed right-3 top-80% z-3 h-12 w-12 base-ani cursor-pointer rounded-[var(--custom-border-radius)] bg-[var(--custom-primary-color)] shadow-md"
      @click="openSettingClick"
    >
      <div class="wh-full flex-center">
        <div class="rotate-icon i-mdi-cog h-8 w-8 color-[var(--custom-base-color)]"></div>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.setting-container {

  // 旋转
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .rotate-icon {
    animation: rotate 16s linear infinite;
  }
}
</style>
