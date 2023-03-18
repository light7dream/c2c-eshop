import request from '@/utils/request'

export function setHandlingFeeRate(data) {
    return request({
        url: '/admin/system/setHandlingFeeRate',
        method: 'post',
        data
    })
}
export function getHandlingFeeRate() {
    return request({
        url: '/admin/system/getHandlingFeeRate',
        method: 'post',
    })
}
export function getNewUserPrivilege() {
    return request({
        url: '/admin/system/getNewUserPrivilege',
        method: 'post',
    })
}
export function setNewUserPrivilege(data) {
    return request({
        url: '/admin/system/setNewUserPrivilege',
        method: 'post',
        data
    })
}
export function getCommonUserLimit() {
    return request({
        url: '/admin/system/getCommonUserLimit',
        method: 'post',
    })
}
export function setCommonUserLimit(data) {
    return request({
        url: '/admin/system/setCommonUserLimit',
        method: 'post',
        data
    })
}
export function getIncomeRate() {
    return request({
        url: '/admin/system/getIncomeRate',
        method: 'post',
    })
}
export function setIncomeRate(data) {
    return request({
        url: '/admin/system/setIncomeRate',
        method: 'post',
        data
    })
}
export function getRecommenderTree(data) {
    return request({
        url: '/admin/user/getRecommenderTree2',
        method: 'post',
        data
    })
}
export function getOrderStatistics(data) {
    return request({
        url: '/admin/system/getOrderStatistics',
        method: 'post',
        data
    })
}


export function getGoodsLaunchTime() {
    return request({
        url: '/admin/system/getGoodsLaunchTime',
        method: 'post',
    })
}
export function setGoodsLaunchTime(data) {
    return request({
        url: '/admin/system/setGoodsLaunchTime',
        method: 'post',
        data
    })
}

export function getAllGoodsLaunchStatus() {
    return request({
        url: '/admin/system/getAllGoodsLaunchStatus',
        method: 'post',
    })
}
export function setAllGoodsLaunchStatus(data) {
    return request({
        url: '/admin/system/setAllGoodsLaunchStatus',
        method: 'post',
        data
    })
}

export function getGoodsLaunchGain() {
    return request({
        url: '/admin/system/getGoodsLaunchGain',
        method: 'post',
    })
}
export function setGoodsLaunchGain(data) {
    return request({
        url: '/admin/system/setGoodsLaunchGain',
        method: 'post',
        data
    })
}
export function getFansOrderStatisticsByUser(data) {
    return request({
        url: '/admin/system/getFansOrderStatisticsByUser',
        method: 'post',
        data
    })
}
export function getFansAccessData(data) {
    return request({
        url: '/admin/system/getFansAccessData',
        method: 'post',
        data
    })
}
export function getTodayRushAccess(data) {
    return request({
        url: '/admin/system/getTodayRushAccess',
        method: 'post',
        data
    })
}
export function getAccessData(data) {
    return request({
        url: '/admin/system/getAccessData',
        method: 'post',
        data
    })
}