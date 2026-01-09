<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-10 23:23:50
 * @LastEditTime: 2025-03-28 13:20:36
-->
<script lang='ts' setup>
import CONFIG from '@/settings'
import { useNaiveMenu } from '../../js/useNaiveMenu'
import Sider from '../Sider/index.vue'
import SubMenu from '../SubMenu/index.vue'

const { naiveMixSubMenus } = useNaiveMenu()
const menuStore = useMenuStore()

// 计算宽度
const drawerWidth = computed(() => {
  const subWidth = Number(CONFIG.menu.subMenuWidth)
  const mainWidth = Number(CONFIG.menu.mainMenuWidth)
  const hasSubMenu = naiveMixSubMenus.value.length > 0
  return mainWidth + (hasSubMenu ? subWidth : 0)
})
</script>

<template>
  <NDrawer v-model:show="menuStore.mobileDrawerVisible" placement="left" :width="drawerWidth" display-directive="show">
    <div class="scroll-none h-full w-full flex overflow-hidden">
      <Sider :collapsed="false" :hidden-menu-button="true" />
      <SubMenu v-if="naiveMixSubMenus.length > 0" :show-collapsed-button="false" />
    </div>
  </NDrawer>
</template>
