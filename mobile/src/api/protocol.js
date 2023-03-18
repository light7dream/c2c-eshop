import request from '@/utils/request'

export function getProtocolBaseUrl(data) {
    return request({
        url: '/web/common/getProtocolBaseUrl',
        method: 'post',
        data
    })
}
