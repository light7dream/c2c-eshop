let admin = {};

let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let redis = require('../redis');
let KEYS = require('../redis_key');
const { getRecursionUids, getRecommendLinks, getAllUsers } = require('./utils')

/**
 * 用户登录
 * @param {*} req 
 * @param {*} res 
 */
admin.login = async (req, res) => {
    let phone = req.body.phone;
    if (!phone) {
        res.send(base.result_error("手机号不能为空"));
        return;
    }
    let pwd = req.body.pwd;
    if (!pwd) {
        res.send(base.result_error("密码不能为空"));
        return;
    }

    let sql = `SELECT * FROM user WHERE phone=?`;
    let sql_result = await mysql.query(sql, [phone]);
    if (sql_result.length == 0) {
        res.send(base.result_error("用户不存在"));
        return;
    }

    let user_info = sql_result[0];
    if (user_info.pwd_md5 === base.md5Pwd(pwd)) {
        if (JSON.parse(user_info.roles).indexOf(1) == -1) {
            res.send(base.result_error("登录失败"));
            return;
        }
        if (!(user_info.state > 0)) {
            res.send(base.result_error("登录失败"));
            return;
        }
        let token = base.createToken(user_info.uid);
        sql = "UPDATE user SET admin_token=?,last_login_time=? WHERE uid=?";
        sql_result = await mysql.query(sql, [token, moment().format("YYYY-MM-DD HH:mm:ss"), user_info.uid]);

        let data = {
            token: token,
            nickname: user_info.nickname,
            phone: user_info.phone,
            avatar: user_info.avatar
        }

        // 缓存到Redis
        base.updateUserInfo(user_info.uid, true);
        base.logAdmin(user_info.uid, '登录', '');
        res.send(base.result_ok("登录成功", data));
        return;
    }

    res.send(base.result_error("密码错误"));
    return;
};

/**
 * 获取用户信息
 * @param {*} req 
 * @param {*} res 
 */
admin.getInfo = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let data = {
        token: user_info.token,
        nickname: user_info.nickname,
        phone: user_info.phone,
        avatar: user_info.avatar,
        bucket_id: user_info.bucket_id,
    }

    res.send(base.result_ok("ok", data));
    return;
};
/**
 * 退出登录
 * @param {*} req 
 * @param {*} res 
 */
admin.logout = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = "UPDATE user SET token=? WHERE uid=?";
    let sql_result = await mysql.query(sql, ['logout', user_info.uid]);

    res.send(base.result_ok("ok"));
    return;
};

// 随机添加用户
admin.randomAddUser = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let count = parseInt(req.body.count);
    if (count > 1) {
        let pwdMd5 = base.md5Pwd('123456');
        let sql = "INSERT INTO user (phone,nickname,pwd_md5) VALUES ";
        let sql_param = [];
        for (let i = 0; i < count; i++) {
            let phone = `1310000${base.pad(i, 4)}`;
            sql += " (?,?,?),";
            sql_param.push(phone);
            sql_param.push(phone);
            sql_param.push(pwdMd5);
        }
        sql = sql.substring(0, sql.length - 1);
        let sql_result = await mysql.query(sql, sql_param);
        res.send(base.result_ok("添加成功"));
    } else {
        res.send(base.result_error("数量不合法"));
    }

}


let config = require('../../package.json').config;
const { v4: uuidv4 } = require('uuid');
let AliOss = require('./lib/AliOss');
const OSS = require('ali-oss');
const coupon = require('../api_web/coupon');
const client = new OSS({
    region: config.OssRegion,
    accessKeyId: config.OssAccessKeyId,
    accessKeySecret: config.OssAccessKeySecret,
    bucket: config.OssBucket
});

/**
 * 获取上传文件地址
 * @param {*} req 
 * @param {*} res 
 */
admin.getAuth = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let authType = req.body.authType;

    let dirName = '';
    let fileName = '';
    switch (authType) {
        case 'goods-shelves':
            dirName = 'goods-shelves';
            fileName = `${uuidv4()}.png`
            break;
        case 'goods-rush':
            dirName = 'goods-rush';
            fileName = `${uuidv4()}.png`
            break;
        case 'goods-category':
            dirName = 'goods-category';
            let cid = parseInt(req.body.cid);
            if (cid >= 0) {
                fileName = `${cid}.png`;
            } else {
                fileName = `${uuidv4()}.png`;
            }
            break;
        case 'user-avatar':
            dirName = 'avatar';
            fileName = `${user_info.uid}.png`
            break;
        case 'wxpay-receipt-code':
            dirName = 'wxpay-receipt-code';
            fileName = `wxpay-${user_info.uid}-${uuidv4()}.png`
            break;
        case 'alipay-receipt-code':
            dirName = 'alipay-receipt-code';
            fileName = `alipay-${user_info.uid}-${uuidv4()}.png`
            break;
        default: break;
    }

    let oss = new AliOss({
      accessKeyId: config.OssAccessKeyId,
      accessKeySecret: config.OssAccessKeySecret,
      region: config.OssRegion,
      bucket: config.OssBucket,
    //   rolearn: 'acs:ram::1482939127675027:role/ramosstest',
      rolearn: config.OssRoleArn || 'acs:ram::1482939127675027:role/ramosstest',
      endpoint: 'oss-cn-beijing.aliyuncs.com',
    })
    oss.GetWriteSTS(`${dirName}/${fileName}`, 15 * 60, uuidv4(), async function (data) {
        res.send({ success: true, data: data });
        return;
    });
};

/**
 * 获取协议列表
 * @param {*} req 
 * @param {*} res 
 */
admin.getProtocolList = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;


    let sql = "SELECT * FROM protocol ORDER BY pid ASC";
    let sql_result = await mysql.query(sql, [pid]);
    res.send(base.result_ok("ok", sql_result));
    return;
};

/**
 * 获取协议
 * @param {*} req 
 * @param {*} res 
 */
admin.getProtocol = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let pid = parseInt(req.body.pid);

    if (!(pid > 0)) {
        res.send(base.result_error("协议id错误"));
        return;
    }

    let sql = "SELECT * FROM protocol WHERE pid=?";
    let sql_result = await mysql.query(sql, [pid]);
    if (sql_result.length > 0) {
        res.send(base.result_ok("ok", sql_result[0]));
        return;
    }
    res.send(base.result_error("没有找到当前协议"));
    return;

};

/**
 * 更新协议
 * @param {*} req 
 * @param {*} res 
 */
admin.updateProtocol = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let content = req.body.content;
    let pid = parseInt(req.body.pid);

    let sql = "UPDATE protocol SET content=?,update_uid=? WHERE pid=?";
    let sql_result = await mysql.query(sql, [content, user_info.uid, pid]);

    // 更新至Redis
    let data = await mysql.query("SELECT * FROM protocol WHERE pid=?", [pid]);
    data = data.length > 0 ? data[0] : null;
    await redis.Client3.set(`${KEYS.PROTOCOL_LIST}${pid}`, JSON.stringify(data));

    base.logAdmin(user_info.uid, '更新协议', `pid:${pid}`);
    res.send(base.result_ok("更新成功"));
    return;
};

/**
 * 获取上架手续费率
 * @param {*} req 
 * @param {*} res 
 */
admin.getHandlingFeeRate = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM other_config WHERE id=1";
    let sql_result = await mysql.query(sql, []);
    res.send(base.result_ok("ok", sql_result[0].value3));
    return;
};

/**
 * 设置手续费比例
 * @param {*} req 
 * @param {*} res 
 */
admin.setHandlingFeeRate = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let rate = Number(req.body.rate);
    if (!(rate > 0)) {
        res.send(base.result_error("费率值错误"));
        return;
    }

    let sql = `UPDATE other_config SET value3=? WHERE id=1`;
    let sql_result = await mysql.query(sql, [rate]);
    await redis.Client3.set(`${KEYS.RATE_HANHDING}`, rate.toString());
    base.logAdmin(user_info.uid, '设置上架比例', `rate:${rate}`);
    res.send(base.result_ok("设置成功",));
    return;
}

/**
 * 获取商品委托上架时间
 * @param {*} req 
 * @param {*} res 
 */
admin.getGoodsLaunchTime = async (req, res) => {
    try {
        let token_info = await base.checkAdminToken(req);
        if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
            res.send(base.result_error("登录失败"));
            return;
        }
        let user_info = token_info.data;

        let sql = "SELECT * FROM other_config WHERE id=6";
        let sql_result = await mysql.query(sql, []);
        res.send(base.result_ok("ok", Number(sql_result[0].value1)));
        return;
    } catch (e) {
        console.error('getGoodsLaunchTime', e)
        res.send(base.result_error("getGoodsLaunchTime接口运行错误"));
    }
};

/**
 * 设置商品委托上架时间
 * @param {*} req 
 * @param {*} res 
 */
admin.setGoodsLaunchTime = async (req, res) => {
    try {
        let token_info = await base.checkAdminToken(req);
        if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
            res.send(base.result_error("登录失败"));
            return;
        }
        let user_info = token_info.data;

        let time = parseInt(req.body.time);
        if (!(time >= 0)) {
            res.send(base.result_error("时间值错误"));
            return;
        }

        let sql = `UPDATE other_config SET value1=? WHERE id=6`;
        let sql_result = await mysql.query(sql, [time]);
        await redis.Client3.set(`${KEYS.GOODS_LAUNCH_TIME}`, time.toString());
        base.logAdmin(user_info.uid, '设置委托上架时间', `time:${time}`);
        res.send(base.result_ok("设置成功",));
        return;
    } catch (e) {
        console.error('setGoodsLaunchTime', e)
        res.send(base.result_error("接口运行错误"));
    }
}

/**
 * 获取全平台商品上架功能状态
 * @param {*} req 
 * @param {*} res 
 */
admin.getAllGoodsLaunchStatus = async (req, res) => {
    try {
        let token_info = await base.checkAdminToken(req);
        if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
            res.send(base.result_error("登录失败"));
            return;
        }
        let user_info = token_info.data;

        let sql = "SELECT * FROM other_config WHERE id=7";
        let sql_result = await mysql.query(sql, []);
        res.send(base.result_ok("ok", sql_result[0].value1));
        return;
    } catch (e) {
        console.error('getALLGoodsLaunchStatus', e)
        res.send(base.result_error("接口运行错误"));
    }
};

/**
 * 设置全平台商品上架功能状态
 * @param {*} req 
 * @param {*} res 
 */
admin.setAllGoodsLaunchStatus = async (req, res) => {
    try {
        let token_info = await base.checkAdminToken(req);
        if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
            res.send(base.result_error("登录失败"));
            return;
        }
        let user_info = token_info.data;

        let state = parseInt(req.body.state);
        if (state < 0 || state > 1) {
            res.send(base.result_error("状态值错误"));
            return;
        }

        let sql = `UPDATE other_config SET value1=? WHERE id=7`;
        let sql_result = await mysql.query(sql, [state]);
        await redis.Client3.set(`${KEYS.ALL_GOODS_LAUNCH_STATE}`, state.toString());
        base.logAdmin(user_info.uid, '设置全平台商品上架功能状态', `state:${state}`);
        res.send(base.result_ok("设置成功",));
        return;
    } catch (e) {
        console.error('setAllGoodsLaunchStatus', e)
        res.send(base.result_error("接口运行错误"));
    }
}

/**
 * 获取商品上架涨幅
 * @param {*} req 
 * @param {*} res 
 */
admin.getGoodsLaunchGain = async (req, res) => {
    try {
        let token_info = await base.checkAdminToken(req);
        if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
            res.send(base.result_error("登录失败"));
            return;
        }
        let user_info = token_info.data;

        let sql = "SELECT * FROM other_config WHERE id=8";
        let sql_result = await mysql.query(sql, []);
        res.send(base.result_ok("ok", Number(sql_result[0].value2)));
        return;
    } catch (e) {
        console.error('getGoodsLaunchGain', e)
        res.send(base.result_error("接口运行错误"));
    }
};

/**
 * 设置商品上架涨幅
 * @param {*} req 
 * @param {*} res 
 */
admin.setGoodsLaunchGain = async (req, res) => {
    try {
        let token_info = await base.checkAdminToken(req);
        if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
            res.send(base.result_error("登录失败"));
            return;
        }
        let user_info = token_info.data;
        let rate = Number(req.body.rate);

        // let rate = parseInt(req.body.rate);
        if (!(rate > 0)) {
            res.send(base.result_error("涨幅错误"));
            return;
        }

        let sql = `UPDATE other_config SET value2=? WHERE id=8`;
        let sql_result = await mysql.query(sql, [rate]);
        await redis.Client3.set(`${KEYS.GOODS_LAUNCH_GAIN}`, rate.toString());
        base.logAdmin(user_info.uid, '设置商品上架涨幅', `rate:${rate}`);
        res.send(base.result_ok("设置成功",));
        return;
    } catch (e) {
        console.error('setGoodsLaunchGain', e)
        res.send(base.result_error("接口运行错误"));
    }
}

/**
 * 获取推荐人收益比例
 * @param {*} req 
 * @param {*} res 
 */
admin.getIncomeRate = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM other_config WHERE id=2 OR id=3 ORDER BY id ASC";
    let sql_result = await mysql.query(sql, []);
    let data = [
        { level: 1, name: sql_result[0].name, value: sql_result[0].value3 },
        { level: 2, name: sql_result[1].name, value: sql_result[1].value3 },
    ]
    res.send(base.result_ok("ok", data));
    return;
};

/**
 * 设置推荐人收益比例
 * @param {*} req 
 * @param {*} res 
 */
admin.setIncomeRate = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let data = req.body.data;
    if (!Array.isArray(data) || data.length == 0) {
        res.send(base.result_error("参数错误"));
        return;
    }

    for (let i = 0; i < data.length; i++) {
        if (data[i].level == 1) {
            await mysql.query("UPDATE other_config SET value3=? WHERE id=?", [data[i].value, 2]);
        } else if (data[i].level == 2) {
            await mysql.query("UPDATE other_config SET value3=? WHERE id=?", [data[i].value, 3]);
        }
    }

    base.logAdmin(user_info.uid, '设置商品上架涨幅', JSON.stringify(data));
    res.send(base.result_ok("设置成功",));
    return;
}


/**
 * 获取新用户特权
 * @param {*} req 
 * @param {*} res 
 */
admin.getNewUserPrivilege = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM other_config WHERE id=4";
    let sql_result = await mysql.query(sql, []);
    res.send(base.result_ok("ok", {
        count: sql_result[0].value1,
        time: parseInt(sql_result[0].value3),
        limit_day: parseInt(sql_result[0].value2)
    }));
    return;
};

/**
 * 设置新用户特权
 * @param {*} req 
 * @param {*} res 
 */
admin.setNewUserPrivilege = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let count = parseInt(req.body.count);
    if (!(count >= 0)) {
        res.send(base.result_error("数量错误"));
        return;
    }
    let time = parseInt(req.body.time);
    if (!(time >= 0)) {
        res.send(base.result_error("时间错误"));
        return;
    }
    let limit_day = parseInt(req.body.limit_day);

    if (!(limit_day > 0)) {
        res.send(base.result_error("天数限制错误"));
        return;
    }


    await mysql.query("UPDATE other_config SET value1=?,value2=?,value3=? WHERE id=4", [count, limit_day, time]);

    base.logAdmin(user_info.uid, '设置新用户特权', JSON.stringify({ count, limit_day, time }));
    res.send(base.result_ok("设置成功",));
    return;
}

/**
 * 获取通用用户抢购数量限制
 * @param {*} req 
 * @param {*} res 
 */
admin.getCommonUserLimit = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = "SELECT * FROM other_config WHERE id=5";
    let sql_result = await mysql.query(sql, []);
    res.send(base.result_ok("ok", {
        count: sql_result[0].value1
    }));
    return;
};

/**
 * 设置通用用户抢购数量限制
 * @param {*} req 
 * @param {*} res 
 */
admin.setCommonUserLimit = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let count = parseInt(req.body.count);
    if (!(count >= 0)) {
        res.send(base.result_error("数量错误"));
        return;
    }

    await mysql.query("UPDATE other_config SET value1=? WHERE id=5", [count]);
    await redis.Client2.set(`${KEYS.USER_COMMON_LIMIT}`, count.toString());

    base.logAdmin(user_info.uid, '设置通用用户抢购数量限制', `count:${count}`);
    res.send(base.result_ok("设置成功",));
    return;
}

/**
 * 获取订单统计
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
admin.getOrderStatistics = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let data = {
        total_count: 0,
        total_money: 0,
        today_count: 0,
        today_money: 0,
        user_count: 0,
        first_count: 0,
        today_new_user: 0,
        today_user: 0,
        del_user: 0,
        normal_user: 0,
        all_user: 0,
        other_user: 0
    }

    let sql = `SELECT COUNT(*) total_count,SUM(g_price) total_price FROM user_order WHERE pay_state>0`;
    let totalData = await mysql.query(sql, []);
    totalData = totalData[0];
    data.total_count = totalData.total_count;
    data.total_money = totalData.total_price;
    if (data.total_money == null) {
        data.total_money = 0;
    }

    sql = `SELECT COUNT(*) today_count,SUM(g_price) today_price FROM user_order WHERE pay_state>0 AND TO_DAYS(create_time) = TO_DAYS(NOW())`;
    let todayData = await mysql.query(sql, []);
    todayData = todayData[0];
    data.today_count = todayData.today_count;
    data.today_money = todayData.today_price;
    if (data.today_money == null) {
        data.today_money = 0;
    }

    sql = `SELECT COUNT(*) buy_count,uid,MIN(create_time) min_time,MAX(create_time) max_time FROM user_order WHERE pay_state>0 GROUP BY uid`;
    let userCountData = await mysql.query(sql, []);
    userCountData.forEach(item => {
        let sameDayMin = moment(item.min_time).isSame(moment(), 'date');
        let sameDayMax = moment(item.max_time).isSame(moment(), 'date');
        if (sameDayMax) {
            data.user_count++;
            if (sameDayMin) {
                data.first_count++;
            }
        }
    });

    sql = `SELECT
    count(if(state>0 AND TO_DAYS(create_time) = TO_DAYS(NOW()),1,null)) AS today_new_user_count,
    count(if(state>0 AND TO_DAYS(last_login_time) = TO_DAYS(NOW()),1,null)) AS today_user_count,
    count(if(state=-1,1,null)) AS del_user_count,
    count(if(state=1,1,null)) AS user_count,
    count(1) AS all_user_count
    FROM user;`;
    let userCount = await mysql.query(sql, []);
    data.today_new_user = userCount[0].today_new_user_count;
    data.today_user = userCount[0].today_user_count;
    data.del_user = userCount[0].del_user_count;
    data.normal_user = userCount[0].user_count;
    data.all_user = userCount[0].all_user_count;
    data.other_user = data.all_user - data.normal_user - data.del_user

    sql = `SELECT COUNT(*) today_count FROM user WHERE state>0 AND TO_DAYS(last_login_time) = TO_DAYS(NOW())`;
    let todayUser = await mysql.query(sql, []);
    data.today_user = todayUser[0].today_count;

    res.send(base.result_ok("ok", data))
    return;
};

/**
 * 获取某个用户的粉丝订单流水
 * @param {*} req
 * @param {string|Number} req.body.uid 要查询的用户uid
 * @param {*} res
 * @returns
 */
admin.getFansOrderStatisticsByUser = async (req, res) => {
    let token_info = await base.checkAdminToken(req)
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error('登录失败'))
        return
    }

    let uid = parseInt(req.body.uid)
    if (uid < 0) {
        res.send(base.result_error('请指定要查询的用户'))
        return
    }
    // 考虑性能，数据量不大了时取出全部用户，在内存中操作
    let sql = `SELECT uid, nickname, level1_recommender, level2_recommender, roles FROM user WHERE state > -1`
    let users = await mysql.query(sql, [])
    let uids = [uid]
    // 递归获取当前用户相关的所有粉丝和二级粉丝
    getRecursionUids(uids, users)
    sql = `SELECT a.*, b.code as '商品code', b.name as '商品name', c.nickname as '买方nickname', c.phone as '买方phone', c.avatar as '买方avatar', d.nickname as '卖方nickname', d.phone as '卖方phone', d.avatar as '卖方avatar' FROM user_order a 
    INNER JOIN goods_rush b ON a.gid=b.gid
    LEFT JOIN user c ON c.uid=a.uid 
    LEFT JOIN user d ON d.uid=a.saler_id
    WHERE a.uid IN (${uids.join(
        ','
    )}) AND a.pay_state > -1 AND a.state > -1 AND TO_DAYS(a.create_time) = TO_DAYS(NOW())`
    let results = await mysql.query(sql, [])
    let topUserStatics = {}
    results.forEach((result) => {
        let topUser
        if (result && result.uid) {
            const curUser = users.find((v) => v.uid === result.uid)
            const roles = (curUser&&curUser.roles && JSON.parse(curUser.roles)) || []
            // 只有非管理员有总销
            if (!roles.includes(1)) {
                // 先从统计数据中取值
                topUser = topUserStatics[result.uid]
                if (!topUser) {
                    const curLinks = [result.uid]
                    getRecommendLinks(curLinks, users)
                    const curTopUser =
                        users.find((user) => user.uid === curLinks[curLinks.length - 1]) ||
                        {}
                    // 避免重复计算，将数据缓存至统计数据中
                    topUserStatics[result.uid] = curTopUser
                    topUser = curTopUser
                }
            }
        }
        result.总销 = topUser || {}
    })
    let today_total = 0;
    results.forEach(item => {
        today_total += item.g_price;
    });
    let result_data = {
        list: results,
        today_total: today_total
    }
    res.send(base.result_ok('ok', result_data))
    return
}

/**
 * 获取当日抢购访问统计信息
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
admin.getTodayRushAccess = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let data = [];

    let allSchedules = await mysql.query("SELECT * FROM rush_schedule ORDER BY starttime ASC", []);
    if (allSchedules.length > 0) {
        for (let sindex = 0; sindex < allSchedules.length; sindex++) {
            let count = await redis.Client3.hLen(`${KEYS.LOG_SCHEDULE}${allSchedules[sindex].id}`);
            let success_count = await redis.Client3.hLen(`${KEYS.LOG_SCHEDULE_RUSH_OK}${allSchedules[sindex].id}`);
            data.push({
                sid: allSchedules[sindex].id,
                starttime: allSchedules[sindex].starttime,
                endtime: allSchedules[sindex].endtime,
                name: allSchedules[sindex].name,
                count: count,
                success_count: success_count
            })
        }
    }

    res.send(base.result_ok("ok", data))
    return;
};

/**
 * 获取进场数据
 * @param {*} req 
 * @param {*} res 
 */
 admin.getAccessData = async (req, res) => {
    let s = req.body.s;
    let data = [];

    let alldata = await redis.Client3.hKeys(`${KEYS.LOG_SCHEDULE}${s}`);

    if (alldata.length > 0) {

        let last = alldata.map(i => {
            return parseInt(i);
        })
        let r = await mysql.query("SELECT uid,nickname,phone FROM user WHERE uid IN (?)", [last]);
        data = r;
    }

    res.send(data);
};

/**
 * 获取粉丝进场数据和抢购成功数据
 * @param {*} req
 * @param {*} res
 */
 admin.getFansAccessData = async (req, res) => {
    let s = req.body.s
    let uid = req.body.uid
    if(!uid || !s){
      res.send(base.result_error('参数错误'))
      return
    }
    let uids = [uid]
    const allUsers = await getAllUsers()
    await getRecursionUids(uids, allUsers)
    
    let inList = []
    let okList = []
    let alldata = await redis.Client3.hKeys(`${KEYS.LOG_SCHEDULE}${s}`);
    let allOkdata = await redis.Client3.hKeys(`${KEYS.LOG_SCHEDULE_RUSH_OK}${s}`);
    if (alldata.length > 0) {
        alldata.forEach(i => {
            const id = parseInt(i)
            if(uids.includes(id)){
                const user = allUsers.find(v => v.uid === id)
                if(user){
                    inList.push({ uid:user.uid, nickname:user.nickname, phone:user.phone })
                }
            }
        })
    }
    if (allOkdata.length > 0) {
        allOkdata.forEach(i => {
            const id = parseInt(i)
            if(uids.includes(id)){
                const user = allUsers.find(v => v.uid === id)
                if(user){
                    okList.push({ uid:user.uid, nickname:user.nickname, phone:user.phone })
                }
            }
        })
    }
  
    res.send(base.result_ok("ok", { inList, okList, uids }))
 }

module.exports = admin;