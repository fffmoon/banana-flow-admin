/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-14 16:19:21
 * @LastEditTime: 2025-07-21 14:05:13
 */
import CONFIG from '@/settings'

interface IGlobalState extends Settings.All {
  app: {
    transitionName: Settings.RequiredAll['app']['transitionName']
  }
  menu: {
    mode: Settings.RequiredAll['menu']['mode']
  }
}

export const useGlobalStore = defineStore('global', {
  state: (): IGlobalState => ({
    app: {
      transitionName: CONFIG.app.transitionName,
    },
    menu: {
      mode: CONFIG.menu.mode,
    },
  }),
  getters: {
    getTransitionName(): IGlobalState['app']['transitionName'] {
      return this.app.transitionName
    },
  },
  actions: {
    // 设置页面切换动画
    setTransitionName(name: IGlobalState['app']['transitionName']) {
      this.app.transitionName = name
    },
  },
  persist: {
    storage: sessionStorage,
  },
})
