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

const routerVersion = '1.0.1'

const allRouterList: IRouteDataRaw[] = [
  /* {
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
  }, */
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
