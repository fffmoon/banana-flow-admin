export interface OperationLogQueryParams {
  page?: number
  size?: number
  username?: string
  module?: string
  statusCode?: number
  startTime?: string
  endTime?: string
}

export interface OperationLog {
  id: number
  userId: number
  username: string
  module: string
  action: string
  method: string
  path: string
  ipAddress: string
  statusCode: number
  executionTime: number
  createdAt: string
  requestParams: any
  responseData: any
}

export function getLogList(params: OperationLogQueryParams) {
  return request<PaginationResponse<OperationLog[]>>({
    url: '/api/v1/operation-logs',
    method: 'GET',
    params,
  })
}
