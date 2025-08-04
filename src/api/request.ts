/*
 * @Author: Qing
 * @Description: 基础的axios实例
 * @Date: 2024-05-22 16:57:14
 * @LastEditTime: 2025-03-31 09:30:41
 */
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { useRequestCacheStore } from '@stores/requestCache'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import qs from 'qs'
import { ContentTypeEnum } from './httpEnum'

// #region ➤ 声明
// ================================================

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  showLoading?: boolean
  cacheTime?: number
}
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  showLoading?: boolean
  cacheTime?: number
}

export interface BaseResponse<T> {
  success: boolean
  status: number
  data: T
  title: string
  bizCode: string
}

// #endregion 声明

// #region ➤ 实例
// ================================================

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
  timeout: 1000 * 30,
})

function request<T = any>(config: Partial<CustomAxiosRequestConfig>): Promise<BaseResponse<T>> {
  const requestCacheStore = useRequestCacheStore()
  // 计数 +1
  requestCacheStore.addRquestCount()
  return new Promise((resolve, reject) => {
    service
      .request<BaseResponse<T>>(config)
      .then(res => resolve(res.data))
      .catch(err => reject(err))
      .finally(() => {
        // 计数 -1
        requestCacheStore.subtractRquestCount()
      })
  })
}

// #endregion 实例

// #region ➤ 缓存
// ================================================

const CancelToken = axios.CancelToken
// 根据当前的请求消息生成一个唯一KEY
function getCacheKey(config: CustomAxiosRequestConfig) {
  const { url, method, params, data } = config
  const key = [url, method, qs.stringify(params), qs.stringify(data)].join('&')
  const hash = CryptoJS.SHA256(key).toString()

  return hash.slice(0, 16)
}

// #endregion 缓存

// #region ➤ 拦截器
// ================================================

// 请求拦截器
service.interceptors.request.use(
  (config: CustomInternalAxiosRequestConfig) => {
    const requestCacheStore = useRequestCacheStore()

    // 处理缓存，读取缓存
    if (config.cacheTime) {
      const source = CancelToken.source()
      config.cancelToken = source.token
      // 获取key
      const key = getCacheKey(config)
      const item = requestCacheStore.getCache(key)
      // 如果存在
      if (item) {
        // 如果存在并且没有过期
        const expireTime = new Date().getTime()
        if (expireTime - item.expireTime < 0) {
          console.info('请求被缓存响应', item.key, item)
          source.cancel(item.data)
        }
      }
    }

    // 处理token
    const userStore = useUserStore()
    if (userStore.getToken && config.headers) {
      config.headers.Authorization = userStore.getToken
    }

    // 处理请求数据格式
    const contentType = config.headers?.['content-type'] || config.headers?.['Content-Type']
    const data = config.data
    if (config.method?.toLocaleUpperCase() === 'POST' && data) {
      if (contentType === ContentTypeEnum.FORM_DATA) {
        const fd = new FormData()
        Object.keys(data).forEach(key => fd.append(key, data[key]))
        config.data = fd
      }
      else if (contentType === ContentTypeEnum.FORM_URLENCODED) {
        config.data = qs.stringify(config.data)
      }
    }

    return config
  },
  (error) => {
    console.info(error)

    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // console.info(response)

    // 请求计数
    const requestCacheStore = useRequestCacheStore()

    const res = response.data as BaseResponse<any>
    if (!res.success) {
      // 超时重新登录
      if (res.bizCode && ['AUTH_5001', 'AUTH_5002', 'AUTH_5003'].includes(res.bizCode)) {
        const userStore = useUserStore()
        userStore.logout()
      }
      window.$message.error(res.title || '服务器访问出错了~')
      return Promise.reject(res || 'error')
    }
    else {
      // 处理缓存，写入缓存，只有200的数据才会写入缓存，只有get请求才会缓存
      const customConfig = response.config as CustomAxiosRequestConfig
      if (customConfig.method === 'get' && customConfig.cacheTime) {
        console.info('响应数据被缓存', customConfig.url)
        requestCacheStore.addCache(getCacheKey(response.config), response, customConfig.cacheTime)
      }

      return Promise.resolve(response)
    }
  },
  (error: any) => {
    console.error('error', error)
    // 处理缓存，请求拦截器中的source.cancel会将内容发送到error中
    if (axios.isCancel(error)) {
      /*
      // 载入未实装，这里写载入关闭
      closeToast(true);
      */
      return Promise.resolve(error.message)
    }

    let errorMessage = error.response.data?.title || error.message || '服务器访问出错了~'
    if (error.message?.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接'
    }
    window.$message.error(errorMessage)
    return Promise.reject(error)
  },
)

// #endregion 拦截器

export default request
