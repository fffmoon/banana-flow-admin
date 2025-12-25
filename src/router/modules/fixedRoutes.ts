/*
 * @Author: Qing
 * @Description: 固定路由，不包含业务菜单
 * @Date: 2025-03-10 23:23:50
 * @LastEditTime: 2025-07-31 10:46:10
 */
import type { IRouteItem } from 'types/vue-router'

export const RedirectName = 'Redirect'
export const RedirectLayoutName = 'RedirectLayout'

// 固定路由
export const fixedRoutes: Array<IRouteItem> = [
  {
    path: '/',
    name: 'Layout',
    // redirect: '/user/login', 放开则无法重新定位
    component: () => import('@/layout/BasicLayout/index.vue'),
    meta: {
      id: 'fixed-home',
      title: '首页',
      hideInMenu: true,
    },
    children: [
      {
        path: '/user/login',
        name: '登录',
        component: () => import('@/views/admin/login/index.vue'),
        meta: {
          id: 'fixed-login',
          title: '登录',
          keepAlive: false,
        },
      },
    ],
  },
  {
    path: '/redirect',
    name: RedirectLayoutName,
    component: () => import('@/layout/AdminLayout/index.vue'),
    meta: {
      id: 'redirect-layout',
      title: '刷新中',
      hideInMenu: true,
      hideBreadcrumb: true,
    },
    children: [
      {
        path: '/redirect/:path/:_redirect_type',
        name: RedirectName,
        component: () => import('@/views/redirect/index.vue'),
        meta: {
          id: 'redirect-dynamic-route',
          title: '刷新中',
          hideInMenu: true,
          hideBreadcrumb: true,
        },
      },
    ],
  },
  {
    path: '/server-error',
    name: 'ServerError',
    component: () => import('@/views/exception/500.vue'),
    meta: {
      id: 'server-error',
      title: '服务器错误',
      hideInMenu: true,
    },
  },
]
