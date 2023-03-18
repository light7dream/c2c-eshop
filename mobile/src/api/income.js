
import request from '@/utils/request'

export function getIncomeInfo(data) {
    return request({
        url: '/web/income/getIncomeInfo',
        method: 'post',
        data
    })
}

export function getIncomeRecord(data) {
    return request({
        url: '/web/income/getIncomeRecord',
        method: 'post',
        data
    })
}

export function getWithdrawalRecord(data) {
    return request({
        url: '/web/income/getWithdrawalRecord',
        method: 'post',
        data
    })
}

export function withDrawal(data) {
    return request({
        url: '/web/income/withDrawal',
        method: 'post',
        data
    })
}

export function getOrderSaleIncomeInfo(data) {
    return request({
        url: '/web/income/getOrderSaleIncomeInfo',
        method: 'post',
        data
    })
} 

export function getOrderSaleIncome(data) {
    return request({
        url: '/web/income/getOrderSaleIncome',
        method: 'post',
        data
    })
}

export function getIncomeRecordNotSure(data) {
    return request({
        url: '/web/income/getIncomeRecordNotSure',
        method: 'post',
        data
    })
}
