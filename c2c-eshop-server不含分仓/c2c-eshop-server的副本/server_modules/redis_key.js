/**
 * Redis 中使用的Key
 */
let KEYS = {
    RUSH_SCHEDULE: `rush_schedule`,
    RUSH_GOODS: `rush_goods_`,
    RUSH_GOODS_COUNTER: `counter_rush_goods_`,
    USER_SMS: `user_sms`,
    USER_GODTIME: `user_godtime_`,
    USER_BLACKLIST: `user_blacklist_`,
    USER_BLACKROOM: `user_blackroom_`,
    USER_LIMIT: `user_limit_`,
    USER_BELONG: `user_blong`,
    USER_COMMON_LIMIT: `user_common_limit`,
    USER_BADLIST: `user_bad_`,
    SHELVES_GOODS: `shelves_goods_`,
    SHELVES_GOODS_COUNTER: `counter_shelves_goods`,
    BANNER_LIST: `banner_list`,
    NOTICE_LIST: `notice_list`,
    CATEGORY_LIST: `category_list`,
    PROTOCOL_LIST: `protocol_no_`,
    RATE_HANHDING: `rate_handling_fee`,
    BUCKET_GOODS_LIST: `bucket_goods_list_`,
    TOKEN: `token_`,
    ADMIN_TOKEN: `admin_token_`,
    GOODS_LAUNCH_TIME: `goods_launch_time`,
    ALL_GOODS_LAUNCH_STATE: 'all_goods_luanch_state',
    GOODS_LAUNCH_GAIN: `goods_luanch_gain`,
    LOG_SCHEDULE:`LOG_S_`,
    LOG_SCHEDULE_RUSH_OK:`LOG_S_OK_`
};

/**
 * Redis数据库编号说明
 * db0 ： 抢购商品列表、商品计数器、场次列表
 * db1 :  验证码、用户token、管理员token
 * db2 :  用户特殊权限控制、用户分仓发布的产品id列表、用户发布产品列表、上帝模式、通用抢购数量限制
 * db3 :  分类列表、首页商品列表、商品计数器、协议列表、Banner列表、提现手续费、上架手续费
 * db4 :  
 * db5 :  
 * db6 :  
 * db7 : 
 */

module.exports = KEYS;