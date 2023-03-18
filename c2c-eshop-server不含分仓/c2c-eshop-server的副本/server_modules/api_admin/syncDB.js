/**
 * 上帝模式
 */
let syncDM = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let redis = require('../redis');
let moment = require('moment');
let KEYS = require('../redis_key');

/**
 * 同步抢购商品数据【2】
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
syncDM.syncRush = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT b.*,a.sid,c.nickname belong_nickname,c.avatar belong_avatar 
    FROM goods_rush_schedule_map a 
    INNER JOIN goods_rush b ON a.gid=b.gid 
    LEFT JOIN user c ON c.uid=b.belong 
    WHERE b.state IN (0,1,2,3,4,5) 
    ORDER BY a.sid ASC,b.gid ASC`;
    let data = await mysql.query(sql, []);

    // 清除抢购列表键
    let delKeys = await redis.Client0.keys(`${KEYS.RUSH_GOODS}*`);
    if (delKeys.length > 0) {
        await redis.Client0.del(delKeys);
    }
    // 添加商品至抢购列表
    for (let i = 0; i < data.length; i++) {
        await redis.Client0.hSet(`${KEYS.RUSH_GOODS}${data[i].sid}`, data[i].gid.toString(), JSON.stringify(data[i]));
    }

    // 清除计数器
    delKeys = await redis.Client0.keys(`${KEYS.RUSH_GOODS_COUNTER}*`);
    if (delKeys.length > 0) {
        await redis.Client0.del(delKeys);
    }
    // 添加计数器
    for (let i = 0; i < data.length; i++) {
        let map = new Map();
        let count = 0;
        if (data[i].state == 1) {
            count = 1;
        }
        map.set(`${data[i].gid}`, parseInt(count));
        await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}${data[i].sid}`, map);
    }

    res.send(base.result_ok('ok'));
};

/**
 * 同步货架商品数据【2】
 * @param {*} req 
 * @param {*} res 
 */
syncDM.syncShelves = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;
    let data = await mysql.query("SELECT * FROM goods_shelves WHERE state=1 ORDER BY gid DESC", []);
    let cList = await mysql.query("SELECT * FROM goods_category WHERE state=1 AND cid>0 ORDER BY cid DESC", []);
    cList = cList.map(item => {
        return item.cid;
    });

    // 删除原先的键
    let delKeys = await redis.Client3.keys(`${KEYS.SHELVES_GOODS}*`);
    if (delKeys.length > 0) {
        await redis.Client3.del(delKeys);
    }

    // 全部分类列表中添加
    for (let i = 0; i < data.length; i++) {
        let map = new Map();
        map.set(`${data[i].gid}`, JSON.stringify(data[i]));
        await redis.Client3.hSet(`${KEYS.SHELVES_GOODS}0`, map);
    }

    // 各个分类中添加
    if (cList) {
        for (let i = 0; i < cList.length; i++) {
            let fdata = data.filter(d => {
                return d.cid == cList[i];
            });
            for (let inneri = 0; inneri < fdata.length; inneri++) {
                let map = new Map();
                map.set(`${fdata[inneri].gid}`, JSON.stringify(fdata[inneri]));
                await redis.Client3.hSet(`${KEYS.SHELVES_GOODS}${cList[i]}`, map);
            }
        }
    }

    // 清除计数器
    await redis.Client3.del(`${KEYS.SHELVES_GOODS_COUNTER}`);
    // 更新计数器
    for (let i = 0; i < data.length; i++) {
        let map = new Map();
        map.set(`${data[i].gid}`, parseInt(data[i].count));
        await redis.Client3.HSET(`${KEYS.SHELVES_GOODS_COUNTER}`, map);
    }

    // 清除Banner
    await redis.delData(`${KEYS.BANNER_LIST}`, 3)

    res.send(base.result_ok('ok'));
};

/**
 * 通用同步方法
 * @param {*} req 
 * @param {*} res 
 */
syncDM.syncCommon = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;
    let key = req.body.key;

    if (key == 'banner') {
        await redis.delData(KEYS.BANNER_LIST, 3);
    } else if (key == 'protocol') {
        for (let i = 1; i < 15; i++) {
            await redis.delData(`${KEYS.PROTOCOL_LIST}${i}`, 3);
        }
    } else if (key == 'notice') {
        await redis.delData(KEYS.NOTICE_LIST, 3);
    } else if (key == 'category') {
        await redis.delData(KEYS.CATEGORY_LIST, 3);
    } else if (key == 'schedule') {
        await redis.delData(KEYS.RUSH_SCHEDULE, 0);
    } else {
        res.send(base.result_error('参数不合法'));
        return;
    }

    res.send(base.result_ok('ok'));
};

/**
 * 移除上帝之爱
 * @param {*} req 
 * @param {*} res 
 */
syncDM.celarUserGod = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;
    //await redis.clearAllUserGod();
    res.send(base.result_error('此操作已经作废不用了'));
};

/**
 * 移除所有用户特权（提前抢购时间和提前抢购数量限制）
 * @param {*} req 
 * @param {*} res 
 */
syncDM.clearAllUserPrivilege = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;
  
    let allKeys = await redis.Client2.keys(`${KEYS.USER_LIMIT}*`);
    if (allKeys && allKeys.length > 0) {
        for (let i = 0; i < allKeys.length; i++) {
            await redis.Client2.del(allKeys[i]);
            base.logAdmin(user_info.uid, '清空特权用户user_limit', `key:${allKeys[i]}`);
        }
    }

    allKeys = await redis.Client2.keys(`${KEYS.USER_GODTIME}*`);
    if (allKeys && allKeys.length > 0) {
        for (let i = 0; i < allKeys.length; i++) {
            await redis.Client2.del(allKeys[i]);
            base.logAdmin(user_info.uid, '清空特权用户user_godtime', `key:${allKeys[i]}`);
        }
    }

    allKeys = await redis.Client2.keys(`user_god_ttl_*`);
    if (allKeys && allKeys.length > 0) {
        for (let i = 0; i < allKeys.length; i++) {
            await redis.Client2.del(allKeys[i]);
            base.logAdmin(user_info.uid, '清空特权用户god_ttl', `key:${allKeys[i]}`);
        }
    }
    base.logAdmin(user_info.uid, '清空用户特权完成');
    res.send(base.result_ok('ok'));
};

/**
 * 移除所有用户黑名单
 * @param {*} req 
 * @param {*} res 
 */
syncDM.celarAllUserBlackList = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;
    let allKeys = await redis.Client2.keys(`${KEYS.USER_BLACKLIST}*`);
    if (allKeys && allKeys.length > 0) {
        for (let i = 0; i < allKeys.length; i++) {
            await redis.Client2.del(allKeys[i]);
        }
    }

    res.send(base.result_ok('ok'));
};




// ---- private ----

module.exports = syncDM;