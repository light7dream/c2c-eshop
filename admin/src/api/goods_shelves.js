import request from '@/utils/request'

export function getGoods(data) {
    return request({
        url: '/admin/goods/getGoods',
        method: 'post',
        data
    })
}

export function addGoods(data) {
    return request({
        url: '/admin/goods/add',
        method: 'post',
        data
    })
}

export function updateGoods(data) {
    return request({
        url: '/admin/goods/update',
        method: 'post',
        data
    })
}

export function deleteGoods(data) {
    return request({
        url: '/admin/goods/delete',
        method: 'post',
        data
    })
}

export function getUploadAuth(data) {
    return request({
        url: '/admin/oss/getAuth',
        method: 'post',
        data
    })
}

export function getCategories(data) {
    return request({
        url: '/admin/category/getCategory',
        method: 'post',
        data
    })
}
export function exportGoodsList(data) {
    return request({
        url: '/admin/goods/exportGoods',
        method: 'post',
        data
    })
}