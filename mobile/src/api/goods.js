import request from '@/utils/request'

/**
 * 获取分类
 * @param {*} data 
 * @returns 
 */
export function getCategorys(data) {
    return request({
        url: '/web/common/getCategory',
        method: 'post',
        data
    })
}

/**
 * 获取Banner
 * @param {*} data 
 * @returns 
 */
export function getBannerList(data) {
    return request({
        url: '/web/common/getBannerList',
        method: 'post',
        data
    })
}

/**
 * 获取商城商品
 * @param {*} data 
 * @returns 
 */
export function getGoodsList(data) {
    return request({
        url: '/web/common/getGoodsList',
        method: 'post',
        data
    })
}

/**
 * 获取详情
 * @param {*} data 
 * @returns 
 */
export function getGoodsDetail(data) {
    return request({
        url: '/web/user_goods/getGoodsDetail',
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

export function purchaseAck(data) {
    return request({
        url: '/web/order/purchaseAck',
        method: 'post',
        data
    })
}



export function imBuyerList(data) {
    return request({
        url: '/web/user_goods/imBuyer',
        method: 'post',
        data
    })
}

export function imSalerList(data) {
    return request({
        url: '/web/user_goods/imSaler',
        method: 'post',
        data
    })
}

export function addPayImg(data) {
    return request({
        url: '/web/order/addPayImg',
        method: 'post',
        data
    })
}

export function viewPayImg(data) {
    return request({
        url: '/web/user_goods/viewPayImg',
        method: 'post',
        data
    })
}

export function giveMe(data) {
    return request({
        url: '/web/user_goods/giveMe',
        method: 'post',
        data
    })
}

export function cancelOrder(data) {
    return request({
        url: '/web/user_goods/cancelOrder',
        method: 'post',
        data
    })
}

/**
 * 添加购物车
 * @param {*} data 
 * @returns 
 */
export function addCart(data) {
    return request({
        url: '/web/user_goods/addCart',
        method: 'post',
        data
    })
}

/**
 * 我的购物车列表
 * @param {*} data 
 * @returns 
 */
export function myCartList(data) {
    return request({
        url: '/web/user_goods/myCartList',
        method: 'post',
        data
    })
}

/**
 * 移除购物车
 * @param {*} data 
 * @returns 
 */
export function removeCart(data) {
    return request({
        url: '/web/user_goods/removeCart',
        method: 'post',
        data
    })
}

/**
 * 批量移除购物车
 * @param {*} data 
 * @returns 
 */
 export function removeCartBatch(data) {
    return request({
        url: '/web/user_goods/removeCartBatch',
        method: 'post',
        data
    })
}

/**
 * 更新购物车
 * @param {*} data 
 * @returns 
 */
export function updateCart(data) {
    return request({
        url: '/web/user_goods/updateCart',
        method: 'post',
        data
    })
}

/**
 * 获取上架手续费率
 * @param {*} data 
 * @returns 
 */
export function getHandlingFeeRate(data) {
    return request({
        url: '/web/common/getHandlingFeeRate',
        method: 'post',
        data
    })
}

/**
 * 获取上架价格上浮比率
 * @param {*} data 
 * @returns 
 */
export function getGoodsLaunchGain(data) {
    return request({
        url: '/web/common/getGoodsLaunchGain',
        method: 'post',
        data
    })
}

/**
 * 获取商品委托上架时间（单位h）
 * @param {*} data 
 * @returns 
 */
export function getGoodsLaunchTime(data) {
    return request({
        url: '/web/common/getGoodsLaunchTime',
        method: 'post',
        data
    })
}

/**
 * 获取全平台商品是否允许上架
 * @param {*} data 
 * @returns 
 */
export function getAllGoodsLaunchStatus(data) {
    return request({
        url: '/web/common/getAllGoodsLaunchStatus',
        method: 'post',
        data
    })
}
