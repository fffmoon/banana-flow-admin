/*
 * @Author: Qing
 * @Description: 全局设置 Store
 * @Date: 2025-04-14 16:19:21
 * @LastEditTime: 2025-07-21 14:05:13
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import CONFIG from '@/settings'

interface IGlobalState extends Settings.All {
  app: {
    transitionName: Settings.RequiredAll['app']['transitionName']
  }
  menu: {
    mode: Settings.RequiredAll['menu']['mode']
  }
}

export const useGlobalStore = defineStore(
  'global',
  () => {
    // #region ➤ State
    // ================================================
    const app = ref<IGlobalState['app']>({
      transitionName: CONFIG.app.transitionName,
    })

    const menu = ref<IGlobalState['menu']>({
      mode: CONFIG.menu.mode,
    })
    // #endregion

    // #region ➤ Getters
    // ================================================
    const getTransitionName = computed(() => app.value.transitionName)
    // #endregion

    // #region ➤ Actions
    // ================================================
    /**
     * 设置页面切换动画
     * @param name 动画名称
     */
    function setTransitionName(name: IGlobalState['app']['transitionName']) {
      app.value.transitionName = name
    }
    // #endregion

    return {
      app,
      menu,
      getTransitionName,
      setTransitionName,
    }
  },
  {
    persist: {
      storage: sessionStorage,
      // paths: ['app.transitionName', 'menu.mode'],
    },
  },
)
