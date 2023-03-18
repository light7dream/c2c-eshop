import request from '@/utils/request'

export function getProtocol(data) {
    return request({
        url: '/admin/protocol/getProtocol',
        method: 'post',
        data
    })
}

export function updateProtocol(data) {
    return request({
        url: '/admin/protocol/updateProtocol',
        method: 'post',
        data
    })
}
