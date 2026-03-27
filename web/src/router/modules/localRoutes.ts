/*
 * @Author: Qing
 * @Description: 本地路由
 * @Date: 2025-01-10
 */
import type { IRouteDataRaw } from 'types/vue-router'

export const localRoutesData: IRouteDataRaw[] = [
  {
    id: 'a6',
    title: '异常页面',
    name: 'Exception',
    icon: 'i-mdi-alert-circle',
    componentPath: 'layout/AdminLayout/index',
    path: '/exception',
    hideInMenu: true,
    constant: true,
    hideBreadcrumb: true,
    redirect: '403',
    children: [
      {
        id: 'a6-2',
        title: '403',
        name: 'Exception403',
        icon: 'i-mdi-alert-circle-outline',
        componentPath: 'views/exception/index',
        path: '403',
        keepAlive: true,
        hideInMenu: true,
        constant: true,
        hideBreadcrumb: true,
      },
      {
        id: 'a6-3',
        title: '404',
        name: 'Exception404',
        icon: 'i-mdi-lock-outline',
        componentPath: 'views/exception/index',
        path: '404',
        keepAlive: true,
        hideInMenu: true,
        constant: true,
        hideBreadcrumb: true,
      },
      {
        id: 'a6-4',
        title: '500',
        name: 'Exception500',
        icon: 'i-mdi-bug-outline',
        componentPath: 'views/exception/index',
        path: '500',
        keepAlive: true,
        hideInMenu: true,
        constant: true,
        hideBreadcrumb: true,
      },
    ],
  },
  {
    id: 'lbHleBJAqd42Fz',
    title: '账号管理',
    name: 'Account',
    icon: 'i-mdi-account-cog',
    componentPath: 'layout/AdminLayout/index',
    path: '/account',
    hideInMenu: true,
    children: [
      {
        id: 'ozJaI6ML2jd52f',
        title: '个人资料',
        name: 'AccountProfile',
        componentPath: 'views/account/profile/index',
        path: 'profile',
        keepAlive: true,
        hideInMenu: true,
        constant: true,
        isLogin: true,
      },
      {
        id: '3uzoWrO1Bj1HGZ',
        title: '消息通知',
        name: 'AccountMessage',
        componentPath: 'views/account/message/index',
        path: 'message',
        keepAlive: true,
        hideInMenu: true,
        constant: true,
        isLogin: true,
      },
    ],
  },
]
