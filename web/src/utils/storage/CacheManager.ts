/*
 * @Author: Qing
 * @Description: CacheManager
 * @Date: 2025-02-07 17:03:31
 * @LastEditTime: 2025-02-07 17:10:58
 */

export class CacheManager<K, V> {
  private cache: { key: K, value: V } | null = null

  /**
   * @author: Qing
   * @description: 缓存对比处理方法
   * @param key 当前缓存标识
   * @param missCallback 缓存未命中时的处理函数
   * @param hitCallback 缓存命中时的处理函数（可选）
   * @returns 处理结果
   */
  match(
    key: K,
    missCallback: () => V,
    hitCallback?: (cached: V) => V,
  ): V {
    if (this.isSameKey(key)) {
      return hitCallback?.(this.cache!.value) ?? this.cache!.value
    }

    const newValue = missCallback()
    this.updateCache(key, newValue)
    return newValue
  }

  // 清空缓存
  clear() {
    this.cache = null
  }

  private isSameKey(key: K): boolean {
    return this.cache !== null && this.deepEqual(this.cache.key, key)
  }

  private updateCache(key: K, value: V): void {
    this.cache = { key: this.clone(key), value: this.clone(value) }
  }

  // 深度比较，可以考虑使用hash
  private deepEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
  }

  // 安全克隆
  private clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }
}
