import request from '@/utils/request'

export function syncRush(data) {
    return request({
        url: '/admin/sync/syncRush',
        method: 'post',
        data
    })
}

export function syncShelves(data) {
    return request({
        url: '/admin/sync/syncShelves',
        method: 'post',
        data
    })
}

export function celarUserGod(data) {
    return request({
        url: '/admin/sync/celarUserGod',
        method: 'post',
        data
    })
}

export function celarAllUserBlackList(data) {
    return request({
        url: '/admin/sync/celarAllUserBlackList',
        method: 'post',
        data
    })
}

export function clearAllUserPrivilege(data) {
    return request({
        url: '/admin/sync/clearAllUserPrivilege',
        method: 'post',
        data
    })
}

export function syncCommon(data) {
    return request({
        url: '/admin/sync/syncCommon',
        method: 'post',
        data
    })
}