/*
 * @Author: Qing
 * @Description: 请求缓存功能
 * @Date: 2024-08-01 13:00:06
 * @LastEditTime: 2025-07-21 14:50:35
 */
import { createStorage } from '@/utils/storage/Storage'
import { defineStore } from 'pinia'

const Storage = createStorage({ storage: sessionStorage })

interface ICacheItem<T = any> {
  key: string
  data: T
  expireTime: number
}
interface IRequestCache {
  // 缓存池
  cache: Record<string, ICacheItem>
  requestCount: number
}

export const useRequestCacheStore = defineStore('requestCacheStore', {
  state: (): IRequestCache => ({
    cache: Storage.get('cache', {}),
    requestCount: 0,
  }),
  getters: {
    /**
     * 获取指定的缓存项
     * @param {string} state
     */
    getCache: (state) => {
      const cache = state.cache
      return (key: string) => cache[key]
    },
    getRequestCount: (state) => {
      return state.requestCount
    },
  },
  actions: {
    /**
     * @description 添加一个缓存
     * @author Qing
     * @param {string} key 缓存KEY
     * @param {*} data 缓存数据
     * @param {number} time 缓存时间 单位:毫秒
     */
    addCache<T>(key: string, data: T, time: number) {
      const item: ICacheItem<T> = {
        key,
        data,
        expireTime: new Date().getTime() * 1 + time,
      }
      this.cache[key] = item
      Storage.set('cache', this.cache)
    },
    addRquestCount() {
      this.requestCount++
    },
    subtractRquestCount() {
      this.requestCount = this.requestCount - 1 > 0 ? this.requestCount - 1 : 0
    },
  },
})
