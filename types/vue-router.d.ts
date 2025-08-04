/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-09-03 09:42:22
 * @LastEditTime: 2025-04-22 15:45:00
 */

import 'vue-router'

declare module 'vue-router' {
  // 扩展 RouteMeta 接口
  interface RouteMeta extends IRouteMeta { }
}

/**
 * 接口数据
 */
export interface IRouteDataRaw {
  // 路由id
  id: string
  // 路由标题
  title: string
  // 路由组件路径
  componentPath: string
  // 路由路径为#时，仅作为菜单按钮显示，不加入到路由中
  path: string
  // 路由图标
  icon?: string
  // 路由重定向
  redirect?: string
  // 子路由
  children?: IRouteDataRaw[]
  // 是否缓存
  keepAlive?: boolean
  // 是否需要权限
  auth?: string[]
  // 是否常驻标签页 false
  permanent?: boolean
  // 权限池，对路由本身无实际作用，通常用于角色管理模块
  auths?: { name: string, value: string }[]
  // 是否在导航中展示，当子导航里没有可展示的导航时，会直接显示父导航
  hideInMenu?: boolean
  // 是否在面包屑导航中展示
  hideBreadcrumb?: boolean
  // 外部网页链接，会在浏览器新窗口访问该链接
  link?: string
  // 是否需要登录才能访问，和auth有一定重叠
  isLogin?: false
  // 指定高亮的导航，需要设置完整路由地址，通常与 meta.menu: false 一起使用，
  activeMenu?: string
  // 单级路由，只在一级路由时生效，等同于在二级路由的 hideInMenu: true
  singleMenu?: boolean
}

export interface IRouteMeta extends Omit<IRouteDataRaw, 'children' | 'componentPath'> {
  path?: IRouteDataRaw['path']
}

/**
 * 路由数据
 */
export interface IRouteItem extends Pick<IRouteDataRaw, 'path' | 'component' | 'redirect' | 'children'> {
  name: IRouteDataRaw['title']
  // 子路由
  children?: IRouteItem[]
  // 元数据
  meta: IRouteMeta
}

// 拍扁之后的配置
export interface IFlatRouteItem {
  raw: IRouteItem
  id: string
  parents: string[]
  depth: number
}
