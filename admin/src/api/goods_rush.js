import request from '@/utils/request'

export function getGoods(data) {
    return request({
        url: '/admin/goods_rush/getGoods',
        method: 'post',
        data
    })
}

export function addGoods(data) {
    return request({
        url: '/admin/goods_rush/add',
        method: 'post',
        data
    })
}

export function updateGoods(data) {
    return request({
        url: '/admin/goods_rush/update',
        method: 'post',
        data
    })
}

export function deleteGoods(data) {
    return request({
        url: '/admin/goods_rush/delete',
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

export function divRushGoods(data) {
    return request({
        url: '/admin/goods_rush/divRushGoods',
        method: 'post',
        data
    })
}

export function getCanDivGoods(data) {
    return request({
        url: '/admin/goods_rush/getCanDivGoods',
        method: 'post',
        data
    })
}
export function exportGoodsList(data) {
    return request({
        url: '/admin/goods_rush/exportGoods',
        method: 'post',
        data
    })
}

export function updateBucket(data) {
  return request({
      url: '/admin/goods_rush/updateBucket',
      method: 'post',
      data
  })
}