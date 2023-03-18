import request from '@/utils/request'

export function getCoupons(data) {
    return request({
        url: '/admin/coupon/getCoupon',
        method: 'post',
        data
    })
}

export function addCoupon(data) {
    return request({
        url: '/admin/coupon/add',
        method: 'post',
        data
    })
}

export function updateCoupon(data) {
    return request({
        url: '/admin/coupon/update',
        method: 'post',
        data
    })
}

export function deleteCoupon(data) {
    return request({
        url: '/admin/coupon/delete',
        method: 'post',
        data
    })
}
export function setUserCoupon(data) {
    return request({
        url: '/admin/coupon/setUserCoupon',
        method: 'post',
        data
    })
}