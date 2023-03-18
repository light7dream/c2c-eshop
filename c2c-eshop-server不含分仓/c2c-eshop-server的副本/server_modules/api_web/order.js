
let order = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let redis = require('../redis');
let KEYS = require('../redis_key');
let wx_pay = require('../wx_pay');
let aliPay = require('../aliPay')

/**
 * 唤起支付
 * @param {*} req
 * @param {*} res
 * @returns
 */
// 货架商品  获取支付参数
order.purchasePrepare = async (req, res) => {
  let token_info = await base.checkToken(req)
  if (token_info.res_code < 0) {
    res.send(token_info)
    return
  }
  let user_info = token_info.data

  let order_id = parseInt(req.body.order_id)
  if (!(order_id > 0)) {
    res.send(base.result_error('订单id错误'))
    return
  }

  let order_no = req.body.order_no
  if (!order_no) {
    res.send(base.result_error('订单号错误'))
    return
  }

  let order_info = await mysql.query(
    'SELECT * FROM user_order_shelves WHERE order_id=? AND order_no=? AND state=1 AND pay_state=0',
    [order_id, order_no]
  )

  if (order_info.length == 0) {
    res.send(base.result_error('订单信息核对失败'))
    return
  }

  let address_info = req.body.address_info
  if (address_info) {
    address_info = JSON.stringify(address_info)
    await mysql.query(
      'UPDATE user_order_shelves SET address_info=? WHERE order_id=?',
      [address_info, order_id]
    )
  }

  order_info = order_info[0]

  // 订单显示名称
  let gname = '商城商品'
  let allGoods = JSON.parse(order_info.goods_info)
  if (allGoods.length > 0) {
    gname = allGoods
      .map((item) => {
        return item.name
      })
      .join(',')
    if (gname.length == 0) {
      gname = '商城商品'
    } else if (gname.length > 127) {
      gname = gname.substring(0, 120) + '...'
    }
  }

  let payprepare = await wx_pay.getPay(
    gname,
    order_info.order_no,
    order_info.real_price,
    user_info.open_id,
    order_info.uid,
    'home'
  )

  if (payprepare.status == 200) {
    res.send(base.result_ok('ok', payprepare))
    return
  } else {
    res.send(base.result_error('获取支付信息失败', payprepare))
    return
  }
}

/**
 * 唤起支付宝支付
 * @param {*} req
 * @param {*} res
 * @returns
 */
// 货架商品  获取支付参数
order.alipayPurchasePrepare = async (req, res) => {
  let token_info = await base.checkToken(req)
  if (token_info.res_code < 0) {
    res.send(token_info)
    return
  }
  let user_info = token_info.data

  let order_id = parseInt(req.body.order_id)
  if (!(order_id > 0)) {
    res.send(base.result_error('订单id错误'))
    return
  }

  let order_no = req.body.order_no
  if (!order_no) {
    res.send(base.result_error('订单号错误'))
    return
  }

  let order_info = await mysql.query(
    'SELECT * FROM user_order_shelves WHERE order_id=? AND order_no=? AND state=1 AND pay_state=0',
    [order_id, order_no]
  )

  if (order_info.length == 0) {
    res.send(base.result_error('订单信息核对失败'))
    return
  }

  let address_info = req.body.address_info
  if (address_info) {
    address_info = JSON.stringify(address_info)
    await mysql.query(
      'UPDATE user_order_shelves SET address_info=? WHERE order_id=?',
      [address_info, order_id]
    )
  }

  order_info = order_info[0]

  // 订单显示名称
  let gname = '商城商品'
  let allGoods = JSON.parse(order_info.goods_info)
  if (allGoods.length > 0) {
    gname = allGoods
      .map((item) => {
        return item.name
      })
      .join(',')
    if (gname.length == 0) {
      gname = '商城商品'
    } else if (gname.length > 127) {
      gname = gname.substring(0, 120) + '...'
    }
  }

  let payprepare = await aliPay.getPay(
    gname,
    order_info.order_no,
    order_info.real_price,
    user_info.open_id,
    order_info.uid,
    'home'
  )

  if (payprepare) {
    res.send(base.result_ok('ok', payprepare))
    return
  } else {
    res.send(base.result_error('获取支付信息失败', payprepare))
    return
  }
}


/**
 * 支付确认
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// TODO 微信支付可用后此方法删除不用，回调中处理这个逻辑
order.purchaseAck = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let order_id = parseInt(req.body.order_id);
    if (!(order_id > 0)) {
        res.send(base.result_error("订单id错误"));
        return;
    }

    let order_info = await mysql.query("SELECT * FROM user_order_shelves WHERE order_id=?", order_id);
    if (order_info.length == 0) {
        console.log(`没有查询到订单 ${order_no}`);
        return;
    }
    order_info = order_info[0];
    let list = JSON.parse(order_info.goods_info);

    for (let i = 0; i < list.length; i++) {
        await mysql.query("UPDATE goods_shelves SET count=count-? WHERE gid=?", [list[i].count, list[i].gid]);
    }

    await mysql.query("UPDATE user_order_shelves SET pay_state=1 WHERE order_id=? AND uid=?", [order_id, order_info.uid]);

    res.send(base.result_ok("购买成功!"));
    return;
};

/**
 * 上传支付截图
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
order.addPayImg = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let order_id = parseInt(req.body.order_id);
    if (!(order_id > 0)) {
        res.send(base.result_error("订单id错误"));
        return;
    }

    let imgurl = req.body.imgurl;
    if (!imgurl) {
        res.send(base.result_error("支付截图地址错误"));
        return;
    }

    let sql = `INSERT INTO user_order_payimg (uid,order_id,img) VALUES (?,?,?)`;

    let sql_result = await mysql.query(sql, [user_info.uid, order_id, imgurl]);
    res.send(base.result_error("上传成功!"));
    return;
};

/**
 * 购物车提交订单【2】
 */
order.submitOrder = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let total_price = parseInt(req.body.total_price);
    if (!(total_price > 0)) {
        res.send(base.result_error("订单信息错误"));
        return;
    }

    let list = req.body.list;
    if (!list || !Array.isArray(list)) {
        res.send(base.result_error("商品信息错误"));
        return;
    }

    let lockObj = {};
    let lockProps = [];
    let checkResult = true;
    for (let i = 0; i < list.length; i++) {
        let gid = list[i].gid;

        let ckCount = await redis.Client3.HINCRBY(`${KEYS.SHELVES_GOODS_COUNTER}`, gid.toString(), -list[i].count);
        lockObj[gid] = list[i].count;
        lockProps.push(gid);
        if (ckCount == null || ckCount < 0) {
            console.log(ckCount, gid);
            checkResult = false;
            break;
        }
    }
    if (!checkResult) {
        for (let i = 0; i < lockProps.length; i++) {
            await redis.Client3.HINCRBY(`${KEYS.SHELVES_GOODS_COUNTER}`, lockProps[i].toString(), lockObj[lockProps[i]]);
        }
        res.send(base.result_error("剩余商品数量不足"));
        return;
    }

    for (let i = 0; i < list.length; i++) {
        let goodsInfo = await redis.Client3.hGet(`${KEYS.SHELVES_GOODS}0`, list[i].gid.toString());
        goodsInfo = JSON.parse(goodsInfo);
        goodsInfo.count = list[i].goods_count - list[i].count;
        await redis.Client3.HSET(`${KEYS.SHELVES_GOODS}0`, list[i].gid.toString(), JSON.stringify(goodsInfo));
        if (goodsInfo.cid > 0) {
            await redis.Client3.HSET(`${KEYS.SHELVES_GOODS}${goodsInfo.cid}`, list[i].gid.toString(), JSON.stringify(goodsInfo));
        }
    }

    let order_id = await order.createShelvesOrder(user_info.uid, list, total_price);
    if (order_id > 0) {
        res.send(base.result_ok("创建订单成功!", order_id));
        return;
    }
    res.send(base.result_error("创建订单失败!"));
    return;
};

/**
 * 首页商品提交订单【2】
 */
order.submitShelvesOrder = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let total_price = parseInt(req.body.total_price);
    if (!(total_price > 0)) {
        res.send(base.result_error("订单价格错误"));
        return;
    }

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

    let address_info = req.body.address_info;
    if (!address_info) {
        res.send(base.result_error("地址信息错误"));
        return;
    }

    let ckCount = await redis.Client3.HINCRBY(`${KEYS.SHELVES_GOODS_COUNTER}`, gid.toString(), -count);
    if (ckCount == null) {
        res.send(base.result_error("订单确认失败"));
        return;
    }

    if (ckCount < 0) {
        res.send(base.result_error("剩余数量不足，请重新提交", {
            remain: count + ckCount
        }));
        await redis.Client3.HINCRBY(`${KEYS.SHELVES_GOODS_COUNTER}`, gid.toString(), count);
        return;
    }


    let goodsInfo = await redis.Client3.hGet(`${KEYS.SHELVES_GOODS}0`, gid.toString());
    if (goodsInfo == null) {
        res.send(base.result_error("订单确认失败"));
        await redis.Client3.HINCRBY(`${KEYS.SHELVES_GOODS_COUNTER}`, gid.toString(), count);
        return;
    } else {
        goodsInfo = JSON.parse(goodsInfo);
        if (total_price == goodsInfo.price * count) {
            goodsInfo.count -= count;
            await redis.Client3.HSET(`${KEYS.SHELVES_GOODS}0`, gid.toString(), JSON.stringify(goodsInfo));
            if (goodsInfo.cid > 0) {
                await redis.Client3.HSET(`${KEYS.SHELVES_GOODS}${goodsInfo.cid}`, gid.toString(), JSON.stringify(goodsInfo));
            }
        } else {
            res.send(base.result_error("订单确认失败,价格错误"));
            await redis.Client3.HINCRBY(`${KEYS.SHELVES_GOODS_COUNTER}`, gid.toString(), count);
            return;
        }
    }

    goodsInfo.goods_count = goodsInfo.count;
    goodsInfo.count = count;
    let order_id = await order.createShelvesOrder(user_info.uid, [goodsInfo], total_price, address_info);
    if (order_id > 0) {
        res.send(base.result_ok("创建订单成功!", order_id));
        return;
    } else {
        await redis.Client3.HINCRBY(`${KEYS.SHELVES_GOODS_COUNTER}`, gid.toString(), count);
        res.send(base.result_error("创建订单失败!"));
        return;
    }
};

/**
 * 取消首页商品订单【2】
 */
order.cancelShelvesOrder = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let order_id = parseInt(req.body.order_id);
    if (!(order_id > 0)) {
        res.send(base.result_error("订单id错误"));
        return;
    }

    let order = await mysql.query("SELECT * FROM user_order_shelves WHERE order_id=? AND uid=? AND pay_state=0 AND state=1", [order_id, user_info.uid]);

    if (order.length > 0) {
        order = order[0];
        let allgoods = JSON.parse(order.goods_info);
        for (let i = 0; i < allgoods.length; i++) {
            let buy_count = allgoods[i].count;
            let goodsInfo = await redis.Client3.hGet(`${KEYS.SHELVES_GOODS}0`, allgoods[i].gid.toString());
            if (goodsInfo == null) {
                console.log(`取消订单没有找到相关订单${goodsInfo.gid}在RClient中`);
            } else {
                goodsInfo = JSON.parse(goodsInfo);
                goodsInfo.count += buy_count;
                await redis.Client3.HSET(`${KEYS.SHELVES_GOODS}0`, goodsInfo.gid.toString(), JSON.stringify(goodsInfo));
                if (goodsInfo.cid > 0) {
                    await redis.Client3.HSET(`${KEYS.SHELVES_GOODS}${goodsInfo.cid}`, goodsInfo.gid.toString(), JSON.stringify(goodsInfo));
                }
                await redis.Client3.HINCRBY(`${KEYS.SHELVES_GOODS_COUNTER}`, goodsInfo.gid.toString(), buy_count);
            }
        }
        await mysql.query("UPDATE user_order_shelves SET state=-1 WHERE order_id=? ", [order_id]);

        res.send(base.result_ok("取消成功!"));
        return;
    } else {
        res.send(base.result_error("没有找到相关订单或订单状态不匹配"));
        return;
    }
};

/**
 * 货架首页商品查看订单【2】
 */
order.viewOrder = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let order_id = parseInt(req.body.order_id);
    if (!(order_id > 0)) {
        res.send(base.result_error("订单id错误"));
        return;
    }

    let sql = `SELECT * FROM user_order_shelves WHERE order_id=? AND uid=?`;

    let sql_result = await mysql.query(sql, [order_id, user_info.uid]);
    if (sql_result.length > 0) {
        res.send(base.result_ok("ok!", sql_result[0]));
        return;
    } else {
        res.send(base.result_error("没有找到相关订单"));
        return;
    }
};


// ---- private ----
/**
 * 创建抢购商品订单（用户抢购成功）
 * @param {*} uid 
 * @param {*} goods 
 */
order.createRushOrder = async (uid, goods, sid, address_info) => {
    // 生成订单号
    let timeDtr = moment().format('YYMMDDHHmmss');
    let uidStr = base.pad(uid, 6);
    let ran = base.getRandomCode(0, 9);
    let order_no = `D${timeDtr}${uidStr}${ran}`;

    let sql = `INSERT INTO user_order (order_no,uid,gid,schedule_id,g_price,g_count,saler_id,address_info) VALUES (?,?,?,?,?,?,?,?)`;
    let sql_result = await mysql.query(sql, [order_no, uid, goods.gid, sid, goods.price, 1, goods.belong, JSON.stringify(address_info)]);
    if (sql_result.insertId > 0) {
        return sql_result.insertId;
    }
    return -1;
};


/**
 * 创建货架商品订单（用户首页购买）
 * @param {*} uid 
 * @param {*} goods 
 */
order.createShelvesOrder = async (uid, list, total_price, address_info) => {
    // 生成订单号
    let timeDtr = moment().format('YYMMDDHHmmss');
    let uidStr = base.pad(uid, 6);
    let ran = base.getRandomCode(0, 9);
    let order_no = `H${timeDtr}${uidStr}${ran}`;

    if (address_info) {
        address_info = JSON.stringify(address_info);
    } else {
        address_info = "";
    }

    let sql = `INSERT INTO user_order_shelves (order_no,uid,goods_info,price,real_price,address_info) VALUES (?,?,?,?,?,?)`;
    let sql_result = await mysql.query(sql, [order_no, uid, JSON.stringify(list), total_price, total_price, address_info]);
    if (sql_result.insertId > 0) {
        return sql_result.insertId;
    }
    return -1;
};

let tick = 0;
/**
 * 创建上架订单
 * @param {*} uid 
 * @param {*} goods 
 */
order.createPublishOrder = async (uid, gid, newprice, oldprice, payprice, rate, coupon_id, relate_order_id) => {
    // 生成订单号
    let timeDtr = moment().format('YYMMDDHHmmss');
    let uidStr = base.pad(uid, 6);
    let ran = base.getRandomCode(0, 9);
    tick++;
    tick %= 1000;
    let order_no = `P${timeDtr}${uidStr}${base.pad(tick, 3)}`;

    let sql = `INSERT INTO user_order_publish (order_no,uid,gid,newprice,oldprice,payprice,rate,coupon_id,relate_order_id) VALUES (?,?,?,?,?,?,?,?,?)`;
    let sql_result = await mysql.query(sql, [order_no, uid, gid, newprice, oldprice, payprice, rate, coupon_id, relate_order_id]);

    await mysql.query("UPDATE user_coupon SET state=-1 WHERE uid=? AND id=?", [uid, coupon_id]);

    if (sql_result.insertId > 0) {
        return { id: sql_result.insertId, order_no: order_no };
    }
    return -1;
};


/**
 * 创建上架订单
 * @param {*} uid 
 * @param {*} goods 
 */
order.createPublishOrderDiv = async (uid, gid, newprice, oldprice, payprice, rate, coupon_id, relate_order_id) => {
    // 生成订单号
    let timeDtr = moment().format('YYMMDDHHmmss');
    let uidStr = base.pad(uid, 6);
    let ran = base.getRandomCode(0, 9);
    tick++;
    tick %= 1000;
    let order_no = `P${timeDtr}${uidStr}${base.pad(tick, 3)}`;

    let sql = `INSERT INTO user_order_publish (order_no,uid,gid,newprice,oldprice,payprice,rate,coupon_id,relate_order_id,pay_state,ex) VALUES (?,?,?,?,?,?,?,?,?,1,'div')`;
    let sql_result = await mysql.query(sql, [order_no, uid, gid, newprice, oldprice, payprice, rate, coupon_id, relate_order_id]);

    await mysql.query("UPDATE user_coupon SET state=-1 WHERE uid=? AND id=?", [uid, coupon_id]);

    if (sql_result.insertId > 0) {
        return { id: sql_result.insertId, order_no: order_no };
    }
    return -1;
};
module.exports = order;