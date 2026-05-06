/*
 * @Author: Qing
 * @Description: 用户状态管理 Store (Setup Store模式)
 * @Date: 2024-05-28 20:16:33
 * @LastEditTime: 2025-07-30 17:31:44
 */
import type { GetUserInfoResponse } from '@apis/modules/auth/type'
import { i18n, globalT as t } from '@i18n/index'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { router } from '@/router'
import { useWatermarkStore } from '@/store/modules/watermark'
import { Storage } from '@/utils/storage/Storage'

export interface LoginParams {
  username: string
  password: string

}

export interface optionsParams {
  redirect?: string
}

interface IUserInfo extends GetUserInfoResponse { }

export type LoginType = 'emailPassword' | 'mobilePassword' | 'mobileSmsCode' | 'accountName'

export const useUserStore = defineStore('user', () => {
  // #region ➤ State
  // ================================================
  const accessToken = ref<string>(Storage.get('accessToken', ''))
  const userInfo = ref<IUserInfo | null>(Storage.get('userInfo', null))
  const perms = ref<string[]>(Storage.get('perms', []))
  // #endregion

  // #region ➤ Getters
  // ================================================
  const getToken = computed(() => accessToken.value)

  /** 获取用户信息 */
  const getUserInfo = computed(() => userInfo.value)

  /** 获取权限列表 */
  const getPerms = computed(() => perms.value)

  /** 获取用户最高权限等级。注意：数值越小权限越高，0为最高权限、999为最低权限。 */
  const getRoleLevel = computed((): number => {
    if (!userInfo.value)
      return 999
    return userInfo.value.roles.length
      ? Math.min(...userInfo.value.roles.map(role => role.roleLevel))
      : 999
  })
  /** 对比权限等级，返回是否有权限，0无权限、1有权限 */
  const compareRoleLevel = (level: number): number => {
    return getRoleLevel.value < level ? 1 : 0
  }

  /** 获取用于显示的用户信息 */
  const getDispalyUserInfo = computed((): IUserInfo => {
    return Object.assign({}, {
      id: '-1',
      userName: 'unknown',
      nickname: t('user.store.unknownUser'),
      avatar: 'https://img.dashixiong.site/20250301-000454-cjpdw8yd4a.png',
      email: '',
      mobilePhone: '',
      createTime: '1970-01-01 00:00:00',
      roles: [],
      roleLevel: 999,
      locale: i18n.global.locale.value,
    }, userInfo.value)
  })
  // #endregion

  // #region ➤ Actions
  // ================================================

  // 清空token及用户信息
  function resetToken() {
    accessToken.value = ''
  }

  /**
   * 登录并初始化用户信息
   * @param {LoginType} type - 登录类型
   * @param {LoginParams} params - 登录参数
   */
  async function login(type: LoginType, params: LoginParams, options?: optionsParams): Promise<void> {
    try {
      const result = {
        token: '',
        expiresIn: 0,
      }

      // 根据类型调用不同的登录方法
      if (type === 'emailPassword') {
        const { data } = await API.auth.loginWithEmail({
          ...params,
          email: params.username,
        })
        result.token = data
      }
      else if (type === 'mobilePassword') {
        const { data } = await API.auth.loginWithSMS({
          ...params,
          mobilePhone: params.username,
        })
        result.token = data
      }
      else if (type === 'mobileSmsCode') {
        const { data } = await API.auth.loginWithSmsCode({
          mobilePhone: params.username,
          code: params.password,
        })
        result.token = data
      }
      else if (type === 'accountName') {
        const { data } = await API.auth.loginWithAccountName({
          ...params,
          username: params.username,
        })
        result.token = `${data.tokenType} ${data.accessToken}`
        result.expiresIn = data.expiresIn
      }

      if (!result || !result.token)
        throw new Error(t('user.store.loginFailNoToken'))

      window.$message.success(t('user.store.loginSuccess'))

      accessToken.value = result.token
      // 注意：这里保留了原有的 Storage 逻辑，包含过期时间处理
      Storage.set('accessToken', result.token, result.expiresIn || 7 * 24 * 60 * 60)

      // 登录成功之后, 获取用户信息以及生成权限路由，并跳转到主页
      await afterLogin()
      router.push(options?.redirect || '/')
    }
    catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * 登录之后的操作，如：初始化用户信息和权限菜单
   */
  async function afterLogin() {
    try {
      // 1. 获取用户信息
      const userInfoData = await fetchUserInfo()
      if (!userInfoData)
        throw new Error('获取用户信息失败')

      // 2. 获取权限菜单
      const permMenu = await getPermMenu()
      if (!permMenu)
        throw new Error('获取权限菜单失败')

      // 3. 设置水印效果
      const watermarkStore = useWatermarkStore()
      watermarkStore.setWatermarkName()
    }
    catch (error) {
      console.error('初始化用户信息失败:', error)
      // 初始化失败，清理数据并返回登录页
      await logout()
      throw error
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const { data } = await API.auth.GetUserInfo()
      if (!data.avatar) {
        data.avatar = 'https://img.dashixiong.site/20250301-000454-cjpdw8yd4a.png'
      }
      if (data.username) {
        data.userName = data.username
      }

      userInfo.value = data
      Storage.set('userInfo', userInfo.value)
      return userInfo.value
    }
    catch (error) {
      console.error('错误，获取用户信息', error)
      throw error
    }
  }

  // 登出
  async function logout(options?: optionsParams) {
    // 清理用户信息
    accessToken.value = ''
    userInfo.value = null
    Storage.remove('accessToken')
    Storage.remove('userInfo')

    // 清理路由
    const asyncRouteStore = useAsyncRouteStore()
    asyncRouteStore.removeAllRoutes()

    // 清理菜单
    const menuStore = useMenuStore()
    menuStore.clearMenuCache()

    // 清理标签页
    const tabsViewStore = useTabsViewStore()
    tabsViewStore.clearTabsViewList()

    // 清理权限菜单
    perms.value = []
    Storage.remove('perms')

    // 重置水印
    const watermarkStore = useWatermarkStore()
    watermarkStore.resetWatermarkConfig()

    // 跳转登录页
    await router.push(options?.redirect || '/user/login')
  }

  // 获取权限菜单
  async function getPermMenu() {
    try {
      const { data } = await API.auth.GetPermmenu()
      perms.value = data.perms
      Storage.set('perms', perms.value)

      // 生成路由信息
      const asyncRouteStore = useAsyncRouteStore()
      await asyncRouteStore.handleRouterMenu(data.menus, data.version)
      return true
    }
    catch (error) {
      console.error('错误，获取权限菜单', error)
      throw error
    }
  }

  // 处理权限
  function handlePerms(type: 'add' | 'remove' | 'find', value?: string) {
    if (type === 'add') {
      if (value === undefined) {
        console.warn('[handlePerms]的add方法必须提供value参数')
        return
      }
      perms.value.push(value)
    }
    else if (type === 'remove') {
      if (value === undefined) {
        console.warn('[handlePerms]的remove方法必须提供value参数')
        return
      }
      perms.value = perms.value.filter(item => item !== value)
    }
    else if (type === 'find') {
      if (value === undefined) {
        console.warn('[handlePerms]的find方法必须提供value参数')
        return
      }
      return perms.value.includes(value)
    }
    Storage.set('perms', perms.value)
  }

  /**
   * @param value 权限值
   * @param strategy 'one' | 'all'
   */
  function hasPerms(value: string | string[], strategy: 'one' | 'all' = 'one') {
    // 考虑后续扩展超级管理员逻辑
    if (perms.value.includes('*'))
      return true

    if (!Array.isArray(value)) {
      return perms.value.includes(value)
    }

    if (strategy === 'all') {
      // AND 逻辑：必须全部拥有
      return value.every(item => perms.value.includes(item))
    }
    else {
      // OR 逻辑：拥有其一
      return value.some(item => perms.value.includes(item))
    }
  }
  // #endregion

  return {
    accessToken,
    userInfo,
    perms,
    getToken,
    getUserInfo,
    getRoleLevel,
    getDispalyUserInfo,
    getPerms,
    resetToken,
    login,
    afterLogin,
    fetchUserInfo,
    getPermMenu,
    logout,
    handlePerms,
    compareRoleLevel,
    hasPerms,
  }
})
