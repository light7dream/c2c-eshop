let user_goods = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let redis = require('../redis');
let KEYS = require('../redis_key');

/**
 * 货架商品详情【2】
 * @param {*} req 
 * @param {*} res 
 */
user_goods.getGoodsDetail = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("商品id错误"));
        return;
    }
    let goodsInfo = await redis.Client3.hGet(`${KEYS.SHELVES_GOODS}0`, gid.toString());
    if (goodsInfo == null) {
        res.send(base.result_error("该商品未上架"));
        return;
    } else {
        res.send(base.result_ok("ok", JSON.parse(goodsInfo)));
        return;
    }
};

/**
 * 我的商品
 * @param {*} req 
 * @param {*} res 
 */
user_goods.myGoods = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let sql = `SELECT a.gid,a.name,a.rusher_id,b.phone buyer_name,a.price,a.img,a.state,a.update_time 
    FROM goods_rush a 
    LEFT JOIN user b ON a.rusher_id=b.uid 
    WHERE a.belong=? AND a.state>=0 
    ORDER BY a.gid DESC`;
    let sql_result = await mysql.query(sql, [user_info.uid]);
    res.send(base.result_ok("ok", sql_result));
    return;
};

/**
 * 我的已支付待确认的商品
 * @param {*} req 
 * @param {*} res 
 */
user_goods.myPayedGoods = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let sql = `SELECT a.gid,a.name,a.rusher_id,b.phone saler_name,a.price,a.img,a.state,a.update_time 
    FROM goods_rush a 
    LEFT JOIN user b ON a.belong=b.uid 
    WHERE a.rusher_id=? AND a.state=3 
    ORDER BY a.update_time DESC`;
    let sql_result = await mysql.query(sql, [user_info.uid]);
    res.send(base.result_ok("ok", sql_result));
    return;
};

// ---- 货架商品逻辑 ----
/**
 * 货架商品添加到购物车【2】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user_goods.addCart = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("商品id错误"));
        return;
    }
    let sql_result = await mysql.query("SELECT * FROM user_cart WHERE uid=? AND gid=?", [user_info.uid, gid]);
    if (sql_result.length > 0) {
        await mysql.query("UPDATE user_cart SET count=count+1 WHERE uid=? AND gid=?", [user_info.uid, gid]);
    } else {
        await mysql.query(`INSERT INTO user_cart(uid,gid,count,selected) VALUE(?,?,1,1)`, [user_info.uid, gid]);
    }
    res.send(base.result_ok("添加成功"));
    return;
};

/**
 * 我的购物车列表【2】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user_goods.myCartList = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT * FROM user_cart WHERE uid=? ORDER BY create_time DESC`;
    let sql_result = await mysql.query(sql, [user_info.uid]);
    if (sql_result.length == 0) {
        res.send(base.result_ok("ok", []));
        return;
    }

    let gidkeys = sql_result.map(item => {
        return item.gid.toString();
    });

    let alldata = await redis.Client3.hmGet(`${KEYS.SHELVES_GOODS}0`, gidkeys);
    alldata = alldata.filter(item => {
        return item != null;
    });

    if (alldata == null || alldata.length == 0) {
        res.send(base.result_ok("ok", []));
        return;
    }

    alldata = alldata.map(i => {
        return JSON.parse(i);
    });
    let remain = await redis.Client3.hGetAll(`${KEYS.SHELVES_GOODS_COUNTER}`);
    let data = sql_result.map(item => {
        let fd = alldata.find(d => {
            return d.gid == item.gid;
        });

        let obj = {
            ...fd,
            ...item,
            goods_count: parseInt(remain[item.gid])
        }
        return obj;
    });
    res.send(base.result_ok("ok", data));
    return;
};

/**
 * 将商品移除购物车【2】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user_goods.removeCart = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("商品id错误"));
        return;
    }

    let sql_result = await mysql.query("DELETE FROM user_cart WHERE uid=? AND gid=?", [user_info.uid, gid]);
    res.send(base.result_ok("移除成功"));
    return;
};

/**
 * 批量将商品移除购物车【2】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user_goods.removeCartBatch = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length == 0) {
        res.send(base.result_error("参数错误"));
        return;
    }

    let sql_result = await mysql.query("DELETE FROM user_cart WHERE uid=? AND gid IN (?)", [user_info.uid, ids]);
    res.send(base.result_ok("移除成功"));
    return;
};

/**
 * 更新购物车数量【2】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user_goods.updateCart = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("商品id错误"));
        return;
    }

    let count = parseInt(req.body.count);
    if (!(count > 0)) {
        res.send(base.result_error("商品数量错误"));
        return;
    }

    let selected = parseInt(req.body.selected);
    if (selected != 0 && selected != 1) {
        res.send(base.result_error("商品选择状态错误"));
        return;
    }

    let sql_result = await mysql.query("UPDATE user_cart SET count=?,selected=? WHERE uid=? AND gid=?", [count, selected, user_info.uid, gid]);
    res.send(base.result_ok("ok"));
    return;
};

/**
 * 我是买方（商品列表）
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
user_goods.imBuyer = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT a.*,b.order_id,b.order_id,b.order_no,c.payee_name,c.payee_bankname,c.payee_bankno,c.avatar belong_avatar,c.nickname belong_nickname,c.wxpay_img,c.alipay_img,
    d.avatar rusher_avatar,d.nickname rusher_nickname,e.avatar last_belong_avatar,e.nickname last_belong_nickname 
    FROM goods_rush a 
    LEFT JOIN user_order b ON a.current_order_id=b.order_id 
    LEFT JOIN user c ON c.uid=a.belong  
    LEFT JOIN user d ON d.uid=a.rusher_id   
    LEFT JOIN user e ON e.uid=a.last_belong   
    WHERE (a.belong=? AND a.state IN (0,1,6)) OR (a.rusher_id=? AND a.state IN (2,3,5)) 
    ORDER BY b.create_time DESC`;

    let sql_result = await mysql.query(sql, [user_info.uid, user_info.uid]);

    let gids = sql_result.map(item => {
        return item.gid;
    });
    if (gids.length > 0) {
        let schedules = await mysql.query(`SELECT a.gid,b.name FROM goods_rush_schedule_map a INNER JOIN rush_schedule b ON a.sid=b.id WHERE a.gid IN (?)`, [gids]);
        let map = {};
        schedules.forEach(item => {
            map[item.gid] = item.name;
        });
        sql_result.forEach(item => {
            item.schedule_name = map[item.gid];
        });
    }

    res.send(base.result_ok("ok", sql_result));
};

/**
 * 我是卖方（商品列表）
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
user_goods.imSaler = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT a.*,b.order_id,b.order_no 
    FROM goods_rush a 
    LEFT JOIN user_order b ON a.current_order_id=b.order_id 
    WHERE (a.belong=? AND a.state IN (1,2,3,5,6))`;
    let sql_result = await mysql.query(sql, [user_info.uid]);

    let gids = sql_result.map(item => {
        return item.gid;
    });
    if (gids.length > 0) {
        let schedules = await mysql.query(`SELECT a.gid,b.name FROM goods_rush_schedule_map a INNER JOIN rush_schedule b ON a.sid=b.id WHERE a.gid IN (?)`, [gids]);
        let map = {};
        schedules.forEach(item => {
            map[item.gid] = item.name;
        });
        sql_result.forEach(item => {
            item.schedule_name = map[item.gid];
        });
    }

    res.send(base.result_ok("ok", sql_result));
};

/**
 * 查看支付截图
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user_goods.viewPayImg = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let uid = parseInt(req.body.uid);
    let order_id = parseInt(req.body.order_id);
    if (!(uid > 0)) {
        res.send(base.result_error("参数错误"));
        return;
    }
    if (!(order_id > 0)) {
        res.send(base.result_error("订单号错误"));
        return;
    }

    let sql = `SELECT a.* FROM user_order_payimg a WHERE a.uid=? AND a.order_id=? `;

    let sql_result = await mysql.query(sql, [uid, order_id]);
    res.send(base.result_ok("ok", sql_result));
};

/**
 * 提货
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user_goods.giveMe = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("参数错误"));
        return;
    }

    let sql = `UPDATE goods_rush SET state=6 WHERE belong=? AND state=0 AND gid=?`;

    let sql_result = await mysql.query(sql, [user_info.uid, gid]);
    if (sql_result.affectedRows == 1) {
        res.send(base.result_ok("提货成功"));
        return;
    }
    res.send(base.result_ok("提货失败"));
};


/**
 * 取消订单【2】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user_goods.cancelOrder = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("商品id错误"));
        return;
    }

    let order_id = parseInt(req.body.order_id);
    if (!(order_id > 0)) {
        res.send(base.result_error("订单id错误"));
        return;
    }

    let order_info = await mysql.query("SELECT * FROM user_order WHERE order_id=? AND uid=? ", [order_id, user_info.uid]);
    if (order_info.length == 0) {
        res.send(base.result_error("取消失败,没有找到订单"));
        return;
    }
    order_info = order_info[0];

    let sql = `UPDATE goods_rush SET state=1,rusher_id=0 WHERE rusher_id=? AND state=2 AND gid=? AND current_order_id=?`;

    let sql_result = await mysql.query(sql, [user_info.uid, gid, order_id]);
    if (sql_result.affectedRows == 1) {
        // 更新订单
        // 取消订单回去到抢购列表中
        let goodsinfo = await mysql.query(`SELECT a.*,b.nickname belong_nickname,b.avatar belong_avatar FROM goods_rush a LEFT JOIN user b ON b.uid=a.belong WHERE a.gid=?`, [gid]);
        await redis.Client0.hSet(`${KEYS.RUSH_GOODS}${order_info.schedule_id}`, gid.toString(), JSON.stringify(goodsinfo[0]));
        await mysql.query("UPDATE user_order SET state=-1 WHERE order_id=? AND uid=?", [order_id, user_info.uid]);
        await redis.Client0.hSet(`${KEYS.RUSH_GOODS_COUNTER}${order_info.schedule_id}`, gid.toString(), '1');
        res.send(base.result_ok("取消成功"));
        return;
    }
    res.send(base.result_error("取消失败"));
};

/**
 * 我的商品
 * @param {*} req 
 * @param {*} res 
 */
user_goods.myFavGoods = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let uid = user_info.uid;
    let arr1 = await user_goods.getMyShelvesGoods(uid);
    let arr2 = await user_goods.getMyRushGoods(uid);

    let arr = arr1.concat(arr2);
    arr.sort((a, b) => {
        return moment(b.create_time) - moment(a.create_time);
    });

    res.send(base.result_ok("ok", arr));
    return;
};


// ---- private ----
/**
 * 获取我货架上购买的商品
 * @param {*} uid 
 */
user_goods.getMyShelvesGoods = async (uid) => {
    let sql = `SELECT a.order_id,a.order_no,a.create_time,a.goods_info,a.price order_price,b.parcel 
    FROM user_order_shelves a 
    LEFT JOIN user_parcel b ON b.order_from=1 AND b.order_id=a.order_id
    WHERE a.uid=? AND a.state=1 AND a.pay_state=1`;

    let orderlist = await mysql.query(sql, [uid]);
    let goodslist = [];
    orderlist.forEach(order => {
        let list = JSON.parse(order.goods_info);
        let innerGoodsList = list.map(item => {
            return {
                gid: item.gid,
                img: item.img,
                name: item.name,
                code: item.code,
                price: item.price,
                count: item.count,
                origin: "商城",
                create_time: order.create_time,
                parcel: order.parcel,
                order_no: order.order_no,
                order_id: order.order_id,
            }
        });
        goodslist = goodslist.concat(innerGoodsList);
    });
    return goodslist;
};

/**
 * 获取我的抢购的提货商品
 * @param {*} uid 
 */
user_goods.getMyRushGoods = async (uid) => {
    let sql = `SELECT a.order_id,a.order_no,a.gid,a.g_count count,b.name,b.code,b.img,a.create_time,a.g_price price,'抢购' origin,c.parcel  
    FROM goods_rush b 
    LEFT JOIN user_order a ON b.current_order_id=a.order_id AND a.state=1 AND a.pay_state=1 
    LEFT JOIN user_parcel c ON c.order_from=2 AND c.order_id=a.order_id
    WHERE b.belong=? AND b.state=6`;

    let list = await mysql.query(sql, [uid]);
    return list;
};

module.exports = user_goods;