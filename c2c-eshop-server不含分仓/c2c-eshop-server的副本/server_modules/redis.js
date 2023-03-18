const config = require('../package.json').config;
const redisClient = require('redis');
const KEYS = require('./redis_key');

/**
 * 创建redis连接
 */
function getInstance(db) {
    let client = redisClient.createClient({
        url: config.redis
    });
    client.on('connect', async function () {
        client.select(db);
        console.log(`redis${db} is connect.`);
    });
    client.on('error', async err => {
        console.log(`redis${db} is running error.`);
        console.log(err);
    });
    client.connect();
    return client;
}

let redis = {
    Client0: getInstance(0),
    Client1: getInstance(1),
    Client2: getInstance(2),
    Client3: getInstance(3)
};
let clients = [redis.Client0, redis.Client1, redis.Client2, redis.Client3]

/**
 * 更新获取
 * @param {*} key 
 * @param {*} callback 
 */
redis.updateGet = async (key, callback) => {
    let data = await redis.Client0.get(key);
    if (!data) {
        data = await callback();
        await redis.Client0.set(key, JSON.stringify(data));
    } else {
        data = JSON.parse(data);
    }
    return data;
};

/**
 * 根据数据库编号更新获取
 * @param {*} db_no 可选值0-3
 * @param {*} key 
 * @param {*} callback 
 */
redis.updateGetByDB = async (db_no, key, callback) => {
    let data = await clients[db_no].get(key);
    if (!data) {
        data = await callback();
        await clients[db_no].set(key, JSON.stringify(data));
    } else {
        data = JSON.parse(data);
    }
    return data;
};


/**
 * 设置验证码
 * @param {*} data 
 */
redis.setSMScode = async (phone, code, timeout) => {
    await redis.Client1.setEx(phone, timeout, code);
};


/**
 * 获取用户上帝模式的权限
 * @param {*} uid 
 */
redis.getUserGodState = async (uid) => {
    let limit = await redis.Client2.get(`${KEYS.USER_LIMIT}${uid}`);
    let limit_remain = await redis.Client2.ttl(`${KEYS.USER_LIMIT}${uid}`);
    let blacklist = await redis.Client2.get(`${KEYS.USER_BLACKLIST}${uid}`);
    let blacklist_remain = await redis.Client2.ttl(`${KEYS.USER_BLACKLIST}${uid}`);
    let blackroom = await redis.Client2.get(`${KEYS.USER_BLACKROOM}${uid}`);
    let blackroom_remain = await redis.Client2.ttl(`${KEYS.USER_BLACKROOM}${uid}`);
    let godtime = await redis.Client2.get(`${KEYS.USER_GODTIME}${uid}`);
    let godtime_remain = await redis.Client2.ttl(`${KEYS.USER_GODTIME}${uid}`);

    let datalimit = {
        use: limit !== null && limit > 0 ? true : false,
        data: limit > 0 ? limit : 0,
        timeout: limit_remain > 0 ? limit_remain : 0
    }
    let datablacklist = {
        use: blacklist ? true : false,
        data: blacklist ? JSON.parse(blacklist) : [],
        timeout: blacklist_remain > 0 ? blacklist_remain : 0
    }
    let datablackroom = {
        use: blackroom > 0 ? true : false,
        data: blackroom > 0 ? blackroom : 0,
        timeout: blackroom_remain > 0 ? blackroom_remain : 0
    }
    let datagodtime = {
        use: godtime > 0 ? true : false,
        data: godtime > 0 ? godtime : 0,
        timeout: godtime_remain > 0 ? godtime_remain : 0
    }

    let result = {
        limit: datalimit,
        blacklist: datablacklist,
        blackroom: datablackroom,
        godtime: datagodtime
    };

    return result;
};

/**
 * 清楚用户上帝数据
 */
redis.clearAllUserGod = async () => {
    redis.Client2.flushDb();
};

/**
 * 设置用户抢购数量限制
 * @param {*} uid 
 */
redis.setUserLimit = async (uid, use, limit, timeout) => {
    if (!use) {
        await redis.Client2.del(`${KEYS.USER_LIMIT}${uid}`);
    } else {
        await redis.Client2.setEx(`${KEYS.USER_LIMIT}${uid}`, timeout, limit.toString());
    }
};

/**
 * 设置用户抢购商品限制
 * @param {*} uid 
 */
redis.setUserBlackList = async (uid, use, blacklist, timeout) => {
    if (!use) {
        await redis.Client2.del(`${KEYS.USER_BLACKLIST}${uid}`);
    } else {
        await redis.Client2.setEx(`${KEYS.USER_BLACKLIST}${uid}`, timeout, JSON.stringify(blacklist));
    }
};

/**
 * 商品黑名单添加一条
 * @param {*} uid 
 */
redis.addGoodsToUserBlackList = async (uid, data, timeout) => {
    let blacklist = await redis.Client2.get(`${KEYS.USER_BLACKLIST}${uid}`);
    if (blacklist) {
        blacklist = JSON.parse(blacklist);
    } else {
        blacklist = [data];
    }
    await redis.Client2.setEx(`${KEYS.USER_BLACKLIST}${uid}`, timeout, JSON.stringify(blacklist));
};

/**
 * 设置用户关小黑屋
 * @param {*} uid 
 */
redis.setUserBlackRoom = async (uid, blackroom, timeout) => {
    if (!blackroom) {
        await redis.Client2.del(`${KEYS.USER_BLACKROOM}${uid}`);
    } else {
        await redis.Client2.setEx(`${KEYS.USER_BLACKROOM}${uid}`, timeout, '1');
    }
};

/**
 * 设置用户抢购提前时间
 * @param {*} uid 
 */
redis.setUserGodTime = async (uid, use, godtime, timeout) => {
    if (!use) {
        await redis.Client2.del(`${KEYS.USER_GODTIME}${uid}`);
    } else {
        await redis.Client2.setEx(`${KEYS.USER_GODTIME}${uid}`, timeout, godtime.toString());
    }
};

/**
 * 获取用户成功抢购的数量
 * @param {*} uid 
 */
redis.getUserRushSuccess = async (uid, sid) => {
  let count = await redis.Client2.get(`success_${uid}_${sid}_count`)
  return count
}

/**
 * 设置用户成功抢购的数量
 * @param {*} uid 
 */
redis.setUserRushSuccess = async (uid, sid, timeout, count = 1) => {
    if (await redis.Client2.exists(`success_${uid}_${sid}_count`)) {
        await redis.Client2.INCRBY(`success_${uid}_${sid}_count`, count);
    } else {
        await redis.Client2.setEx(`success_${uid}_${sid}_count`, timeout, count.toString());
    }
};

/**
 * 缓存中添加货架产品
 * 1. 管理员设置添加
 * @param {*} data 
 */
redis.addShelvesGoods = async (data) => {
    // 全部分类列表中添加
    await redis.Client3.hSet(`${KEYS.SHELVES_GOODS}0`, data.gid.toString(), JSON.stringify(data));

    // 所属分类中添加
    if (data.cid != 0) {
        await redis.Client3.hSet(`${KEYS.SHELVES_GOODS}${data.cid}`, data.gid.toString(), JSON.stringify(data));
    }

    // 更新计数器
    let map = new Map();
    map.set(`${data.gid}`, data.count);
    await redis.Client3.hSet(KEYS.SHELVES_GOODS_COUNTER, map);
};

/**
 * 缓存中移除抢购商品
 * 1. 管理员修改抢购商品（移除前同样需要做抢购逻辑验证）
 * 2. 用户购买商品
 * @param {*} data 
 */
redis.removeShelvesGoods = async (data) => {
    // 全部分类列表中移除
    await redis.Client3.hDel(`${KEYS.SHELVES_GOODS}0`, data.gid.toString());

    if (data.cid > 0) {
        await redis.Client3.hDel(`${KEYS.SHELVES_GOODS}${data.cid}`, data.gid.toString());
    }

    // 更新计数器
    await redis.Client3.hDel(KEYS.SHELVES_GOODS_COUNTER, `${data.gid}`);
};

// 检查是否有再用 删除键  
redis.delData = async (key, db_no = 0) => {
    if (clients[db_no]) {
        await clients[db_no].del(key);
    }
};

module.exports = redis;