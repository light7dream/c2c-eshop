import request from '@/utils/request'

export function submitOrder(data) {
    return request({
        url: '/web/order/submitOrder',
        method: 'post',
        data
    })
}

export function submitShelvesOrder(data) {
    return request({
        url: '/web/order/submitShelvesOrder',
        method: 'post',
        data
    })
}

export function cancelShelvesOrder(data) {
    return request({
        url: '/web/order/cancelShelvesOrder',
        method: 'post',
        data
    })
}

export function viewOrder(data) {
    return request({
        url: '/web/order/viewOrder',
        method: 'post',
        data
    })
}
export function purchasePrepare(data) {
    return request({
        url: '/web/order/purchasePrepare',
        method: 'post',
        data
    })
}

export function alipayPurchasePrepare(data) {
    return request({
        url: '/web/order/alipayPurchasePrepare',
        method: 'post',
        data
    })
}
export function purchaseAck(data) {
    return request({
        url: '/web/order/purchaseAck',
        method: 'post',
        data
    })
}


