let router = require('express').Router();

// 用户相关
let user = require("./user");
// router.post('/user/login', user.login);
router.post('/user/refreshToken', user.refreshToken);
// router.post('/user/getInfo', user.getInfo);
router.post('/user/register', user.register);
router.post('/user/resetPwd', user.resetPwd);
router.post('/user/resetPwdSmsCode', user.resetPwdSmsCode);
router.post('/user/updateUserInfo', user.updateUserInfo);
router.post('/user/getFansDataInfo', user.getFansDataInfo);
router.post('/user/getFansList', user.getFansList);
router.post('/user/logout', user.logout);
router.post('/user/whoIsRecommender', user.whoIsRecommender);
router.post('/user/checkInfo', user.checkInfo);
router.post('/user/getFansOrder', user.getFansOrder);
router.post('/user/getFansOrderInfo', user.getFansOrderInfo);
router.post('/user/editNickname', user.editNickname);
router.post('/user/editAvatar', user.editAvatar);
router.post('/user/editReceiptCode', user.editReceiptCode);
router.post('/user/updateOpenId', user.updateOpenId);
let userv2 = require("./v2/user");
router.post('/user/login', userv2.login);
router.post('/user/getInfo', userv2.getInfo);


// 公用接口
let common = require("./common");
router.post('/common/getCategory', common.getCategory);
router.post('/common/getNotice', common.getNotice);
router.post('/common/getGoodsList', common.getGoodsList);
router.post('/common/getBannerList', common.getBannerList);
router.post('/common/getProtocolBaseUrl', common.getProtocolBaseUrl);
router.get('/common/getProtocol', common.getProtocol);
router.post('/common/getHandlingFeeRate', common.getHandlingFeeRate);
router.post('/common/getGoodsLaunchTime', common.getGoodsLaunchTime);
router.post('/common/getAllGoodsLaunchStatus', common.getAllGoodsLaunchStatus);
router.post('/common/getGoodsLaunchGain', common.getGoodsLaunchGain);
router.post('/common/setData', common.setData);
router.post('/common/getServeTime', common.getServeTime);

// 验证码相关
let sms = require("./sms");
router.post('/sms/getCodeByRegister', sms.getCodeByRegister);
router.post('/sms/getCodeByFindPwd', sms.getCodeByFindPwd);

// 地址相关
let address = require("./address");
router.post('/address/getList', address.getList);
router.post('/address/getDetail', address.getDetail);
router.post('/address/add', address.add);
router.post('/address/update', address.update);
router.post('/address/delete', address.delete);

// 收益相关
let user_income = require("./user_income");
router.post('/income/getIncomeInfo', user_income.getIncomeInfo);
router.post('/income/getIncomeRecord', user_income.getIncomeRecord);
router.post('/income/getIncomeRecordNotSure', user_income.getIncomeRecordNotSure);
router.post('/income/getWithdrawalRecord', user_income.getWithdrawalRecord);
router.post('/income/withDrawal', user_income.withDrawal);
router.post('/income/getOrderSaleIncomeInfo', user_income.getOrderSaleIncomeInfo);
router.post('/income/getOrderSaleIncome', user_income.getOrderSaleIncome);


// 快递相关
let user_parcel = require("./user_parcel");
router.post('/user_parcel/getList', user_parcel.getList);
router.post('/user_parcel/needParcel', user_parcel.needParcel);
router.post('/user_parcel/ack', user_parcel.ack);
router.post('/user_parcel/delete', user_parcel.delete);


// 抢购相关
let rush = require("./rush");
// router.post('/rush/getRushSchedule', rush.getRushSchedule);
router.post('/rush/getUserGTime', rush.getUserGTime);
// router.post('/rush/getRushGoods', rush.getRushGoods);
router.post('/rush/setPayPic', rush.setPayPic);
router.post('/rush/payPrepare', rush.payPrepare);
router.post('/rush/aliPayPrepare', rush.aliPayPrepare)
router.post('/rush/payAck', rush.payAck)
router.post('/rush/disputeOrder', rush.disputeOrder)
router.post('/rush/shoot', rush.shoot)
let rushv2 = require("./v2/rush");
router.post('/rush/getRushSchedule', rushv2.getRushSchedule);
router.post('/rush/getRushGoods', rushv2.getRushGoods);

// oss相关
let oss = require('./oss')
router.post('/oss/getAuth', oss.getAuth)

// 用户商品相关
let user_goods = require('./user_goods')
router.post('/user_goods/getGoodsDetail', user_goods.getGoodsDetail)
router.post('/user_goods/myGoods', user_goods.myGoods)
router.post('/user_goods/myPayedGoods', user_goods.myPayedGoods)
// router.post('/user_goods/imBuyer', user_goods.imBuyer)
// router.post('/user_goods/imSaler', user_goods.imSaler)
router.post('/user_goods/viewPayImg', user_goods.viewPayImg)
router.post('/user_goods/giveMe', user_goods.giveMe)
router.post('/user_goods/cancelOrder', user_goods.cancelOrder)
router.post('/user_goods/addCart', user_goods.addCart)
router.post('/user_goods/removeCart', user_goods.removeCart)
router.post('/user_goods/removeCartBatch', user_goods.removeCartBatch)
router.post('/user_goods/updateCart', user_goods.updateCart)
router.post('/user_goods/myCartList', user_goods.myCartList)
router.post('/user_goods/myFavGoods', user_goods.myFavGoods)
let user_goodsv2 = require("./v2/user_goods");
router.post('/user_goods/imBuyer', user_goodsv2.imBuyer)
router.post('/user_goods/imSaler', user_goodsv2.imSaler)

// 订单相关
let order = require('./order')
router.post('/order/purchasePrepare', order.purchasePrepare)
router.post('/order/alipayPurchasePrepare', order.alipayPurchasePrepare)
router.post('/order/purchaseAck', order.purchaseAck);
router.post('/order/addPayImg', order.addPayImg);
router.post('/order/submitOrder', order.submitOrder);
router.post('/order/submitShelvesOrder', order.submitShelvesOrder);
router.post('/order/cancelShelvesOrder', order.cancelShelvesOrder);
router.post('/order/viewOrder', order.viewOrder);



// 优惠券相关
let coupon = require("./coupon");
router.post('/coupon/getCouponList', coupon.getCouponList);

let wx_pay = require("../wx_pay")
router.post('/wx_pay/getopenid', wx_pay.getopenid);

module.exports = router;