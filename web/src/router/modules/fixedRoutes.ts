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
      name: 'FixedHome',
      title: '首页',
      hideInMenu: true,
      constant: true,
    },
    children: [
      {
        path: '/user/login',
        name: '登录',
        component: () => import('@/views/auth/login/index.vue'),
        meta: {
          id: 'fixed-login',
          name: 'FixedLogin',
          title: '登录',
          keepAlive: false,
          constant: true,
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
      name: 'RedirectLayout',
      title: '刷新中',
      hideInMenu: true,
      hideBreadcrumb: true,
      constant: true,
    },
    children: [
      {
        path: '/redirect/:path/:_redirect_type',
        name: RedirectName,
        component: () => import('@/views/redirect/index.vue'),
        meta: {
          id: 'redirect-dynamic-route',
          name: 'RedirectDynamicRoute',
          title: '刷新中',
          hideInMenu: true,
          hideBreadcrumb: true,
          constant: true,
        },
      },
    ],
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/index.vue'),
    meta: {
      id: '500',
      name: 'Fixed500',
      title: '服务器错误',
      hideInMenu: true,
      constant: true,
    },
  },
]
