import request from '@/utils/request'

export function getCategories(data) {
    return request({
        url: '/admin/category/getCategory',
        method: 'post',
        data
    })
}

export function addCategory(data) {
    return request({
        url: '/admin/category/add',
        method: 'post',
        data
    })
}

export function updateCategory(data) {
    return request({
        url: '/admin/category/update',
        method: 'post',
        data
    })
}

export function deleteCategory(data) {
    return request({
        url: '/admin/category/delete',
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
