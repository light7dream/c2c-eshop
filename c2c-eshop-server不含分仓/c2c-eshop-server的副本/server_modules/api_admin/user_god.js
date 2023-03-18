/**
 * 上帝模式
 */
let user_god = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let redis = require('../redis');
let moment = require('moment');
let KEYS = require('../redis_key');

/**
 * 获取用户的上帝权限（单用户查看设置）
 * @param {*} req 
 * @param {*} res 
 */
user_god.getGodState = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let uid = parseInt(req.body.uid);

    if (!(uid > 0)) {
        res.send(base.result_error("用户id错误"));
        return;
    }

    // 获取用户其他信息
    let sql = "SELECT uid,phone,avatar,nickname,state,create_time,last_login_time FROM user WHERE uid=?";
    let data = await mysql.query(sql, [uid]);
    if (data.length == 0) {
        res.send(base.result_error(`没有找到用户${uid}`));
        return;
    }
    let god = await redis.getUserGodState(uid);
    let godttl = await redis.Client2.get(`user_god_ttl_${uid}`);
    if (godttl) {
        try {
            godttl = JSON.parse(godttl);
            god.ttl = godttl;
        } catch {
            god.ttl = {
                ttl: 7,
                time: moment().format('YYYY-MM-DD HH:mm:ss')
            };
        }
    } else {
        god.ttl = {
            ttl: 7,
            time: moment().format('YYYY-MM-DD HH:mm:ss')
        };
    }
    data = data[0];
    data.god = god;
    res.send(base.result_ok('ok', data));
};

/**
 * 上帝的抚爱
 * @param {*} req 
 * @param {*} res 
 */
user_god.setGodState = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let uid = parseInt(req.body.uid);
    if (!(uid > 0)) {
        res.send(base.result_error("用户id错误"));
        return;
    }

    let ttl = req.body.ttl;
    if (!ttl) {
        res.send(base.result_error("有效期错误"));
        return;
    }

    let godtime = req.body.godtime;
    let blacklist = req.body.blacklist;
    let blackroom = req.body.blackroom;
    let limit = req.body.limit;

    // 计算Timeout: 当前晚上12点过期
    let curTime = new Date();
    let y = curTime.getFullYear();
    let M = curTime.getMonth();
    let d = curTime.getDate();
    let expiresTime = new Date(y, M, d + parseInt(ttl.ttl), 0, 0, 0);
    let timeout = Math.floor((expiresTime.getTime() - curTime.getTime()) / 1000);

    if (godtime) {
        await redis.setUserGodTime(uid, godtime.use, godtime.data, timeout);
    }
    if (blacklist) {
        await redis.setUserBlackList(uid, blacklist.use, blacklist.data, timeout);
    }
    if (blackroom) {
        await redis.setUserBlackRoom(uid, blackroom.use, timeout);
    }
    if (limit) {
        await redis.setUserLimit(uid, limit.use, limit.data, timeout);
    }

    await redis.Client2.setEx(`user_god_ttl_${uid}`, timeout, JSON.stringify({
        ttl: parseInt(ttl.ttl),
        time: moment().format('YYYY-MM-DD HH:mm:ss')
    }));

    base.logAdmin(user_info.uid, '设置特权用户抢购数量限制', `uid:${uid},limit:${limit.data},godtime:${godtime.data}`);
    res.send(base.result_ok('设置成功'));
};



// ---- private ----

module.exports = user_god;