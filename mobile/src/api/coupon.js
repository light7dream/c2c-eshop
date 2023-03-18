
import request from '@/utils/request'

export function getCouponList(data) {
    return request({
        url: '/web/coupon/getCouponList',
        method: 'post',
        data
    })
}
