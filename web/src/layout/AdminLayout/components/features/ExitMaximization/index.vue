<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-16 13:50:22
 * @LastEditTime: 2025-07-14 17:15:22
-->
<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

const tabsViewStore = useTabsViewStore()
// 路由变化监听
const router = useRouter()
router.afterEach(() => {
  tabsViewStore.toggleMaximize(false)
})
// 添加键盘事件
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && tabsViewStore.getIsMaximized) {
    tabsViewStore.toggleMaximize(false)
  }
})
</script>

<template>
  <button class="quarter-circle-button" @click="tabsViewStore.toggleMaximize(false)">
    <div class="btn-box icon-base--lg i-mdi-fullscreen-exit text-[var(--custom-text-color-3)]"></div>
  </button>
</template>

<style scoped>
.quarter-circle-button {
  position: fixed;
  top: 0;
  right: 0;
  width: 50px;
  height: 50px;
  border: none;
  background: var(--custom-button-color-2-pressed);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 6px;
  border-radius: 0 0 0 100%;

}

.quarter-circle-button:hover {
  background: var(--custom-button-color-2);
  transform: scale(1.05);
}

.btn-box {
  position: absolute;
  right: 10px;
  top: 10px;
}

/* 手机端适配 */

@media (width <=768px) {
  .quarter-circle-button {
    width: 40px;
    height: 40px;
  }

  .btn-box {
    right: 6px;
    top: 6px;
  }
}
</style>
