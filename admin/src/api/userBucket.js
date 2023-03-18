import request from '@/utils/request'

export function getBucketList(data) {
    return request({
        url: '/admin/user_bucket/getBucketList',
        method: 'post',
        data
    })
}

export function createBucket(data) {
    return request({
        url: '/admin/user_bucket/createBucket',
        method: 'post',
        data
    })
}

export function deleteBucket(data) {
    return request({
        url: '/admin/user_bucket/deleteBucket',
        method: 'post',
        data
    })
}
export function getBucketMembers(data) {
    return request({
        url: '/admin/user_bucket/getBucketMembers',
        method: 'post',
        data
    })
}
