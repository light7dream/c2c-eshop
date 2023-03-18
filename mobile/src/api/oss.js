import request from '@/utils/request'

export function getUploadAuth(data) {
    return request({
        url: '/web/oss/getAuth',
        method: 'post',
        data
    })
}
