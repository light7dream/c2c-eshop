let router = require('express').Router();
// 管理员
let admin = require("./admin");
router.post('/login', admin.login);
router.post('/getInfo', admin.getInfo);
router.post('/randomAddUser', admin.randomAddUser);
router.post('/oss/getAuth', admin.getAuth);
router.post('/protocol/getProtocolList', admin.getProtocolList);
router.post('/protocol/updateProtocol', admin.updateProtocol);
router.post('/protocol/getProtocol', admin.getProtocol);
router.post('/system/setHandlingFeeRate', admin.setHandlingFeeRate);
router.post('/system/getHandlingFeeRate', admin.getHandlingFeeRate);
router.post('/system/getGoodsLaunchTime', admin.getGoodsLaunchTime);
router.post('/system/setGoodsLaunchTime', admin.setGoodsLaunchTime);
router.post('/system/getAllGoodsLaunchStatus', admin.getAllGoodsLaunchStatus);
router.post('/system/setAllGoodsLaunchStatus', admin.setAllGoodsLaunchStatus);
router.post('/system/getGoodsLaunchGain', admin.getGoodsLaunchGain);
router.post('/system/setGoodsLaunchGain', admin.setGoodsLaunchGain);
router.post('/system/getIncomeRate', admin.getIncomeRate);
router.post('/system/setIncomeRate', admin.setIncomeRate);
router.post('/system/getNewUserPrivilege', admin.getNewUserPrivilege);
router.post('/system/setNewUserPrivilege', admin.setNewUserPrivilege);
router.post('/system/getCommonUserLimit', admin.getCommonUserLimit);
router.post('/system/setCommonUserLimit', admin.setCommonUserLimit);
router.post('/system/getOrderStatistics', admin.getOrderStatistics);
router.post('/system/getFansOrderStatisticsByUser', admin.getFansOrderStatisticsByUser);
router.post('/system/getTodayRushAccess', admin.getTodayRushAccess);
router.post('/system/getAccessData', admin.getAccessData);
router.post('/system/getFansAccessData', admin.getFansAccessData)


// 商品分类
let goods_category = require("./goods_category");
router.post('/category/getCategory', goods_category.getCategory);
router.post('/category/add', goods_category.add);
router.post('/category/update', goods_category.update);
router.post('/category/delete', goods_category.delete);

// 公告
let public_notice = require("./public_notice");
router.post('/notice/getNotice', public_notice.getNotice);
router.post('/notice/add', public_notice.add);
router.post('/notice/update', public_notice.update);
router.post('/notice/updateOrder', public_notice.updateOrder);
router.post('/notice/delete', public_notice.delete);

// 优惠券
let coupon = require("./coupon");
router.post('/coupon/getCoupon', coupon.getCoupon);
router.post('/coupon/add', coupon.add);
router.post('/coupon/update', coupon.update);
router.post('/coupon/delete', coupon.delete);
router.post('/coupon/getUserCoupon', coupon.getUserCoupon);
router.post('/coupon/setUserCoupon', coupon.setUserCoupon);

// 抢购场次
let rush_schedule = require("./rush_schedule");
router.post('/rush_schedule/getList', rush_schedule.getList);
router.post('/rush_schedule/add', rush_schedule.add);
router.post('/rush_schedule/update', rush_schedule.update);
router.post('/rush_schedule/delete', rush_schedule.delete);


// 快递相关
let user_parcel = require("./user_parcel");
router.post('/user_parcel/getList', user_parcel.getList);
router.post('/user_parcel/update', user_parcel.update);


// 货架商品
let goods_shelves = require("./goods_shelves");
router.post('/goods/getGoods', goods_shelves.getGoods);
router.post('/goods/exportGoods', goods_shelves.exportGoods);
router.post('/goods/add', goods_shelves.add);
router.post('/goods/update', goods_shelves.update);
router.post('/goods/delete', goods_shelves.delete);


// 抢购商品
let goods_rush = require("./goods_rush");
// router.post('/goods_rush/getGoods', goods_rush.getGoods);
// router.post('/goods_rush/add', goods_rush.add);
// router.post('/goods_rush/update', goods_rush.update);
router.post('/goods_rush/getCanDivGoods', goods_rush.getCanDivGoods);
// router.post('/goods_rush/divRushGoods', goods_rush.divRushGoods);
// router.post('/goods_rush/delete', goods_rush.delete);
let goods_rushv2 = require("./v2/goods_rush");
router.post('/goods_rush/getGoods', goods_rushv2.getGoods);
router.post('/goods_rush/exportGoods', goods_rushv2.exportGoods);
router.post('/goods_rush/add', goods_rushv2.add);
router.post('/goods_rush/update', goods_rushv2.update);
router.post('/goods_rush/divRushGoods', goods_rushv2.divRushGoods);
router.post('/goods_rush/delete', goods_rushv2.delete);
router.post('/goods_rush/updateBucket', goods_rushv2.updateBucket);


// 用户管理相关
let user = require("./user");
// router.post('/user/getList', user.getList);
router.post('/user/resetPwd', user.resetPwd);
router.post('/user/free', user.free);
router.post('/user/forbidden', user.forbidden);
router.post('/user/delete', user.delete);
router.post('/user/setAdminUser', user.setAdminUser);
router.post('/user/removeAdminUser', user.removeAdminUser);
router.post('/user/resetUser', user.resetUser);
router.post('/user/deleteDeep', user.deleteDeep);
// router.post('/user/getOrders', user.getOrders);
router.post('/user/getBelongUserRushGoods', user.getBelongUserRushGoods);
router.post('/user/viewOrderPayImg', user.viewOrderPayImg);
router.post('/user/setUserEditBankAccess', user.setUserEditBankAccess);
router.post('/user/setBadUser', user.setBadUser);
router.post('/user/setUserRecommender', user.setUserRecommender);
router.post('/user/getWithdrawalList', user.getWithdrawalList);
router.post('/user/getUserWithdrawalList', user.getUserWithdrawalList);
router.post('/user/ackUserWithdrawal', user.ackUserWithdrawal);
router.post('/user/getRecommenders', user.getRecommenders);
router.post('/user/getRecommenderTree', user.getRecommenderTree);
router.post('/user/getRecommenderTree2', user.getRecommenderTree_old);
// router.post('/user/getDisputeOrder', user.getDisputeOrder);
// router.post('/user/getPickupOrder', user.getPickupOrder);
// router.post('/user/getShelvesOrder', user.getShelvesOrder);
// router.post('/user/setRushOrderInfo', user.setRushOrderInfo);
router.post('/user/setShelvesOrderInfo', user.setShelvesOrderInfo);
router.post('/user/getUserFansList', user.getUserFansList);
router.post('/user/getUserFansOrder', user.getUserFansOrder);
router.post('/user/getTopFuns', user.getTopFuns)
let userv2 = require("./v2/user");
router.post('/user/getList', userv2.getList);
router.post('/user/exportList', userv2.exportList);
router.post('/user/setRushOrderInfo', userv2.setRushOrderInfo);
router.post('/user/getOrders', userv2.getOrders);
router.post('/user/getDisputeOrder', userv2.getDisputeOrder);
router.post('/user/getPickupOrder', userv2.getPickupOrder);
router.post('/user/getShelvesOrder', userv2.getShelvesOrder);
router.post('/user/updateBucket', userv2.updateBucket);

// 上帝之手
let user_god = require('./user_god')
router.post('/user_god/getGodState', user_god.getGodState)
router.post('/user_god/setGodState', user_god.setGodState)

// 上帝之手
let syncDB = require('./syncDB')
// router.post('/sync/syncRush', syncDB.syncRush)
router.post('/sync/syncShelves', syncDB.syncShelves)
router.post('/sync/syncCommon', syncDB.syncCommon)
router.post('/sync/celarUserGod', syncDB.celarUserGod)
router.post('/sync/clearAllUserPrivilege', syncDB.clearAllUserPrivilege)
router.post('/sync/celarAllUserBlackList', syncDB.celarAllUserBlackList)
let syncDBv2 = require('./v2/syncDB')
router.post('/sync/syncRush', syncDBv2.syncRush)

// 分仓功能
let user_bucket = require('./user_bucket')
// router.post('/user_bucket/createBucket', user_bucket.createBucket)
// router.post('/user_bucket/deleteBucket', user_bucket.deleteBucket)
// router.post('/user_bucket/getBucketMembers', user_bucket.getBucketMembers)
// router.post('/user_bucket/getBucketList', user_bucket.getBucketList)
// router.post('/user_bucket/getAdminUserList', user_bucket.getAdminUserList)
// router.post('/user_bucket/setAdmin', user_bucket.setAdmin)
// router.post('/user_bucket/setBucketAdmin', user_bucket.setBucketAdmin)

let user_bucketv2 = require('./v2/user_bucket')
router.post('/user_bucket/createBucket', user_bucketv2.createBucket)
router.post('/user_bucket/deleteBucket', user_bucketv2.deleteBucket)
router.post('/user_bucket/getBucketMembers', user_bucketv2.getBucketMembers)
router.post('/user_bucket/getBucketList', user_bucketv2.getBucketList)
router.post('/user_bucket/getAdminUserList', user_bucketv2.getAdminUserList)
router.post('/user_bucket/setAdmin', user_bucketv2.setAdmin)
router.post('/user_bucket/setBucketAdmin', user_bucketv2.setBucketAdmin)
// router.post('/user_bucket/getBucketConfig', user_bucketv2.getBucketConfig)
// router.post('/user_bucket/setBucketConfig', user_bucketv2.setBucketConfig)

// 订单功能

let user_order = require('./user_order')
router.post('/user_order/getList', user_order.getList)
router.post('/user_order/cancelOrder', user_order.cancelOrder)//新增管理端取消订单
router.post('/user_order/exportList', user_order.exportList)

module.exports = router;