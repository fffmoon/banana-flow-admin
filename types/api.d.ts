/*
 * @Author: Qing
 * @Description:
 * @Date: 2025-02-18 22:24:39
 * @LastEditTime: 2025-02-18 22:33:02
 */
declare interface PaginationResponse<T> {
  data: T
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}
