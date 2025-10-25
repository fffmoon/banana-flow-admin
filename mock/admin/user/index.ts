/*
 * @Author: Qing
 * @Description: 
 * @Date: 2025-01-22 17:31:39
 * @LastEditTime: 2025-10-25 22:04:31
 */

import type { MockMethod } from 'vite-plugin-mock'
import { resultError, resultSuccess } from '@mock/_util'
import type { IRouteDataRaw } from 'types/vue-router'

const accountList = [
  {
    token:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM2ZGRjMTljLTZmNDAtNDliYy1iZTY2LTg2M2RkODgxZTNhYyIsImlhdCI6MTczNjY4NDU4OCwiZXhwIjoxNzY4MjIwNTg4fQ.B8TGpphWhXXleMiQ-_61N2e_wWF-ummWW5QedsdMRf0',
    id: 'c6ddc19c-6f40-49bc-be66-863dd881e3ac',
    userName: '测试账号',
    password: '123456',
    avatar: 'https://img2.baidu.com/it/u=764493433,253133472&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1738256400&t=56644c771c1fd95987c5c8d4a0e4a208',
    email: null,
    mobilePhone: '13812345678',
    createTime: '2025-01-12 12:22:11',
    role: [
      "root",
      "admin",
      "user"
    ],
  },
]

const routerVersion = '1.0.4'

const allRouterList: IRouteDataRaw[] = [
  {
    id: "9ANrEkJ4We",
    title: '导航',
    icon: 'i-mdi-view-dashboard',
    componentPath: 'layout/AdminLayout/index',
    path: '/admin',
    redirect: 'dashboard',
    children: [
      {
        id: "9i7myYSqEU",
        title: '仪表板',
        icon: 'i-mdi-view-dashboard',
        componentPath: 'views/admin/dashboard/index',
        path: 'dashboard',
        keepAlive: true,
      },
      {
        id: "Nd3hpFX9BL",
        title: '营销数据',
        icon: 'i-mdi-shopping ',
        componentPath: 'views/admin/market/index',
        path: 'market',
        keepAlive: true,
      },
    ],
  },
  {
    id: "i7Vq2GCXTf",
    title: '功能演示',
    icon: 'i-mdi-desktop-mac-dashboard',
    componentPath: 'layout/AdminLayout/index',
    path: '/showcase',
    children: [
      {
        id: "EB3mGtcE6H",
        title: '多级导航',
        icon: 'i-mdi-sitemap',
        componentPath: '',
        path: '#',
        children: [
          {
            id: "ARRXr67b5q",
            title: '导航1',
            icon: 'i-mdi-sitemap',
            componentPath: 'views/admin/showcase/multi-level-nav/index',
            path: 'multi-level-nav',
            keepAlive: true,
          },
          {
            id: "YeTNFi9baW",
            title: '导航2',
            icon: 'i-mdi-sitemap',
            componentPath: '',
            path: '#',
            keepAlive: true,
            children: [
              {
                id: "Da5FEVgkh6",
                title: '导航2-1',
                icon: 'i-mdi-sitemap',
                componentPath: 'views/admin/showcase/multi-level-nav/index',
                path: 'multi-level-nav-2-1',
                keepAlive: true,
              },
              {
                id: "bVaPMT9H4G",
                title: '导航2-2',
                icon: 'i-mdi-sitemap',
                componentPath: 'views/admin/showcase/multi-level-nav/index',
                path: 'multi-level-nav-2-2',
                keepAlive: true,
              },
            ],
          },
        ],
      },
      {
        id: "ewig6P8D9W",
        title: '标签页',
        icon: 'i-mdi-tab-minus',
        componentPath: 'views/admin/showcase/tabs/index',
        path: 'tabs',
        keepAlive: true,
      },
      {
        id: "rw9QuwnLeG",
        title: '页面缓存',
        icon: 'i-mdi-tab-plus',
        componentPath: 'views/admin/showcase/page-cache/index',
        path: 'page-cache',
        keepAlive: true,
      },
      {
        id: "PG4WJ828u4",
        title: '局部最大化',
        icon: 'i-mdi-window-maximize',
        componentPath: 'views/admin/showcase/maximize/index',
        path: 'maximize',
        keepAlive: true,
      },
      {
        id: "WZWDPez8nB",
        title: '页面水印',
        icon: 'i-mdi-watermark',
        componentPath: 'views/admin/showcase/watermark/index',
        path: 'watermark',
        keepAlive: true,
      },
      {
        id: "tcDZf3yZ6K",
        title: '指令复制、防抖、节流',
        icon: 'i-mdi-script-text',
        componentPath: 'views/admin/showcase/directives/index',
        path: 'directives',
        keepAlive: true,
      },
      {
        id: "kVHsgSCR3z",
        title: '页面刷新',
        icon: 'i-mdi-refresh',
        componentPath: 'views/admin/showcase/refresh/index',
        path: 'refresh',
        keepAlive: false,
      },
      {
        id: "jDvS5URa4J",
        title: '国际化',
        icon: 'i-mdi-tab-plus',
        componentPath: 'views/admin/showcase/i18n-page/index',
        path: 'i18n-page',
        keepAlive: true,
      },
      {
        id: "xqxa4tu7Kn",
        title: '页面离开提醒',
        icon: 'i-mdi-exit-to-app',
        componentPath: 'views/admin/showcase/route-confirm-page/index',
        path: 'route-confirm-page',
        keepAlive: true,
      },
      {
        id: "bMUkAZ3T89",
        title: 'Mock',
        icon: 'i-mdi-data-matrix',
        componentPath: 'views/admin/showcase/mock-page/index',
        path: 'mock-page',
        keepAlive: true,
      },
    ],
  },
  {
    id: "PkdzuBT65j",
    title: 'UI组件',
    icon: 'i-mdi-widgets',
    componentPath: 'layout/AdminLayout/index',
    path: '/ui',
    redirect: 'message',
    children: [
      {
        id: "a7-2",
        title: '消息通知 Message',
        icon: 'i-mdi-message-alert',
        componentPath: 'views/admin/showcase/message/index',
        path: 'message',
        keepAlive: true,
      },
      {
        id: "a7-1",
        title: '右键菜单 ContextMenu',
        icon: 'i-mdi-mouse-right-click ',
        componentPath: 'views/admin/showcase/context-menu/index',
        path: 'context-menu',
        keepAlive: true,
      },
      {
        id: "8eiW45TifY",
        title: '图片预览 Image',
        icon: 'i-mdi-image-search ',
        componentPath: 'views/admin/showcase/image-preview-page/index',
        path: 'image-preview-page',
        keepAlive: true,
      },
      {
        id: "9FUUnATrUb",
        title: '滚动条 Scrollbar',
        icon: 'i-mdi-paper-roll',
        componentPath: 'views/admin/showcase/scrollbar-page/index',
        path: 'scrollbar-page',
        keepAlive: true,
      },
      {
        id: "cHs5FERn6t",
        title: '下拉菜单 Dropdown',
        icon: 'i-mdi-form-dropdown',
        componentPath: 'views/admin/showcase/dropdown/index',
        path: 'dropdown',
        keepAlive: true,
      },
      {
        id: "iLD7vHAdJ6",
        title: '弹出信息 Popover',
        icon: 'i-mdi-forum',
        componentPath: 'views/admin/showcase/popover-page/index',
        path: 'popover',
        keepAlive: true,
      },
      {
        id: "2iNGpqd72Y",
        title: '间距 Space',
        icon: 'i-mdi-forum',
        componentPath: 'views/admin/showcase/space-page/index',
        path: 'space',
        keepAlive: true,
      },

    ],
  },
  {
    id: "3khaChAZQ3",
    title: '主题',
    icon: 'i-mdi-palette-outline',
    componentPath: 'layout/AdminLayout/index',
    path: '/theme',
    redirect: 'show',
    children: [
      {
        id: "ohhJANnNM3",
        title: '主题展示',
        icon: 'i-mdi-palette',
        componentPath: 'views/admin/theme/show/index',
        path: 'show',
        keepAlive: true,
      },
      {
        id: "6cqQAyYDKx",
        title: '主题数据',
        icon: 'i-mdi-invert-colors',
        componentPath: 'views/admin/theme/datas/index',
        path: 'datas',
        keepAlive: true,
      },
      {
        id: "spM4n3VBzC",
        title: '主题编辑器',
        icon: 'i-mdi-tag-edit',
        componentPath: 'views/admin/theme/naiveui-editor/index',
        path: 'naiveui-editor',
        keepAlive: true,
      },
    ],
  },
  /* {
    id: "a2",
    title: '用户',
    icon: 'i-mdi-account',
    componentPath: 'layout/BasicLayout/index',
    path: '/user',
    redirect: 'login',
    children: [
      {
        id: "a2-1",
        title: '登录注册',
        icon: 'i-mdi-login-variant',
        componentPath: 'views/admin/login/index',
        path: 'login',
        keepAlive: false,
      },
    ],
  }, */
  {
    id: "a5",
    title: '图片库',
    icon: 'i-mdi-image-multiple',
    componentPath: 'layout/AdminLayout/index',
    path: '/image-management',
    redirect: '',
    children: [
      {
        id: "a5-1",
        title: '图片库',
        icon: 'i-mdi-image-multiple',
        componentPath: 'views/admin/image-management/index',
        path: '',
        keepAlive: true,
        hideInMenu: true,
      },
    ]
  },
  {
    id: "a6",
    title: '异常页面',
    icon: 'i-mdi-alert-circle',
    componentPath: 'layout/AdminLayout/index',
    path: '/exception',
    redirect: '',
    children: [
      {
        id: "a6-2",
        title: '403',
        icon: 'i-mdi-alert-circle-outline',
        componentPath: 'views/exception/403',
        path: '403',
        keepAlive: true,
      },
      {
        id: "a6-3",
        title: '404',
        icon: 'i-mdi-lock-outline',
        componentPath: 'views/exception/404',
        path: '404',
        keepAlive: true,
      },
      {
        id: "a6-4",
        title: '500',
        icon: 'i-mdi-bug-outline',
        componentPath: 'views/exception/500',
        path: '500',
        keepAlive: true,
      },
    ]
  },
  {
    id: "a8",
    title: '用户权限',
    icon: 'i-mdi-two-factor-authentication ',
    componentPath: 'layout/AdminLayout/index',
    path: '/permission',
    redirect: '',
    children: [
      {
        id: "a8-1",
        title: '按钮权限',
        icon: 'i-mdi-two-factor-authentication ',
        componentPath: 'views/admin/permission/button/index',
        path: 'button',
        keepAlive: true,
      },
    ]
  },
  {
    id: "6DQSAQtYnM",
    title: '友情链接',
    icon: 'i-mdi-link-variant',
    componentPath: 'layout/AdminLayout/index',
    path: '/blogroll',
    redirect: '',
    children: [
      {
        id: "tpEhK8cxR2",
        title: 'github',
        icon: 'i-mdi-link-variant ',
        componentPath: '',
        link: 'https://github.com/fffmoon/banana-flow-admin',
        path: 'shadcn-ui',
        keepAlive: true,
      },
      {
        id: "RwSL47N8nA",
        title: 'reka-ui',
        icon: 'i-mdi-link-variant ',
        componentPath: '',
        link: 'https://reka-ui.com',
        path: 'shadcn-ui',
        keepAlive: true,
      },
      {
        id: "6DQSAQtYnM-1",
        title: 'shadcn-ui',
        icon: 'i-mdi-link-variant ',
        componentPath: '',
        link: 'https://ui.shadcn.com',
        path: 'shadcn-ui',
        keepAlive: true,
      },
    ]
  },
];

export default [
  {
    url: '/api/auth/loginWithSMS',
    timeout: 0,
    method: 'post',
    response: (data) => {
      const { mobilePhone, password } = data.body
      const filterResult = accountList.filter(
        item => item.mobilePhone == mobilePhone && item.password == password,
      )
      if (filterResult.length === 0) {
        return resultError('账号或密码错误')
      }

      return resultSuccess(filterResult[0].token)
    },
  },
  {
    url: '/api/auth/GetUserInfo',
    timeout: 0,
    method: 'get',
    response: (data) => {
      console.log('data', data)
      if (!data.headers.authorization) {
        return resultError('没有TOKEN')
      }
      // 根据 token 获取用户信息

      const filterResult = accountList.filter(
        item => item.token == data.headers.authorization,
      )
      if (filterResult.length === 0) {
        return resultError('没有TOKEN')
      }
      return resultSuccess(filterResult[0])
    },
  },
  {
    url: '/api/admin/GetPermmenu',
    timeout: 0,
    method: 'get',
    response: (data) => {
      return resultSuccess({
        perms: [],
        menus: allRouterList,
        version: routerVersion,
      })
    },
  },
  {
    url: '/api/getRouteVersion',
    timeout: 0,
    method: 'get',
    response: () => {
      return resultSuccess(routerVersion)
    },
  },
] as MockMethod[]
