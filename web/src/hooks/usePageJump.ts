/*
 * @Author: Qing
 * @Description: 路由跳转
 * @Date: 2025-05-10
 */
import type { LocationQueryRaw, RouteLocationRaw, Router } from 'vue-router'
import { unref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RedirectName } from '@/router/modules/fixedRoutes'

// 定义配置项接口
interface NavigateOptions {
  /** 是否替换当前路由 (replace 模式) */
  replace?: boolean
  /** 额外的查询参数 */
  query?: LocationQueryRaw
  /** 是否检查页面未保存状态  */
  checkUnsaved?: boolean
  /** 成功后的回调 */
  successCallback?: () => void
  /** 失败后的回调 */
  errorCallback?: (err: Error) => void
}

export function usePageJump(_router?: Router) {
  const router = _router || useRouter()
  const currentRoute = useRoute()
  const routeConfirmStore = useRouteConfirmStore() // 假设你使用了 Pinia

  /**
   * 核心跳转函数
   * @param target 目标路径或路由对象
   * @param options 配置选项
   */
  async function go(target: string | RouteLocationRaw, options: NavigateOptions = {}) {
    const {
      replace = false,
      query,
      checkUnsaved = false,
      successCallback,
      errorCallback,
    } = options

    // 1. 检查是否需要确认离开 (只在 checkUnsaved 为 true 时检查)
    if (checkUnsaved) {
      // 获取当前页面的 ID (根据你的逻辑)
      const currentId = currentRoute.meta?.id as string
      // 检查 Store 中该页面是否标记为"脏"(有未保存内容)
      const isDirty = routeConfirmStore.shouldConfirm(currentId)

      if (isDirty) {
        const confirmResult = await showLeaveConfirm()
        if (!confirmResult)
          return // 用户取消，终止跳转
      }
    }

    // 2. 构建最终的路由对象 (合并 query)
    let finalLocation: RouteLocationRaw

    if (typeof target === 'string') {
      if (query) {
        const resolvedTarget = router.resolve(target)
        finalLocation = {
          path: resolvedTarget.path,
          query: {
            ...resolvedTarget.query,
            ...query,
          },
          hash: resolvedTarget.hash,
        }
      }
      else {
        finalLocation = target
      }
    }
    else {
      // 如果 target 已经是对象，合并 query
      finalLocation = {
        ...target,
        query: {
          ...(target.query || {}),
          ...(query || {}),
        },
      }
    }

    // 3. 执行跳转
    const method = replace ? router.replace : router.push
    try {
      await method.call(router, finalLocation)
      successCallback?.()
      return true
    }
    catch (err: any) {
      // 忽略重复导航错误
      if (err.name !== 'NavigationDuplicated') {
        console.error('路由跳转异常:', err)
        errorCallback?.(err)
      }
      return false
    }
  }

  /**
   * 内部方法：显示离开确认弹窗
   */
  function showLeaveConfirm(): Promise<boolean> {
    return new Promise((resolve) => {
      window.$dialog.warning({
        title: '温馨提示',
        content: '当前页面有未保存的更改，确认要离开吗？',
        positiveText: '狠心离开',
        negativeText: '留在此页',
        onPositiveClick: () => resolve(true),
        onNegativeClick: () => resolve(false),
        onMaskClick: () => resolve(false),
        onClose: () => resolve(false),
      })
    })
  }

  /**
   * 刷新当前页面 (重定向方案)
   */
  function refresh(): Promise<boolean> {
    return new Promise((resolve) => {
      const { fullPath, query, params, name } = unref(router.currentRoute)

      if (name === RedirectName) {
        resolve(false)
        return
      }

      const redirectParams = {
        name: RedirectName,
        params: {
          ...params,
          _redirect_type: name ? 'name' : 'path',
          path: name ? String(name) : encodeURI(fullPath),
        },
        query,
      }

      router.replace(redirectParams)
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  return {
    go,
    refresh,
  }
}
