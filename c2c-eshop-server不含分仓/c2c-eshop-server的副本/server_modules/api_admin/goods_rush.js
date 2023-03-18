let goods_rush = {};

let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
const { result_ok } = require('../base');
let redis = require('../redis');
let KEYS = require('../redis_key');

let web_order = require('../api_web/order');

/**
 * 获取抢购商品
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
goods_rush.getGoods = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let page_size = parseInt(req.body.page_size);
    let page_index = parseInt(req.body.page_index);
    if (!(page_size > 0) || !(page_index >= 0)) {
        res.send(base.result_error("分页参数错误", { page_index, page_size }));
        return;
    }
    let limit = page_index * page_size;

    let cid = parseInt(req.body.cid);
    let sid = parseInt(req.body.sid);
    let name = req.body.name;
    let state = parseInt(req.body.state);
	
	let sql = `SELECT a.*,b.nickname belong_nickname,b.phone belong_phone,b.avatar belong_avatar,b.payee_name belong_payeename,b.payee_bankno belong_bankno,b.payee_bankname belong_bankname,b.wxpay_img belong_wxpay_img,b.alipay_img belong_alipay_img,
    c.nickname rusher_nickname,c.phone rusher_phone,c.avatar rusher_avatar,c.payee_name rusher_payeename,c.payee_bankno rusher_bankno,c.payee_bankname rusher_bankname,c.wxpay_img rusher_wxpay_img,c.alipay_img rusher_alipay_img,
    d.nickname last_belong_nickname,d.phone last_belong_phone,d.avatar last_belong_avatar,f.name schedule_name,g.bucket_name 
    FROM goods_rush a 
    LEFT JOIN user b ON a.belong=b.uid   
    LEFT JOIN user c ON a.rusher_id=c.uid   
    LEFT JOIN user d ON a.last_belong=d.uid  
    LEFT JOIN goods_rush_schedule_map e ON a.gid=e.gid 
    LEFT JOIN rush_schedule f ON e.sid=f.id 
    LEFT JOIN user_bucket g ON a.bucket_id = g.uid
		
    WHERE a.gid<>0 `;

    let sql_count = `SELECT COUNT(*) total_count FROM goods_rush a 
    LEFT JOIN goods_rush_schedule_map e ON a.gid=e.gid 
    LEFT JOIN rush_schedule f ON e.sid=f.id  WHERE a.gid<>0 `;
    let sql_params = [];

    if (cid > 0) {
        sql += " AND a.cid=? ";
        sql_count += " AND a.cid=? ";
        sql_params.push(cid);
    }
    if (sid > 0||sid==0) {
        sql += " AND a.sid=? ";
        sql_count += " AND a.sid=? ";
        sql_params.push(sid);
    }
    if (user_info.isbucket) {
        sql += " AND a.belong IN (?) ";
        sql_count += " AND a.belong IN (?) ";
        sql_params.push(user_info.members);
    }
    if (name) {
        sql += " AND (a.name LIKE ? OR a.summary LIKE ? OR a.description LIKE ?)  ";
        sql_count += " AND (a.name LIKE ? OR a.summary LIKE ? OR a.description LIKE ?)  ";
        sql_params.push(`%${name}%`);
        sql_params.push(`%${name}%`);
        sql_params.push(`%${name}%`);
    }
    if (state > -1) {
        sql += " AND a.state=? ";
        sql_count += " AND a.state=? ";
        sql_params.push(state);
    } else {
        sql += " AND a.state<>-1 ";
        sql_count += " AND a.state<>-1 ";
    }
    sql += " ORDER BY a.gid DESC LIMIT ?,?";
    sql_params.push(limit);
    sql_params.push(page_size);

    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);

    let list = sql_result;
    let gids = list.map(item => {
        return item.gid;
    });

    // 没有商品时直接返回空列表
    if (gids.length == 0) {
        let data = {
            page_index,
            page_size,
            total_count: 0,
            list: []
        }
        res.send(base.result_ok("ok", data));
        return;
    }
    let schedules = [];
    if (gids.length > 0) {
        schedules = await mysql.query("SELECT * FROM goods_rush_schedule_map WHERE gid IN (?)", [gids]);
    }
    let schedulesMap = {};
    schedules.forEach(s => {
        if (schedulesMap[s.gid]) {
            schedulesMap[s.gid].push(s.sid);
        } else {
            schedulesMap[s.gid] = [s.sid];
        }
    });
    list.forEach(item => {
        item.schedulelist = schedulesMap[item.gid] ? schedulesMap[item.gid] : []
    });

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: list
    }

    res.send(base.result_ok("ok", data));
};


/**
 * 添加抢购商品
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
goods_rush.add = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let cid = parseInt(req.body.cid);
    if (!(cid >= 0)) {
        res.send(base.result_error("分类错误"));
        return;
    }

    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("商品名称不能为空"));
        return;
    }

    let summary = req.body.summary;
    if (!summary) {
        summary = name;
    }

    let description = req.body.description;
    if (!description) {
        res.send(base.result_error("商品详情不能为空"));
        return;
    }

    let price = parseInt(req.body.price);
    if (!(price > 0)) {
        res.send(base.result_error("价格不合法"));
        return;
    }

    let state = parseInt(req.body.state);
    if (!(state > -1)) {
        res.send(base.result_error("商品状态不合法"));
        return;
    }

    let img = req.body.img;
    if (!img) {
        res.send(base.result_error("请设置商品图片"));
        return;
    }

    let sql = `INSERT INTO goods_rush (cid,name,summary,description,img,base_price,price,state,belong) VALUES (?,?,?,?,?,?,?,?,?)`;
    let sql_params = [cid, name, summary, description, img, price, price, state, user_info.uid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.insertId > 0) {
        let schedulelist = req.body.schedulelist;
        if (Array.isArray(schedulelist)) {
            // 过滤空场次信息
            let validScheduleList = schedulelist.filter(Boolean)
            if (validScheduleList.length === 0) {
                res.send(base.result_ok("添加成功", sql_result.insertId));
                return
            }
            sql = 'INSERT INTO goods_rush_schedule_map (gid,sid) VALUES ';
            sql_params = [];
            validScheduleList.forEach(s => {
                sql += "(?,?),"
                sql_params.push(sql_result.insertId);
                sql_params.push(s);
            });
            if (sql_params.length > 0) {
                sql = sql.substring(0, sql.length - 1);
                await mysql.query(sql, sql_params);
            }

        }

        if (state == 1) {
            let data = await mysql.query(`SELECT a.*,b.nickname belong_name,b.avatar belong_avatar FROM goods_rush a LEFT JOIN user b ON a.belong=b.uid WHERE a.gid=?`, [sql_result.insertId]);
        } else if (state == 0) {
            let data = await mysql.query("SELECT * FROM goods_rush WHERE gid=?", [sql_result.insertId]);
        }
        await goods_rush.syncRushSingle(sql_result.insertId);

        res.send(base.result_ok("添加成功", sql_result.insertId));
        return;
    } else {
        res.send(base.result_error("添加失败"));
        return;
    }
};


/**
 * 更新抢购商品
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
goods_rush.update = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("抢购商品id错误"));
        return;
    }

    let cid = parseInt(req.body.cid);
    if (!(cid >= 0)) {
        cid = 0;
        // res.send(base.result_error("分类错误"));
        // return;
    }

    let name = req.body.name;
    if (!name) {
        res.send(base.result_error("商品名称不能为空"));
        return;
    }

    let summary = req.body.summary;
    if (!summary) {
        res.send(base.result_error("商品简介不能为空"));
        return;
    }

    let description = req.body.description;
    if (!description) {
        res.send(base.result_error("商品详情不能为空"));
        return;
    }

    let price = parseInt(req.body.price);
    if (!(price > 0)) {
        res.send(base.result_error("价格不合法"));
        return;
    }

    let state = parseInt(req.body.state);

    if (!(state > -1)) {
        res.send(base.result_error("商品状态不合法"));
        return;
    }

    let img = req.body.img;
    if (!img) {
        res.send(base.result_error("请设置商品图片"));
        return;
    }
    let sql = "";
    let sql_params = [];
    let schedulelist = req.body.schedulelist;
    // 过滤空场次信息
    let validScheduleList = schedulelist.filter(Boolean)
    // todo 更新场次修改信息到redis
    if (Array.isArray(schedulelist)) {
        if (validScheduleList.length === 0) {
            res.send(base.result_ok("更新成功"));
            return
        }
        await redis.Client0.hSet(`${KEYS.RUSH_GOODS_COUNTER}${validScheduleList[0]}`, gid.toString(), '1');
        await mysql.query("DELETE FROM goods_rush_schedule_map WHERE gid=?", gid);
        sql = 'INSERT INTO goods_rush_schedule_map (gid,sid) VALUES ';
        sql_params = [];
        validScheduleList.forEach(s => {
            sql += "(?,?),"
            sql_params.push(gid);
            sql_params.push(s);
        });
        if (sql_params.length > 0) {
            sql = sql.substring(0, sql.length - 1);
            await mysql.query(sql, sql_params);
        }
    }

    sql = `UPDATE goods_rush SET cid=?, name=?, summary=?, description=?, img=?, price=?,  state=? WHERE gid=?`;
    sql_params = [cid, name, summary, description, img, price, state, gid];
    let sql_result = await mysql.query(sql, sql_params);
    if (state == 1) {
        let data = await mysql.query(`SELECT a.*,b.nickname belong_name,b.avatar belong_avatar FROM goods_rush a LEFT JOIN user b ON a.belong=b.uid WHERE a.gid=?`, [gid]);
        if(validScheduleList.length > 0){
            await redis.Client0.hSet(`${KEYS.RUSH_GOODS}${validScheduleList[0]}`, gid.toString(), JSON.stringify(data));
            await redis.Client0.hSet(`${KEYS.RUSH_GOODS_COUNTER}${validScheduleList[0]}`, gid.toString(), '1');
        }
    } else if (state == 0) {
        let data = await mysql.query("SELECT * FROM goods_rush WHERE gid=?", [gid]);
        if(validScheduleList.length > 0){
            await redis.Client0.hSet(`${KEYS.RUSH_GOODS}${validScheduleList[0]}`, gid.toString(), JSON.stringify(data));
            await redis.Client0.hSet(`${KEYS.RUSH_GOODS_COUNTER}${validScheduleList[0]}`, gid.toString(), '0');
        }
    }
    base.logAdmin(user_info.uid, '更新抢购商品', `state:${state},gid:${gid}`);
    await goods_rush.syncRushSingle(gid);
    res.send(base.result_ok("更新成功"));
    return;
};

/**
 * 拆分抢购商品【2】
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
goods_rush.divRushGoods = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let origin_gid = parseInt(req.body.origin_gid);
    if (!(origin_gid > 0)) {
        res.send(base.result_error("待拆分商品id错误"));
        return;
    }

    let new_price = parseInt(req.body.new_price + 0.1);
    if (!(new_price > 0)) {
        res.send(base.result_error("待拆分商品价格错误"));
        return;
    }

    let sub_gids = req.body.sub_gids;
    if (!Array.isArray(sub_gids) || sub_gids.length == 0) {
        res.send(base.result_error("新拆分商品id错误"));
        return;
    }

    let sql = `SELECT * FROM goods_rush WHERE gid=? AND state=1`;
    let sql_params = [origin_gid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.length == 0) {
        res.send(base.result_error("没有找到待拆分的商品"));
        return;
    }
    let originData = sql_result[0];

    sql = `SELECT * FROM goods_rush WHERE gid IN (?) AND last_belong=0`;
    sql_result = await mysql.query(sql, [sub_gids]);
    if (sql_result.length != sub_gids.length) {
        res.send(base.result_error("(部分)新拆分商品没有找到"));
        return;
    }
    let sub_total_price = 0;
    sql_result.forEach(item => {
        sub_total_price += item.price;
    });

    if ((new_price + sub_total_price) != originData.price) {
        console.log('拆分价格错误');
        console.log(`新价:${new_price} 子商品总价:${sub_total_price} 原价:${originData.price}`);
        console.log(`原商品:${origin_gid} 子商品:${sub_gids}`);
        res.send(base.result_error("拆分失败"));
        return;
    }

    // 检查是否在抢购中,在抢购中不允许拆分? 暂不检查，下周期更新
    // 旧的拆分逻辑
    // await mysql.query("UPDATE goods_rush SET price=? WHERE gid=?", [new_price, origin_gid]);
    // let s = await mysql.query("UPDATE goods_rush SET belong=?,state=? WHERE gid IN (?)", [originData.belong, originData.state, sub_gids]);

    // 新拆分逻辑，订单的收益也要分开计算
    let publishOrder = await mysql.query("SELECT * FROM user_order_publish WHERE order_no=?", [originData.publish_order_no]);
    publishOrder = publishOrder[0];
    let divRate = new_price / originData.price;
    await mysql.query("UPDATE goods_rush SET price=? WHERE gid=?", [new_price, origin_gid]);
    await mysql.query("UPDATE user_order_publish SET newprice=?,oldprice=?,payprice=? WHERE id=?", [new_price, parseInt(publishOrder.oldprice * divRate), parseInt(publishOrder.payprice * divRate), publishOrder.id]);

    for (let i = 0; i < sql_result.length; i++) {
        let oprice = parseInt(sql_result[i].price / publishOrder.newprice * publishOrder.oldprice); // 按比例折算收益订单原价格
        let pprice = parseInt(oprice * publishOrder.rate * 0.01); // 按比例折算收益订单新价格
        let divPublish = await web_order.createPublishOrderDiv(publishOrder.uid, sql_result[i].gid, sql_result[i].price, oprice, pprice, publishOrder.rate, publishOrder.coupon_id, publishOrder.relate_order_id);
        let s = await mysql.query("UPDATE goods_rush SET belong=?,state=?,publish_order_no=? WHERE gid =?", [originData.belong, originData.state, divPublish.order_no, sql_result[i].gid]);
    }

    await goods_rush.syncRush();
    res.send(base.result_ok("拆分成功"));
    return;
}

/**
 * 获取可拆分的商品
 * @param {*} req 
 * @param {*} res 
 */
goods_rush.getCanDivGoods = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let admins = await mysql.query("SELECT * FROM user WHERE roles LIKE '%1%' AND state=1");
    if (admins.length > 0) {
        admins = admins.map(item => {
            return item.uid;
        });
    } else {
        admins = [user_info.uid];
    }

    let sql = `SELECT * FROM goods_rush WHERE state=0 AND belong IN (?) AND last_belong=0`;
    let sql_result = await mysql.query(sql, [admins]);
    res.send(base.result_ok("ok", sql_result));
};


/**
 * 删除抢购商品
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
goods_rush.delete = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("抢购商品id错误"));
        return;
    }

    let sql = `UPDATE goods_rush SET state=-1 WHERE gid=?`;
    let sql_params = [gid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        let data = await mysql.query("SELECT * FROM goods_rush WHERE gid=?", [gid]);
        let schedule = await mysql.query("SELECT * FROM rush_schedule", []);
        let schedulelist = schedule.map(item => {
            return item.id;
        });
        res.send(base.result_ok("删除成功"));
        return;
    } else {
        res.send(base.result_warning("删除异常"));
        return;
    }
}

// ---- private ----

/**
 * 同步抢购
 */
// TODO:v2
goods_rush.syncRush = async () => {
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
};

/**
 * 同步抢购
 */
// TODO:v2
goods_rush.syncRushSingle = async (gid) => {

    let schedule = await mysql.query("SELECT * FROM goods_rush_schedule_map WHERE gid=?", [gid]);

    if (schedule.length > 0) {
        let sid = schedule[0].sid;
        let data = await mysql.query("SELECT * FROM goods_rush WHERE gid=?", gid);
        await redis.Client0.hSet(`${KEYS.RUSH_GOODS}${sid}`, gid.toString(), JSON.stringify(data[0]));

        if (data[0].state == 1) {
            // await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}`, `${sid}`, '1');
            await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}${sid}`, gid.toString(), '1');
        } else {
            // await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}`, `${sid}`, '0');
            await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}${sid}`, gid.toString(), '0');
        }
    }
};

module.exports = goods_rush;