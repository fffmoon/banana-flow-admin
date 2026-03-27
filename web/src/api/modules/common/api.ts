import request from '@apis/request'

export function UploadImage(file: FormData) {
  return request({
    url: '/api/v1/upload/image',
    method: 'POST',
    data: file,
  })
}
