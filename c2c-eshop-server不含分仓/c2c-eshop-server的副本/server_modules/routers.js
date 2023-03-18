/**
 * 路由列表
 */
let routers = {};

let specialRouter = require('express').Router();
let qr_code = require('./qr_code');
let wx_pay = require('./wx_pay');
let aliPay = require('./aliPay')
specialRouter.post('/qrTest', qr_code.qrTest)
specialRouter.post('/wxcallback', wx_pay.paycallback)
specialRouter.post('/alipaycallback', aliPay.paycallback)
specialRouter.post('/getopenid', wx_pay.getopenid);
specialRouter.post('/getSign', wx_pay.getSign);

routers.list = [
    {
        name: '/web/',
        router: require('./api_web/router'),
    },
    {
        name: '/admin/',
        router: require('./api_admin/router'),
    },
    {
        name: '/web/',
        router: specialRouter
    },
];

module.exports = routers;