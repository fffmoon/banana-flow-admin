/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-05-23 16:14:52
 * @LastEditTime: 2025-03-01 18:53:29
 */
import type { IRouteItem } from 'types/vue-router'

export const example: Array<IRouteItem> = [
  {
    path: '/example',
    name: 'example',
    meta: {
      id: 'example1',
      title: 'example',
      singleMenu: true,
    },
    component: () => import('@/layout/BasicLayout/index.vue'),
    children: [
      {
        path: '/example',
        name: 'demo',
        component: () => import('@/views/demo/index.vue'),
        meta: {
          id: 'example1-1',
          title: 'demo',
          hideInMenu: true,
        },
      },
    ],
  },
]
