<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-10 23:23:50
 * @LastEditTime: 2025-03-28 13:20:36
-->
<script lang='ts' setup>
import CONFIG from '@/settings'
import Sider from '../Sider/index.vue'

const showDrawer = ref<boolean>(false)
function toggleVisible(value?: boolean) {
  showDrawer.value = value ?? !showDrawer.value
}

const width = ref<number>(CONFIG.menu.mainMenuWidth + CONFIG.menu.subMenuWidth)
function emitUpdateSubMenuStatus(status: boolean) {
  width.value = status ? CONFIG.menu.mainMenuWidth + CONFIG.menu.subMenuWidth : CONFIG.menu.mainMenuWidth
}

defineExpose({ toggleVisible })
</script>

<template>
  <NDrawer v-model:show="showDrawer" placement="left" :width="width" display-directive="show">
    <div class="scroll-none h-full w-full overflow-auto">
      <Sider
        :collapsed="false" :hidden-menu-button="true" @update-active-menu-key="() => showDrawer = false"
        @update-sub-menu-status="emitUpdateSubMenuStatus"
      />
    </div>
  </NDrawer>
</template>
