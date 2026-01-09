/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-27 11:04:33
 * @LastEditTime: 2025-05-09 15:36:50
 */
import type { RouteLocationRaw, Router } from 'vue-router'
import { useRoute } from 'vue-router'
import { RedirectName } from '@/router/modules/fixedRoutes'

export function usePageJump(_router?: Router) {
  const router = _router || useRouter()
  const route = useRoute()

  /**
   * @author Qing
   * @description 路由跳转
   * @param {string | RouteLocationRaw} target 跳转到指定页面
   * @param {boolean} replace 是否取代
   * @date 2025-02-27 11:25:24
   */
  async function goTo(
    target: string | RouteLocationRaw,
    replace?: boolean,
  ) {
    const method = replace ? router.replace : router.push

    try {
      return await method.call(router, target)
    }
    catch (err: any) {
      if (err.name !== 'NavigationDuplicated') {
        console.error('路由跳转失败', err)
      }
    }
  }

  /**
   * @author Qing
   * @description 路由跳转增强版
   * @param {string | RouteLocationRaw} target 跳转目标（必选）
   * @param {object} [obj] 配置选项
   * @param {boolean} [obj.replace] 是否替换当前路由
   * @param {Function} [obj.successCallback] 跳转成功后的回调函数
   * @param {boolean} [obj.confirm] 是否需要二次确认
   * @date 2025-05-09 14:00:24
   */
  async function goToWithConfirm(
    target: string | RouteLocationRaw,
    obj?: {
      replace?: boolean
      successCallback?: () => void
      confirm?: boolean
    },
  ) {
    const { replace = false, successCallback, confirm } = obj || {}
    const method = replace ? router.replace : router.push

    try {
      // 添加确认逻辑
      if (confirm) {
        const confirmed = await new Promise<boolean>((resolve) => {
          window.$dialog.warning({
            title: '提示',
            content: '当前页面还没有保存，是否确定要离开？',
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: () => {
              // window.$message.success('确定')
              resolve(true)
            },
            onNegativeClick: () => {
              // window.$message.error('取消')
              resolve(false)
            },
          })
        })

        if (!confirmed)
          return // 取消跳转
      }

      // 执行路由跳转
      const result = await method.call(router, target)
      successCallback?.()
      return result
    }
    catch (err: any) {
      if (err.name !== 'NavigationDuplicated') {
        console.error('路由跳转失败', err)
      }
      throw err
    }
  }

  /**
   * @author Qing
   * @description 路由跳转集成版，参数同 [goToWithConfirm] ，集成了路由检测功能。
   * @date 2025-05-09 14:00:24
   */
  function goToShouldConfirm(
    target: string | RouteLocationRaw,
    obj?: {
      replace?: boolean
      successCallback?: () => void
    },
  ) {
    const routeConfirmStore = useRouteConfirmStore()
    const params = Object.assign({}, obj, {
      confirm: routeConfirmStore.shouldConfirm(route.meta.id),
    })
    goToWithConfirm(target, params)
  }

  /**
   * @author Qing
   * @description 重新加载当前路由，可以指定router实例
   * @returns {Promise<boolean>}  Promise对象， resolve为true时刷新成功，false时刷新失败
   * @date 2025-03-10 15:26:41
   */
  function refresh(): Promise<boolean> {
    return new Promise((resolve) => {
      const { fullPath, query, params, name } = unref(router.currentRoute.value)

      // 防止在重定向页调用刷新
      if (name === RedirectName) {
        resolve(false)
        return
      }

      // 构建重定向参数
      const redirectParams = {
        name: RedirectName,
        params: {
          ...params,
          _redirect_type: name ? 'name' : 'path',
          path: name ? String(name) : encodeURI(fullPath),
        },
        query,
      }
      // console.info('构建重定向参数', redirectParams)

      router.push(redirectParams)
        .then(() => resolve(true))
        .catch((err) => {
          if (err.name !== 'NavigationDuplicated') {
            console.error('路由刷新失败:', err)
          }
          resolve(false)
        })
    })
  }

  return { goTo, goToWithConfirm, goToShouldConfirm, refresh }
}
