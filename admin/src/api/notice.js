import request from '@/utils/request'

export function getNotices(data) {
    return request({
        url: '/admin/notice/getNotice',
        method: 'post',
        data
    })
}

export function addNotice(data) {
    return request({
        url: '/admin/notice/add',
        method: 'post',
        data
    })
}

export function updateNotice(data) {
    return request({
        url: '/admin/notice/update',
        method: 'post',
        data
    })
}

export function updateNoticeOrder(data) {
    return request({
        url: '/admin/notice/updateOrder',
        method: 'post',
        data
    })
}

export function deleteNotice(data) {
    return request({
        url: '/admin/notice/delete',
        method: 'post',
        data
    })
}
