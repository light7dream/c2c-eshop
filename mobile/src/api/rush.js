import request from '@/utils/request'

export function getCategorys(data) {
    return request({
        url: '/web/common/getCategory',
        method: 'post',
        data
    })
}

export function getRushSchedule(data) {
    return request({
        url: '/web/rush/getRushSchedule',
        method: 'post',
        data
    })
}

export function getRushGoods(data) {
    return request({
        url: '/web/rush/getRushGoods',
        method: 'post',
        data
    })
}

export function shoot(data) {
    return request({
        url: '/web/rush/shoot',
        method: 'post',
        data
    })
}

export function getUserGTime(data) {
    return request({
        url: '/web/rush/getUserGTime',
        method: 'post',
        data
    })
}

export function payPrepare(data) {
    return request({
        url: '/web/rush/payPrepare',
        method: 'post',
        data
    })
}

export function pay(data) {
    return request({
        url: '/web/rush/pay',
        method: 'post',
        data
    })
}

export function payAck(data) {
    return request({
        url: '/web/rush/payAck',
        method: 'post',
        data
    })
}

export function disputeOrder(data) {
    return request({
        url: '/web/rush/disputeOrder',
        method: 'post',
        data
    })
}
