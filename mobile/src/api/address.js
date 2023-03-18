
import request from '@/utils/request'

export function getAddressList(data) {
    return request({
        url: '/web/address/getList',
        method: 'post',
        data
    })
}

export function getDetail(data) {
    return request({
        url: '/web/address/getDetail',
        method: 'post',
        data
    })
}

export function addAddress(data) {
    return request({
        url: '/web/address/add',
        method: 'post',
        data
    })
}

export function updateAddress(data) {
    return request({
        url: '/web/address/update',
        method: 'post',
        data
    })
}

export function deleteAddress(data) {
    return request({
        url: '/web/address/delete',
        method: 'post',
        data
    })
}