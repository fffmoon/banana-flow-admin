/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-21 20:09:25
 * @LastEditTime: 2025-02-26 13:17:16
 */
// Interface data format used to return a unified format
import { BaseResponse } from '@apis/request'

export function resultSuccess<T = Recordable>(data: T, { title = 'ok' } = {}): BaseResponse<T> {
  return {
    success: true,
    status: 200,
    data,
    title,
    bizCode: '',
  }
}

export function resultPageSuccess<T = any>(
  page: number,
  pageSize: number,
  list: T[],
  { title = 'ok' } = {},
) {
  const pageData = pagination(page, pageSize, list)

  return {
    ...resultSuccess({
      list: pageData,
      pagination: {
        page: ~~page,
        size: ~~pageSize,
        total: list.length,
      },
    }),
    title,
  }
}

export function resultError(title: string, { status = -1, data = null, bizCode = "" } = {}): BaseResponse<null> {
  return {
    success: false,
    status,
    data,
    title,
    bizCode: '',
  }
}

export function pagination<T = any>(page: number, pageSize: number, array: T[]): T[] {
  const offset = (page - 1) * Number(pageSize)
  const ret
    = offset + Number(pageSize) >= array.length
      ? array.slice(offset, array.length)
      : array.slice(offset, offset + Number(pageSize))

  return ret
}

export interface requestParams {
  method: string
  body: any
  headers?: { authorization?: string }
  query: any
}

/**
 * @Author: Qing
 * @description: 上线需要修改
 */
export function getRequestToken({ headers }: requestParams): string | undefined {
  return headers?.authorization
}
