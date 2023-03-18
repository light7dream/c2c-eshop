/**
 * 上帝模式
 */
let syncDM = {};
let base = require('../../base');
let mysql = require('../../mysql');
let redis = require('../../redis');
let moment = require('moment');
let KEYS = require('../../redis_key');

/**
 * V2:同步抢购商品数据【2】
 * @param {*} req 
 * @param {*} res 
 */
syncDM.syncRush = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT a.*,c.nickname belong_nickname,c.avatar belong_avatar 
     FROM goods_rush a 
     LEFT JOIN user c ON c.uid=a.belong 
     WHERE a.state IN (0,1,2,3,4,5) 
     ORDER BY a.sid ASC,a.gid ASC`;
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


// ---- private ----

module.exports = syncDM;