interface IRouteConfirm {
  confirmRoutes: Set<string>
}

export const useRouteConfirmStore = defineStore('routeConfirm', {
  state: (): IRouteConfirm => ({
    confirmRoutes: new Set(),
  }),
  getters: {
    getConfirmRoutes: (state): IRouteConfirm['confirmRoutes'] => state.confirmRoutes,
  },
  actions: {
    addConfirmRoute(id: string) {
      this.confirmRoutes.add(id)
    },
    removeConfirmRoute(id: string) {
      this.confirmRoutes.delete(id)
    },
    shouldConfirm(id: string) {
      return this.confirmRoutes.has(id)
    },
  },
})
