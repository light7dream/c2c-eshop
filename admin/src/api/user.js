import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/admin/login',
        method: 'post',
        data
    })
}

export function getInfo(token) {
    return request({
        url: '/admin/getInfo',
        method: 'post',
        params: { token }
    })
}

export function logout() {
    return request({
        url: '/admin/logout',
        method: 'post'
    })
}

export function getUserList(data) {
    return request({
        url: '/admin/user/getList',
        method: 'post',
        data
    })
}

export function resetUserPwd(data) {
    return request({
        url: '/admin/user/resetPwd',
        method: 'post',
        data
    })
}

export function freeUser(data) {
    return request({
        url: '/admin/user/free',
        method: 'post',
        data
    })
}

export function forbiddenUser(data) {
    return request({
        url: '/admin/user/forbidden',
        method: 'post',
        data
    })
}

export function deleteUser(data) {
    return request({
        url: '/admin/user/delete',
        method: 'post',
        data
    })
}

export function setBadUser(data) {
    return request({
        url: '/admin/user/setBadUser',
        method: 'post',
        data
    })
}

export function getUserGodState(data) {
    return request({
        url: '/admin/user_god/getGodState',
        method: 'post',
        data
    })
}


export function setUserGodState(data) {
    return request({
        url: '/admin/user_god/setGodState',
        method: 'post',
        data
    })
}

export function getRushGoods(data) {
    return request({
        url: '/admin/goods_rush/getGoods',
        method: 'post',
        data
    })
}

export function getUserOrderList(data) {
    return request({
        url: '/admin/user/getOrders',
        method: 'post',
        data
    })
}
export function getRecommenders(data) {
    return request({
        url: '/admin/user/getRecommenders',
        method: 'post',
        data
    })
}
export function setUserRecommender(data) {
    return request({
        url: '/admin/user/setUserRecommender',
        method: 'post',
        data
    })
}

export function viewOrderPayImg(data) {
    return request({
        url: '/admin/user/viewOrderPayImg',
        method: 'post',
        data
    })
}
export function getUserWithdrawalList(data) {
    return request({
        url: '/admin/user/getUserWithdrawalList',
        method: 'post',
        data
    })
}
export function getWithdrawalList(data) {
    return request({
        url: '/admin/user/getWithdrawalList',
        method: 'post',
        data
    })
}

export function ackUserWithdrawal(data) {
    return request({
        url: '/admin/user/ackUserWithdrawal',
        method: 'post',
        data
    })
}
export function getBelongUserRushGoods(data) {
    return request({
        url: '/admin/user/getBelongUserRushGoods',
        method: 'post',
        data
    })
}
export function getUserCoupon(data) {
    return request({
        url: '/admin/coupon/getUserCoupon',
        method: 'post',
        data
    })
}
export function setUserEditBankAccess(data) {
    return request({
        url: '/admin/user/setUserEditBankAccess',
        method: 'post',
        data
    })
}
export function getRushOrders(data) {
    return request({
        url: '/admin/user_order/getList',
        method: 'post',
        data
    })
}
export function cancelOrder(data) {
    return request({
        url: '/admin/user_order/cancelOrder',
        method: 'post',
        data
    })
}
export function exportRushOrders(data) {
    return request({
        url: '/admin/user_order/exportList',
        method: 'post',
        data
    })
}
export function getShelvesOrder(data) {
    return request({
        url: '/admin/user/getShelvesOrder',
        method: 'post',
        data
    })
}
export function getDisputeOrder(data) {
    return request({
        url: '/admin/user/getDisputeOrder',
        method: 'post',
        data
    })
}
export function getPickupOrder(data) {
    return request({
        url: '/admin/user/getPickupOrder',
        method: 'post',
        data
    })
}


export function setRushOrderInfo(data) {
    return request({
        url: '/admin/user/setRushOrderInfo',
        method: 'post',
        data
    })
}
export function setShelvesOrderInfo(data) {
    return request({
        url: '/admin/user/setShelvesOrderInfo',
        method: 'post',
        data
    })
}
export function getUserFans(data) {
    return request({
        url: '/admin/user/getUserFansList',
        method: 'post',
        data
    })
}
export function getUserFansOrder(data) {
    return request({
        url: '/admin/user/getUserFansOrder',
        method: 'post',
        data
    })
}
export function setAdminUser(data) {
    return request({
        url: '/admin/user/setAdminUser',
        method: 'post',
        data
    })
}
export function removeAdminUser(data) {
    return request({
        url: '/admin/user/removeAdminUser',
        method: 'post',
        data
    })
}
export function getTopFuns(data) {
    return request({
        url: '/admin/user/getTopFuns',
        method: 'post',
        data
    })
}
export function exportUserList(data) {
    return request({
        url: '/admin/user/exportList',
        method: 'post',
        data
    })
}

export function resetUser(data) {
  return request({
      url: '/admin/user/resetUser',
      method: 'post',
      data
  })
}
export function deleteDeep(data) {
  return request({
      url: '/admin/user/deleteDeep',
      method: 'post',
      data
  })
}

export function updateBucket(data) {
  return request({
      url: '/admin/user/updateBucket',
      method: 'post',
      data
  })
}