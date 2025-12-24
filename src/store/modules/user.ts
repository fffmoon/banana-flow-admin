/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-05-28 20:16:33
 * @LastEditTime: 2025-07-30 17:31:44
 */
import type { GetUserInfoResponse } from '@apis/modules/user/type'
import { defineStore } from 'pinia'
import { router } from '@/router'
import { Storage } from '@/utils/storage/Storage'
import { useConfigStore } from './config'

interface LoginParams {
  username: string
  password: string
}

interface UserState {
  accessToken: string
  // 按钮权限
  perms: string[]
  // 用户数据
  userInfo: GetUserInfoResponse | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    accessToken: Storage.get('accessToken', ''),
    userInfo: Storage.get('userInfo', null),
    perms: Storage.get('perms', []),
  }),
  getters: {
    getToken(): string {
      return this.accessToken
    },
    // 获取用户信息
    getUserInfo(): GetUserInfoResponse | null {
      return this.userInfo
    },
    // 获取用于显示的用户信息
    getDispalyUserInfo(): GetUserInfoResponse {
      return this.userInfo || {
        id: '-1',
        userName: '未登录用户',
        avatar: 'https://img.dashixiong.asia/20250301-000454-cjpdw8yd4a.png',
        email: '',
        mobilePhone: '',
        createTime: '1970-01-01 00:00:00',
        role: [],
      }
    },
    getPerms(): UserState['perms'] {
      return this.perms
    },
  },
  actions: {
    // 清空token及用户信息
    resetToken() {
      this.accessToken = ''
    },
    /**
     * 登录并初始化用户信息
     * @param {"emailPassword" | "mobilePassword" | "mobileSmsCode"} type - 登录类型
     * @param {LoginParams} params - 登录参数
     * @returns {Promise<void>}
     * @throws {Error} 登录失败时抛出错误
     */
    async login(type: 'emailPassword' | 'mobilePassword' | 'mobileSmsCode', params: LoginParams): Promise<void> {
      try {
        // 根据类型调用不同的登录方法
        let result
        if (type === 'emailPassword') {
          result = await API.user.loginWithEmail({
            ...params,
            email: params.username,
          })
        }
        else if (type === 'mobilePassword') {
          result = await API.user.loginWithSMS({
            ...params,
            mobilePhone: params.username,
          })
        }
        else if (type === 'mobileSmsCode') {
          result = await API.user.loginWithSmsCode({
            mobilePhone: params.username,
            code: params.password,
          })
        }

        if (!result || !result.data)
          throw new Error('登录失败：未获取到token')

        window.$message.success('登录成功')
        // console.info('token是：', token)
        this.accessToken = result.data
        Storage.set('accessToken', result.data, 7 * 24 * 60 * 60)

        // 登录成功之后, 获取用户信息以及生成权限路由，并跳转到主页
        await this.afterLogin()
        router.push('/')
      }
      catch (error) {
        return Promise.reject(error)
      }
    },
    /**
     * 登录之后的操作，如：初始化用户信息和权限菜单
     * @returns {Promise<void>}
     * @throws {Error} 初始化失败时抛出错误
     */
    async afterLogin() {
      try {
        // 1. 获取用户信息
        const userInfo = await this.fetchUserInfo()
        if (!userInfo)
          throw new Error('获取用户信息失败')

        // 2. 获取权限菜单
        const permMenu = await this.getPermMenu()
        if (!permMenu)
          throw new Error('获取权限菜单失败')

        // 3. 设置水印效果
        const configStore = useConfigStore()
        configStore.setWatermarkName()
      }
      catch (error) {
        console.error('初始化用户信息失败:', error)
        // 初始化失败，清理数据并返回登录页
        await this.logout()
        throw error
      }
    },
    // 获取用户信息
    async fetchUserInfo() {
      try {
        const userInfo = await API.user.GetUserInfo()
        // DOTO 后台我没有定义头像，目前先写死
        userInfo.data.avatar = 'https://img.dashixiong.asia/20250301-000454-cjpdw8yd4a.png'
        this.userInfo = userInfo.data
        Storage.set('userInfo', this.userInfo)
        return this.userInfo
      }
      catch (error) {
        console.error('错误，获取用户信息', error)
        throw error
      }
    },

    // 获取权限菜单
    async getPermMenu() {
      try {
        const { data } = await API.user.GetPermmenu()
        this.perms = data.perms
        Storage.set('perms', this.perms)
        // 生成路由信息
        const asyncRouteStore = useAsyncRouteStore()
        await asyncRouteStore.handleRouterMenu(data.menus, data.version)
        return true
      }
      catch (error) {
        console.error('错误，获取权限菜单', error)
        throw error
      }
    },
    // 检查是否登录
    async checkLoginStatus() {
      const loggedIn = Boolean(Storage.get('accessToken', null))
      return !!loggedIn
    },
    // 登出
    async logout() {
      // 清理用户信息
      this.accessToken = '' // 首先清空token
      this.userInfo = null
      Storage.remove('accessToken')
      Storage.remove('userInfo')

      // 清理路由
      const asyncRouteStore = useAsyncRouteStore()
      asyncRouteStore.removeAllRoutes()

      // 清理标签页
      const tabsViewStore = useTabsViewStore()
      tabsViewStore.clearTabsViewList()

      // 清理权限菜单
      this.perms = []
      Storage.remove('perms')

      // 重置水印
      const configStore = useConfigStore()
      configStore.resetWatermarkConfig()

      // 跳转登录页
      await router.push('/user/login')
    },
    // 处理权限
    handlePerms(type: 'add' | 'remove' | 'find', value?: string) {
      if (type === 'add') {
        if (value === undefined) {
          console.warn('[handlePerms]的add方法必须提供value参数')
          return
        }
        this.perms.push(value)
      }
      else if (type === 'remove') {
        if (value === undefined) {
          console.warn('[handlePerms]的remove方法必须提供value参数')
          return
        }
        this.perms = this.perms.filter(item => item !== value)
      }
      else if (type === 'find') {
        if (value === undefined) {
          console.warn('[handlePerms]的find方法必须提供value参数')
          return
        }
        return this.perms.includes(value)
      }
      Storage.set('perms', this.perms)
    },
  },
})
