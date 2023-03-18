import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/web/user/login',
        method: 'post',
        data
    })
}
export function getopenid(data) {
    return request({
        url: '/web/wx_pay/getopenid',
        method: 'post',
        data
    })
}

export function updateOpenId(data) {
    return request({
        url: '/web/user/updateOpenId',
        method: 'post',
        data
    })
}
export function refreshToken(data) {
    return request({
        url: '/web/user/refreshToken',
        method: 'post',
        data
    })
}

export function updateUserInfo(data) {
    return request({
        url: '/web/user/updateUserInfo',
        method: 'post',
        data
    })
}

export function checkInfo(data) {
    return request({
        url: '/web/user/checkInfo',
        method: 'post',
        data
    })
}
export function register(data) {
    return request({
        url: '/web/user/register',
        method: 'post',
        data
    })
}

export function getCodeByRegister(data) {
    return request({
        url: '/web/sms/getCodeByRegister',
        method: 'post',
        data
    })
}

export function setPayPic(data) {
    return request({
        url: '/web/rush/setPayPic',
        method: 'post',
        data
    })
}

export function myGoodsList(data) {
    return request({
        url: '/web/user_goods/myFavGoods',
        method: 'post',
        data
    })
}

export function myPayedGoodsList(data) {
    return request({
        url: '/web/user_goods/myPayedGoods',
        method: 'post',
        data
    })
}


export function logout(data) {
    return request({
        url: '/web/user/logout',
        method: 'post',
        data
    })
}

export function resetPwd(data) {
    return request({
        url: '/web/user/resetPwd',
        method: 'post',
        data
    })
}


export function getCodeByFindPwd(data) {
    return request({
        url: '/web/sms/getCodeByFindPwd',
        method: 'post',
        data
    })
}

export function resetPwdSmsCode(data) {
    return request({
        url: '/web/user/resetPwdSmsCode',
        method: 'post',
        data
    })
}

export function getInfo(data) {
    return request({
        url: '/web/user/getInfo',
        method: 'post',
        data
    })
}

export function editNickname(data) {
    return request({
        url: '/web/user/editNickname',
        method: 'post',
        data
    })
}

export function editAvatar(data) {
    return request({
        url: '/web/user/editAvatar',
        method: 'post',
        data
    })
}

export function editReceiptCode(data) {
    return request({
        url: '/web/user/editReceiptCode',
        method: 'post',
        data
    })
}

export function whoIsRecommender(data) {
    return request({
        url: '/web/user/whoIsRecommender',
        method: 'post',
        data
    })
}

export function getFansOrder(data) {
    return request({
        url: '/web/user/getFansOrder',
        method: 'post',
        data
    })
}

export function getFansOrderInfo(data) {
    return request({
        url: '/web/user/getFansOrderInfo',
        method: 'post',
        data
    })
}

export function setData(data) {
    return request({
        url: '/web/common/setData',
        method: 'post',
        data
    })
}

