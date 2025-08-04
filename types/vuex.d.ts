/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-09-03 09:42:22
 * @LastEditTime: 2025-03-10 09:44:03
 */
// import { ComponentCustomProperties } from 'vue';
import type { Store } from 'vuex'

declare module '@vue/runtime-core' {
  // declare your own store states
  interface State {
    count: number
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}
