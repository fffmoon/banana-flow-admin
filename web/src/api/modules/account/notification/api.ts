export interface NotificationQueryParams {
  page: number
  size: number
  isRead?: boolean
  noticeType?: 0 | 1 | 2 | 3 // 0-全部, 1-通知, 2-公告, 3-私信
  title?: string
  publisherName?: string
}

export interface NotificationItem {
  id: number
  title: string
  content: string | null
  noticeType: 1 | 2 | 3 // 1-通知 2-公告 3-私信
  publisherName: string | null
  createTime: string
  isRead: boolean
  readAt: string | null
}

// 获取消息列表
export function getList(params: NotificationQueryParams) {
  return request<PaginationResponse<NotificationItem[]>>({
    url: '/api/v1/notifications',
    method: 'GET',
    params,
  })
}

// 获取未读数量
export function getUnreadCount() {
  return request<{ unreadCount: number }>({
    url: '/api/v1/notifications/unread-count',
    method: 'GET',
  })
}

// 全部已读
export function readAll() {
  return request({
    url: '/api/v1/notifications/read-all',
    method: 'PUT',
  })
}

// 单条已读
export function readOne(id: number) {
  return request<NotificationItem>({
    url: `/api/v1/notifications/${id}/read`,
    method: 'PUT',
  })
}

// 删除消息
export function deleteOne(id: number) {
  return request({
    url: `/api/v1/notifications/${id}`,
    method: 'DELETE',
  })
}

// 获取单条消息详情
export function getDetail(id: number) {
  return request<NotificationItem>({
    url: `/api/v1/notifications/${id}`,
    method: 'GET',
  })
}
