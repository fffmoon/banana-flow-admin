/*
 * @Author: Qing
 * @Description: 基础的axios实例
 * @Date: 2024-05-22 16:57:14
 * @LastEditTime: 2025-03-31 10:00:00
 */
import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useRequestCacheStore } from '@stores/requestCache'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import qs from 'qs'
import { useUserStore } from '@/store/modules/user'
import { ContentTypeEnum } from './httpEnum'

// #region ➤ 类型与常量声明
// ================================================

// 扩展 Axios 配置
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  showLoading?: boolean
  cacheTime?: number
}
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  showLoading?: boolean
  cacheTime?: number
}

// 统一响应结构
export interface BaseResponse<T> {
  success: boolean
  status: number
  data: T
  title: string
  bizCode: string
}

// 导致退出登录的业务错误码
const LOGOUT_BIZ_CODES = ['AUTH_5001', 'AUTH_5002', 'AUTH_5003', 'HTTP_401']

// 防止重复弹窗/重定向的锁
let isRelogging = false

// #endregion 声明

// #region ➤ 辅助函数
// ================================================

/**
 * 统一执行退出登录
 * @description 使用防抖/锁机制，防止并发请求导致多次触发
 */
function handleLogout() {
  if (isRelogging)
    return
  isRelogging = true

  const userStore = useUserStore()
  // 执行登出
  userStore.logout()

  // 提示信息
  window.$message.error('登录状态已过期，请重新登录')

  setTimeout(() => {
    isRelogging = false
  }, 3000)
}

/**
 * HTTP 状态码校验与消息提示
 */
function checkStatus(status: number, msg?: string): void {
  let errMessage = ''

  switch (status) {
    case 400:
      errMessage = `${msg}`
      break
    case 401:
      handleLogout()
      return
    case 403:
      errMessage = '用户得到授权，但是访问是被禁止的!'
      break
    case 404:
      errMessage = '网络请求错误,未找到该资源!'
      break
    case 405:
      errMessage = '网络请求错误,请求方法未允许!'
      break
    case 408:
      errMessage = '网络请求超时!'
      break
    case 500:
      errMessage = '服务器错误,请联系管理员!'
      break
    case 501:
      errMessage = '网络未实现!'
      break
    case 502:
      errMessage = '网络错误!'
      break
    case 503:
      errMessage = '服务不可用，服务器暂时过载或维护!'
      break
    case 504:
      errMessage = '网络超时!'
      break
    case 505:
      errMessage = 'http版本不支持该请求!'
      break
    default:
      errMessage = msg || '服务器访问出错了~'
  }

  if (errMessage) {
    window.$message.error(msg || errMessage)
  }
}

// #endregion 辅助函数

// #region ➤ 缓存逻辑
// ================================================

const CancelToken = axios.CancelToken

function getCacheKey(config: CustomAxiosRequestConfig | CustomInternalAxiosRequestConfig) {
  const { url, method, params, data } = config
  // 注意：params 和 data 需要确保顺序一致性，qs.stringify 默认不排序，建议 sort
  const key = [url, method, qs.stringify(params), typeof data === 'string' ? data : qs.stringify(data)].join('&')
  const hash = CryptoJS.SHA256(key).toString()
  return hash.slice(0, 16)
}

// #endregion 缓存

// #region ➤ 实例与拦截器
// ================================================

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
  timeout: 1000 * 30,
})

// --- 请求拦截器 ---
service.interceptors.request.use(
  (config: CustomInternalAxiosRequestConfig) => {
    const requestCacheStore = useRequestCacheStore()

    // 缓存处理 (读取)
    if (config.cacheTime) {
      const source = CancelToken.source()
      config.cancelToken = source.token
      const key = getCacheKey(config)
      const item = requestCacheStore.getCache(key)

      if (item && (new Date().getTime() - item.expireTime < 0)) {
        console.info('请求被缓存响应', item.key)
        // 取消请求并返回缓存数据
        source.cancel(JSON.stringify({ type: 'cache', data: item.data }))
      }
    }

    // i18n 语言处理
    if (config.headers) {
      config.headers['Accept-Language'] = localStorage.getItem('locale') || 'zh-CN'
    }

    // Token 注入
    const userStore = useUserStore()
    if (userStore.getToken && config.headers) {
      config.headers.Authorization = userStore.getToken
    }

    // 数据格式转换
    const contentType = config.headers?.['content-type'] || config.headers?.['Content-Type']
    if (config.method?.toUpperCase() === 'POST' && config.data) {
      if (contentType === ContentTypeEnum.FORM_DATA) {
        const fd = new FormData()
        Object.keys(config.data).forEach(key => fd.append(key, config.data[key]))
        config.data = fd
      }
      else if (contentType === ContentTypeEnum.FORM_URLENCODED) {
        config.data = qs.stringify(config.data)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// --- 响应拦截器 ---
service.interceptors.response.use(
  (response: AxiosResponse<BaseResponse<any>>) => {
    const res = response.data

    // 1. 业务逻辑失败处理
    if (!res.success) {
      // 检查业务码是否需要登出
      if (res.bizCode && LOGOUT_BIZ_CODES.includes(res.bizCode)) {
        handleLogout()
      }
      else {
        // 普通业务错误
        window.$message.error(res.title || '服务器访问出错了~')
      }
      return Promise.reject(res)
    }

    // 2. 成功处理 & 写入缓存
    const customConfig = response.config as CustomAxiosRequestConfig
    if (customConfig.method?.toLowerCase() === 'get' && customConfig.cacheTime) {
      const requestCacheStore = useRequestCacheStore()
      console.info('响应数据被缓存', customConfig.url)
      requestCacheStore.addCache(getCacheKey(response.config), response, customConfig.cacheTime)
    }

    return response
  },
  (error: AxiosError) => {
    console.error('Response Error:', error)

    // 1. 处理缓存中断 (axios.isCancel)
    if (axios.isCancel(error)) {
      try {
        // 解析 cancel 消息，判断是否为缓存返回
        const msgObj = JSON.parse(error.message || '{}')
        if (msgObj.type === 'cache') {
          return Promise.resolve(msgObj.data)
        }
      }
      catch {
        // 普通取消，非缓存
        return Promise.reject(error)
      }
    }

    // 2. 处理 HTTP 状态码错误 (包含 401)
    // error.response 存在说明服务器返回了响应，但状态码不在 2xx 范围内
    if (error.response) {
      checkStatus(error.response.status, (error.response.data as any)?.title || error.message)
      return Promise.reject(error)
    }

    // 3. 处理断网或超时
    let msg = error.message || ''
    if (msg.includes('timeout')) {
      msg = '请求超时，请检查网络连接'
    }
    else if (msg.includes('Network Error')) {
      msg = '网络异常，请检查您的网络连接'
    }
    window.$message.error(msg)

    return Promise.reject(error)
  },
)

// #endregion 拦截器

// #region ➤ 外部调用包装器
// ================================================

function request<T = any>(config: Partial<CustomAxiosRequestConfig>): Promise<BaseResponse<T>> {
  const requestCacheStore = useRequestCacheStore()
  requestCacheStore.addRquestCount()

  return new Promise((resolve, reject) => {
    service
      .request<BaseResponse<T>>(config)
      .then((res: AxiosResponse<BaseResponse<T>> | any) => {
        if (res.data && typeof res.data === 'object' && 'success' in res.data) {
          resolve(res.data)
        }
        else {
          resolve(res.data || res)
        }
      })
      .catch(err => reject(err))
      .finally(() => {
        requestCacheStore.subtractRquestCount()
      })
  })
}

export default request

// #endregion
