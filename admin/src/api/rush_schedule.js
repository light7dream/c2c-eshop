import request from '@/utils/request'

export function getList(data) {
    return request({
        url: '/admin/rush_schedule/getList',
        method: 'post',
        data
    })
}

export function addRush(data) {
    return request({
        url: '/admin/rush_schedule/add',
        method: 'post',
        data
    })
}

export function updateRush(data) {
    return request({
        url: '/admin/rush_schedule/update',
        method: 'post',
        data
    })
}

export function deleteRush(data) {
    return request({
        url: '/admin/rush_schedule/delete',
        method: 'post',
        data
    })
}
