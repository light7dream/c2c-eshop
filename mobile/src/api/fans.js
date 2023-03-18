
import request from '@/utils/request'

export function getFansList(data) {
    return request({
        url: '/web/user/getFansList',
        method: 'post',
        data
    })
}

export function getFansDataInfo(data) {
    return request({
        url: '/web/user/getFansDataInfo',
        method: 'post',
        data
    })
}
