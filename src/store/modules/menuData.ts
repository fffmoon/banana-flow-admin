/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-26 23:28:40
 * @LastEditTime: 2025-05-07 11:05:25
 */

import type { IRouteDataRaw, IRouteItem } from 'types/vue-router'

interface IMenuDataState {
  currentMainMenuId: IRouteDataRaw['id'] | null
  subMenus: IRouteItem[]
  currentSubMenuId: IRouteDataRaw['id'] | null
}

export const useTabsViewStore = defineStore('menuDataState', {
  state: (): IMenuDataState => ({
    currentMainMenuId: null,
    subMenus: [],
    currentSubMenuId: null,
  }),
  getters: {
  },
  actions: {
  },
})
