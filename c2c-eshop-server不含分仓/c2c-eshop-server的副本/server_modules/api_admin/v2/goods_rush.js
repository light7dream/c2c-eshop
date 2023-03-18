let goods_rush = {};

let base = require('../../base');
let mysql = require('../../mysql');
let moment = require('moment');
let redis = require('../../redis');
let KEYS = require('../../redis_key');

let web_order = require('../../api_web/order');
const XLSX = require('xlsx')
const path = require('path')

/**
 * V2:获取抢购商品
 * @param {*} req 
 * @param {*} res 
 */
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
    LEFT JOIN rush_schedule f ON a.sid=f.id 
    LEFT JOIN user_bucket g ON a.bucket_id = g.uid
    WHERE a.gid<>0 `;

    let sql_count = `SELECT COUNT(*) total_count FROM goods_rush a 
    LEFT JOIN rush_schedule f ON a.sid=f.id  WHERE a.gid<>0 `;
    let sql_params = [];
    if(token_info.data.roles.indexOf(2) == 1)
    {
        sql += " AND a.bucket_id=? ";
        sql_count += " AND a.bucket_id=? ";
        sql_params.push(user_info.bucket_id);    
    }
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
    list.forEach(item => {
        item.schedulelist = [item.sid].filter(Boolean)
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
 * V2:导出抢购商品
 * @param {*} req 
 * @param {*} res 
 */
 goods_rush.exportGoods = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    // let page_size = parseInt(req.body.page_size);
    // let page_index = parseInt(req.body.page_index);
    // if (!(page_size > 0) || !(page_index >= 0)) {
    //     res.send(base.result_error("分页参数错误", { page_index, page_size }));
    //     return;
    // }
    // let limit = page_index * page_size;

    let cid = parseInt(req.body.cid);
    let sid = parseInt(req.body.sid);
    let name = req.body.name;
    let state = parseInt(req.body.state);

    let sql = `SELECT a.*,b.nickname belong_nickname,b.phone belong_phone,b.avatar belong_avatar,b.payee_name belong_payeename,b.payee_bankno belong_bankno,b.payee_bankname belong_bankname,b.wxpay_img belong_wxpay_img,b.alipay_img belong_alipay_img,
    c.nickname rusher_nickname,c.phone rusher_phone,c.avatar rusher_avatar,c.payee_name rusher_payeename,c.payee_bankno rusher_bankno,c.payee_bankname rusher_bankname,c.wxpay_img rusher_wxpay_img,c.alipay_img rusher_alipay_img,
    d.nickname last_belong_nickname,d.phone last_belong_phone,d.avatar last_belong_avatar,f.name schedule_name 
    FROM goods_rush a 
    LEFT JOIN user b ON a.belong=b.uid   
    LEFT JOIN user c ON a.rusher_id=c.uid   
    LEFT JOIN user d ON a.last_belong=d.uid  
    LEFT JOIN rush_schedule f ON a.sid=f.id 
    WHERE a.gid<>0 `;

    let sql_count = `SELECT COUNT(*) total_count FROM goods_rush a 
    LEFT JOIN rush_schedule f ON a.sid=f.id  WHERE a.gid<>0 `;
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
    sql += " ORDER BY a.gid DESC";
    // sql_params.push(limit);
    // sql_params.push(page_size);

    let sql_result = await mysql.query(sql, sql_params);
    // let sql_count_result = await mysql.query(sql_count, sql_params);

    let list = sql_result;
    list.forEach(item => {
        item.schedulelist = [item.sid].filter(Boolean)
    });

    const workbook = [['商品id', '商品编号','商品名称', '初始价格', '价格','商品简介','买方信息','卖方信息','抢购场次','状态']]
    const buckets = await mysql.query("SELECT * FROM user_bucket WHERE uid>0");
    // let sql_count_result = await mysql.query(sql_count, sql_params);
    for(let good of list){
        let sname = ''
        const stateMap = ['未上架','已上架','待支付','已支付','已确认','待解决','已提货','已发货']
        let state = '已删除'
        if(good.state>-1){
            state = stateMap[good.state]
        }
        let schedule_name = good.schedule_name || ''
        let bucket = buckets.find(bucket => bucket.uid === good.bucket_id)
        let bucket_name = bucket ? bucket.name : '总仓'
        let sName = `${schedule_name}(${bucket_name})`

        workbook.push([good.gid||'',good.code||'',good.name||'',(good.last_price&&good.last_price)/100||'',(good.price&&good.price/100)||'',good.summary||'',good.rusher_nickname || '',good.belong_nickname ||'卖方信息未找到',sName, state])
    }
    const filename = `抢购商品列表_${new Date()
        .toJSON()
        .slice(0, 10)}_${Date.now()}.xlsx`
    const targetPath = path.resolve(path.join(__dirname,`../../../xlsx/${filename}`))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(workbook)
    XLSX.utils.book_append_sheet(wb, ws)
    XLSX.writeFile(wb, `${targetPath}`, {
    compression: true,
    })

    res.send(base.result_ok('ok', `./xlsx/${filename}`))
};


/**
 * V2:添加抢购商品
 * @param {*} req 
 * @param {*} res 
 */
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

    let sid = parseInt(req.body.sid);
    if (!(sid >= 0)) {
        sid = 0;
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

    let bucket_id = parseInt(req.body.bucket_id)||0;
    let belong = parseInt(req.body.belong) || user_info.uid

    let sql = `INSERT INTO goods_rush (cid,sid,name,summary,description,img,base_price,price,state,belong,bucket_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
    let sql_params = [cid, sid, name, summary, description, img, price, price, state, belong,bucket_id];
    if(belong&&belong>0) {
        sql_params.push(belong)
    }
    let sql_result = await mysql.query(sql, sql_params);

    if (sql_result.insertId > 0) {
        await goods_rush.syncRushSingle(sql_result.insertId);
        res.send(base.result_ok("添加成功", sql_result.insertId));
        return;
    } else {
        res.send(base.result_ok("添加失败", sql_result.insertId));
        return;
    }
};


/**
 * V2:更新抢购商品
 * @param {*} req 
 * @param {*} res 
 */
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

    let sid = parseInt(req.body.sid);
    if (!(sid >= 0)) {
        sid = 0;
    }

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
    let rusher_id = parseInt(req.body.rusher_id)||0
    let bucket_id = parseInt(req.body.bucket_id)||0;
    let sql = "";
    let sql_params = [];
    let selectBucket_sql = 'SELECT * FROM user WHERE uid = ?'

    let belong = parseInt(req.body.belong)
    sql = `UPDATE goods_rush SET cid=?, sid=?, name=?, summary=?, description=?, img=?, price=?,  state=? 
          ${ belong&&belong>0 ? ',belong=?, bucket_id=?' : ''} 
          ${rusher_id && rusher_id >0 ? ',rusher_id = ?' : ''} 
          WHERE gid=?`;
    sql_params = [cid, sid, name, summary, description, img, price, state];
    if(belong&&belong>0) {
        sql_params.push(belong)
      let buctet_result = await mysql.query(selectBucket_sql,[belong])
      if(buctet_result.length > 0){
        sql_params.push(buctet_result[0].bucket_id)
      }else{
        sql_params.push(bucket_id)
      }
    }
    if(rusher_id && rusher_id > 0){
      sql_params.push(rusher_id)
    }
    sql_params.push(gid)
    let sql_result = await mysql.query(sql, sql_params);
    base.logAdmin(user_info.uid, '更新抢购商品', `state:${state},gid:${gid}`);
    await goods_rush.syncRushSingle(gid);
    res.send(base.result_ok("更新成功"));
    return;
};

/**
 * V2:拆分抢购商品
 * @param {*} req 
 * @param {*} res 
 */
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
 * V2:删除抢购商品
 * @param {*} req 
 * @param {*} res 
 */
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
        res.send(base.result_ok("删除成功"));
        return;
    } else {
        res.send(base.result_warning("删除异常"));
        return;
    }
}

/**
 * V2:修改商品的分仓
 * @param {*} req 
 * @param {*} res 
 */
 goods_rush.updateBucket = async (req, res) => {
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

  let bucket_id = parseInt(req.body.bucket_id);
  if(bucket_id < 0){
    res.send(base.result_error("参数错误"));
      return;
  }

  let sql = `UPDATE goods_rush SET bucket_id=? WHERE gid=?`;
  let sql_params = [bucket_id, gid];
  let sql_result = await mysql.query(sql, sql_params);
  if (sql_result.affectedRows > 0) {
      res.send(base.result_ok("修改成功"));
      return;
  } else {
      res.send(base.result_warning("修改异常"));
      return;
  }
}

// ---- private ----

/**
 * 同步抢购
 */
goods_rush.syncRush = async () => {
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
};

/**
 * 同步抢购
 */
goods_rush.syncRushSingle = async (gid) => {
    let data = await mysql.query("SELECT * FROM goods_rush WHERE gid=?", gid);
    if(data.length>0){
        await redis.Client0.hSet(`${KEYS.RUSH_GOODS}${data[0].sid}`, gid.toString(), JSON.stringify(data[0]));
        if (data[0].state == 1) {
            await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}${data[0].sid}`, gid.toString(), '1');
        } else {
            await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}${data[0].sid}`, gid.toString(), '0');
        }
    }
};

module.exports = goods_rush;