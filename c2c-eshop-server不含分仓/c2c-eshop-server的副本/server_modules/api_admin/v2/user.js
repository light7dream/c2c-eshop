let user = {};

let base = require('../../base');
let mysql = require('../../mysql');
let moment = require('moment');
let redis = require('../../redis');
let KEYS = require('../../redis_key');
const XLSX = require('xlsx')
const path = require('path')

/**
 * V2:获取用户
 * @param {*} req 
 * @param {*} res 
 */
user.getList = async (req, res) => {
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

    let nickname = req.body.nickname;
    let phone = req.body.phone;
    let state = parseInt(req.body.state);
    let has_recommender = parseInt(req.body.has_recommender);
    let isbad = parseInt(req.body.isbad);

    let sql = `SELECT a.uid,a.avatar,a.phone,a.nickname,a.payee_name,a.payee_bankname,a.payee_bankno,a.wxpay_img,a.alipay_img,a.roles,
    a.edit_bank_access,a.has_read_protocol,a.bucket_id,c.bucket_name,c.admin_uid,d.nickname bucket_admin_name,
    a.qrcode,a.sign,a.state,a.bad,a.level1_recommender,b.phone recommender_phone,b.nickname recommender_nickname 
    FROM user a 
    LEFT JOIN user b ON a.level1_recommender=b.uid 
    LEFT JOIN user_bucket c ON a.bucket_id=c.uid 
    LEFT JOIN user d ON d.uid=c.admin_uid 
    WHERE a.uid<>0 `;
    let sql_count = `SELECT COUNT(*) total_count FROM user WHERE uid<>0 `;
    let sql_params = [];

    if (nickname) {
        sql += " AND a.nickname LIKE ? ";
        sql_count += " AND nickname LIKE ? ";
        sql_params.push(`%${nickname}%`);
    }
    if (phone) {
        sql += " AND a.phone LIKE ? ";
        sql_count += " AND phone LIKE ? ";
        sql_params.push(`%${phone}%`);
    }

    // 推荐人筛选
    if (has_recommender == 0) {
        sql += " AND a.level1_recommender=? ";
        sql_count += " AND level1_recommender=? ";
        sql_params.push(has_recommender);
    } else if (has_recommender == 1) {
        sql += " AND a.level1_recommender>? ";
        sql_count += " AND level1_recommender>? ";
        sql_params.push(0);
    }

    // 恶意用户筛选
    if (isbad == 0 || isbad == 1) {
        sql += " AND a.bad=? ";
        sql_count += " AND bad=? ";
        sql_params.push(isbad);
    }

// 正常账号
if (state > -1) {
    sql += " AND a.state=? ";
    sql_count += " AND state=? ";
    sql_params.push(state);
} else if(state === -1){
    sql += " AND a.state=-1 ";
    sql_count += " AND state=-1 ";
}else{
    sql += " AND a.state<>-1 ";
    sql_count += " AND state<>-1 ";
}

    sql += " ORDER BY a.state DESC,a.uid ASC LIMIT ?,?";
    sql_params.push(limit);
    sql_params.push(page_size);

    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);
    sql_result.forEach(user => {
        let roles = []
        if (user.roles) {
            // 使用JSON.parse要try...catch，以防报错
            try {
                roles = JSON.parse(user.roles)
            } catch (e) {
                console.error(e)
            }
        }
        user.roles = roles
    })

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
};

/**
 * V2:导出用户
 * @param {*} req 
 * @param {*} res 
 */
 user.exportList = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let nickname = req.body.nickname;
    let phone = req.body.phone;
    let state = parseInt(req.body.state);
    let has_recommender = parseInt(req.body.has_recommender);
    let isbad = parseInt(req.body.isbad);

    let sql = `SELECT a.uid,a.avatar,a.phone,a.nickname,a.payee_name,a.payee_bankname,a.payee_bankno,a.wxpay_img,a.alipay_img,a.roles,
    a.edit_bank_access,a.has_read_protocol,a.bucket_id,c.bucket_name,c.admin_uid,d.nickname bucket_admin_name,
    a.qrcode,a.sign,a.state,a.bad,a.level1_recommender,b.phone recommender_phone,b.nickname recommender_nickname 
    FROM user a 
    LEFT JOIN user b ON a.level1_recommender=b.uid 
    LEFT JOIN user_bucket c ON a.bucket_id=c.uid 
    LEFT JOIN user d ON d.uid=c.admin_uid 
    WHERE a.uid<>0 `;
    let sql_count = `SELECT COUNT(*) total_count FROM user WHERE uid<>0 `;
    let sql_params = [];

    if (nickname) {
        sql += " AND a.nickname LIKE ? ";
        sql_count += " AND nickname LIKE ? ";
        sql_params.push(`%${nickname}%`);
    }
    if (phone) {
        sql += " AND a.phone LIKE ? ";
        sql_count += " AND phone LIKE ? ";
        sql_params.push(`%${phone}%`);
    }

    // 推荐人筛选
    if (has_recommender == 0) {
        sql += " AND a.level1_recommender=? ";
        sql_count += " AND level1_recommender=? ";
        sql_params.push(has_recommender);
    } else if (has_recommender == 1) {
        sql += " AND a.level1_recommender>? ";
        sql_count += " AND level1_recommender>? ";
        sql_params.push(0);
    }

    // 恶意用户筛选
    if (isbad == 0 || isbad == 1) {
        sql += " AND a.bad=? ";
        sql_count += " AND bad=? ";
        sql_params.push(isbad);
    }

    if (state > -1) {
        sql += " AND a.state=? ";
        sql_count += " AND state=? ";
        sql_params.push(state);
    } else {
        sql += " AND a.state<>-1 ";
        sql_count += " AND state<>-1 ";
    }

    sql += " ORDER BY a.state DESC,a.uid ASC ";

    let sql_result = await mysql.query(sql, sql_params);
    // let sql_count_result = await mysql.query(sql_count, sql_params);
    sql_result.forEach(user => {
        let roles = []
        if (user.roles) {
            // 使用JSON.parse要try...catch，以防报错
            try {
                roles = JSON.parse(user.roles)
            } catch (e) {
                console.error(e)
            }
        }
        user.roles = roles
    })

    const workbook = [['手机号', '昵称','银行卡信息', '推荐人', '状态','恶意用户','管理员','银行卡','阅读协议']]
    for(let user of sql_result){
        const bankInfo = `收款人: ${user.payee_name || ''}\n 卡号: ${user.payee_bankno || ''}\n 开户行:${user.payee_bankname || ''}`
        const recommendInfo = `推荐人: ${user.recommender_nickname || ''}\n 手机号: ${user.recommender_phone || ''}`
        let state = '未知'
        if(user.state == 0){
            state = '停用'
        } else if(user.state == 1){
            state = '正常'
        }
        workbook.push([user.phone||'',user.nickname||'',bankInfo,recommendInfo,state,user.bad?'是':'否',user.roles.includes(1)?'是':'否',user.edit_bank_access?'可编辑':'不可编辑',user.has_read_protocol?'是':'否'])
    }
    const filename = `用户列表_${new Date()
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
 * V2:设置抢购订单信息
 */
user.setRushOrderInfo = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let state = parseInt(req.body.state);
    let order_id = parseInt(req.body.order_id);
    if (!(order_id > 0)) {
        res.send(base.result_error("订单id错误"));
        return;
    }
    let order_info = await mysql.query("SELECT a.*,b.state goods_state FROM user_order a INNER JOIN goods_rush b ON b.gid=a.gid WHERE a.order_id=?", [order_id]);
    if (order_info.length == 0) {
        res.send(base.result_error("没有找到相关订单"));
        return;
    }
    order_info = order_info[0];
    if ((state == 6 || state == 7)) {
        let parcel_info = req.body.parcel_info;
        if (!parcel_info) {
            res.send(base.result_error("请填写快递信息"));
            return;
        }
        let parcel = await mysql.query("SELECT * FROM user_parcel WHERE order_id=? AND order_from=2", [order_id]);
        if (parcel.length > 0) {
            await mysql.query("UPDATE user_parcel SET parcel=?,state=1 WHERE id=?", [parcel_info, parcel[0].id]);
        } else {
            await mysql.query("INSERT INTO user_parcel (uid,order_id,order_from,parcel,parcel_state) VALUES (?,?,?,?,?)", [order_info.uid, order_id, 2, parcel_info, 1]);
        }
        await mysql.query("UPDATE goods_rush SET state=7 WHERE current_order_id=?", [order_id]);
        res.send(base.result_ok("设置成功"));
        return;
    }

    if (order_info.goods_state == 5) {
        if (state == 2 || state == 3) {
            await mysql.query("UPDATE goods_rush SET state=? WHERE gid=?", [state, order_info.gid]);
        } else if (state == 1) {
            await mysql.query("UPDATE goods_rush SET state=?,rusher_id=0 WHERE gid=?", [state, order_info.gid]);
        }
        await user.syncRushSingle();
        base.logAdmin(user_info.uid, '设置抢购订单信息', `order_id:${order_id};state:${state}`);
        res.send(base.result_ok("已处理"));
        return;
    }

    res.send(base.result_error("状态信息错误"));
};

/**
 * V2:获取用户相关订单
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getOrders = async (req, res) => {
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

    let uid = parseInt(req.body.uid);
    if (!(uid > 0)) {
        res.send(base.result_error("用户id错误"));
        return;
    }

    let order_state = parseInt(req.body.order_state);
    if (order_state != -1 && order_state != 0 && order_state != 1) {
        order_state = -2;
    }

    let order_type = req.body.order_type;

    let data = {
        list: [],
        total_count: 0
    };
    if (order_type == 'buy') {
        data = await user.getBuyOrders(limit, page_size, uid, order_state);
    } else if (order_type == 'sale') {
        data = await user.getSaleOrders(limit, page_size, uid, order_state);
    } else {
        data = await user.getRelateOrders(limit, page_size, uid, order_state);
    }
    res.send(base.result_ok('ok', {
        page_size,
        page_index,
        ...data
    }))
    return;
}

/**
 * V2:获取纠纷订单
 */
user.getDisputeOrder = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
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

    let sql = `SELECT a.*,b.order_id,b.order_no,b.dispute,c.nickname belong_nickname,c.avatar belong_avatar,c.phone belong_phone,
        c.payee_name belong_payee_name,c.payee_bankno belong_bankno,c.payee_bankname belong_payee_bankname,c.wxpay_img belong_wxpay_img,c.alipay_img belong_alipay_img,
        d.nickname rusher_nickname,d.avatar rusher_avatar,d.phone rusher_phone,
        d.payee_name rusher_payee_name,d.payee_bankno rusher_bankno,d.payee_bankname rusher_payee_bankname,d.wxpay_img rusher_wxpay_img,d.alipay_img rusher_alipay_img,
        c.bucket_id,e.bucket_name,e.admin_uid 
        FROM goods_rush a 
        LEFT JOIN user_order b ON a.current_order_id=b.order_id 
        LEFT JOIN user c ON c.uid=a.belong 
        LEFT JOIN user d ON d.uid=a.rusher_id 
        LEFT JOIN user_bucket e ON e.uid=a.bucket_id 
        WHERE a.state=5 
        ORDER BY a.update_time ASC 
        LIMIT ?,?`;
    let sql_count = "SELECT COUNT(*) total_count FROM goods_rush WHERE state=5";
    let sql_params = [limit, page_size];

    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
};

/**
 * V2:获取提货订单
 */
user.getPickupOrder = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
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

    let sql = `SELECT a.*,b.order_id,b.order_no,c.nickname belong_nickname,b.address_info,c.avatar belong_avatar,c.phone belong_phone,
    c.payee_name belong_payee_name,c.payee_bankno belong_bankno,c.payee_bankname belong_payee_bankname,c.wxpay_img belong_wxpay_img,c.alipay_img belong_alipay_img,
    d.parcel parcel_info,c.bucket_id,e.bucket_name,e.admin_uid  
    FROM goods_rush a 
    LEFT JOIN user_order b ON a.current_order_id=b.order_id 
    LEFT JOIN user c ON c.uid=a.belong 
    LEFT JOIN user_parcel d ON d.order_id=a.current_order_id AND d.order_from=2 
    LEFT JOIN user_bucket e ON e.uid=c.bucket_id 
    WHERE a.state IN (6,7) 
    ORDER BY a.update_time ASC 
    LIMIT ?,?`;
    let sql_count = "SELECT COUNT(*) total_count FROM goods_rush WHERE state IN (6,7)";
    let sql_params = [limit, page_size];

    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);
    sql_result.forEach(item => {
        if (item.address_info) {
            item.address_info = JSON.parse(item.address_info);
        }
    });
    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
};

/**
 * V2:获取商城订单
 */
user.getShelvesOrder = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
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

    let sql = `SELECT a.*,c.nickname buyer_nickname,c.avatar buyer_avatar,c.phone buyer_phone,
        d.parcel parcel_info  
        FROM user_order_shelves a 
        LEFT JOIN user c ON c.uid=a.uid 
        LEFT JOIN user_parcel d ON d.order_id=a.order_id AND d.order_from=1 
        WHERE a.state=1 AND a.pay_state=1  
        ORDER BY a.update_time ASC 
        LIMIT ?,?`;
    let sql_count = "SELECT COUNT(*) total_count FROM user_order_shelves WHERE state=1 AND pay_state=1";
    let sql_params = [limit, page_size];

    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);
    sql_result.forEach(item => {
        if (item.address_info) {
            item.address_info = JSON.parse(item.address_info);
        }
    });

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
};

/**
 * 修改分仓
*/
user.updateBucket = async (req, res) => {
  let token_info = await base.checkAdminToken(req);
  if (token_info.res_code < 0) {
      res.send(token_info);
      return;
  }
  let user_info = token_info.data;

  const {uid, bucket_id, isUpdateLevel, isUpdateGood} = req.body

  if(uid < 0 || bucket_id < 0){
    res.send(base.result_error("参数错误"));
    return
  }

  let user_result = await mysql.query('SELECT * FROM user WHERE uid = ? AND state <> -1', [uid])
  if(user_result.length <= 0) {
    res.send(base.result_error("该用户不存在"));
    return
  }
  
  let user_update_result = await mysql.query("UPDATE user SET bucket_id = ? WHERE uid = ?", [bucket_id, uid])
  
  if(user_update_result.affectedRows > 0){
    if (!isUpdateLevel && !isUpdateGood) {
        res.send(base.result_ok("分仓修改成功"));
        return
      }
    const uidArr = await user.selectAllLevelUser(uid ,[])
    if(uidArr.length > 0){
      if(isUpdateLevel && isUpdateLevel === 1){
        let leve_update_result = await mysql.query(`UPDATE user SET bucket_id = ? WHERE uid in (${uidArr.join(',')})`, [bucket_id])
        if(leve_update_result.affectedRows <= 0){
          res.send(base.result_error("分仓修改失败"));
          return
        }
      }
  
      if(isUpdateGood && isUpdateGood === 1){
        let goods_update_result = await mysql.query(`UPDATE goods_rush SET bucket_id = ? WHERE belong in (${uidArr.join(',')})`, [bucket_id])
        if(goods_update_result.affectedRows <= 0){
          res.send(base.result_error("分仓修改失败"));
          return
        }
      }
    }
    res.send(base.result_ok("分仓修改成功"));
    return
  }
}

// ---- private ----
/**
 * 获取所有相关订单
 */
user.getRelateOrders = async (limit, size, uid, state = -2) => {
    let sql = `SELECT a.*,b.avatar buyer_avatar,b.nickname buyer_nickname,b.phone buyer_phone,b.payee_name buyer_payeename,b.payee_bankname buyer_bankname,b.payee_bankno buyer_bankno,b.wxpay_img buyer_wxpay_img,b.alipay_img buyer_alipay_img,
    c.avatar saler_avatar,c.nickname saler_nickname,c.phone saler_phone,c.payee_name saler_payeename,c.payee_bankname saler_bankname,c.payee_bankno saler_bankno,c.wxpay_img saler_wxpay_img,c.alipay_img saler_alipay_img,
    d.name goods_name,d.img goods_img,b.bucket_id,e.bucket_name,e.admin_uid  
    FROM user_order a 
    LEFT JOIN user b ON a.uid=b.uid 
    LEFT JOIN user c ON a.saler_id=c.uid 
    LEFT JOIN goods_rush d ON d.gid=a.gid 
    LEFT JOIN user_bucket e ON e.uid=b.bucket_id 
    WHERE (a.uid=? OR a.saler_id=?) AND a.state>-1 `;
    let sql_count = `SELECT COUNT(*) total_count  
    FROM user_order a 
    LEFT JOIN user b ON a.uid=b.uid 
    LEFT JOIN user c ON a.saler_id=c.uid 
    WHERE (a.uid=? OR a.saler_id=?) AND a.state>-1 `;
    let sql_params = [uid, uid];
    if (state != -2) {
        sql += " AND a.pay_state=? ";
        sql_count += " AND a.pay_state=? ";
        sql_params.push(state);
    }
    sql += " ORDER BY create_time DESC LIMIT ?,?";
    sql_params.push(limit);
    sql_params.push(size);
    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);
    let data = {
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }
    return data;
}

/**
 * 获取用户购买订单
 */
user.getBuyOrders = async (limit, size, uid, state = -2) => {
    let sql = `SELECT a.*,b.avatar buyer_avatar,b.nickname buyer_nickname,b.phone buyer_phone,b.payee_name buyer_payeename,b.payee_bankname buyer_bankname,b.payee_bankno buyer_bankno,b.wxpay_img buyer_wxpay_img,b.alipay_img buyer_alipay_img,
    c.avatar saler_avatar,c.nickname saler_nickname,c.phone saler_phone,c.payee_name saler_payeename,c.payee_bankname saler_bankname,c.payee_bankno saler_bankno,c.wxpay_img saler_wxpay_img,c.alipay_img saler_alipay_img,
    d.name goods_name,d.img goods_img,b.bucket_id,e.bucket_name,e.admin_uid 
    FROM user_order a 
    LEFT JOIN user b ON a.uid=b.uid 
    LEFT JOIN user c ON a.saler_id=c.uid 
    LEFT JOIN goods_rush d ON d.gid=a.gid 
    LEFT JOIN user_bucket e ON e.uid=b.bucket_id 
    WHERE a.uid=? AND a.state>-1 `;
    let sql_count = `SELECT COUNT(*) total_count  
    FROM user_order a 
    LEFT JOIN user b ON a.uid=b.uid 
    LEFT JOIN user c ON a.saler_id=c.uid 
    WHERE a.uid=? AND a.state>-1 `;
    let sql_params = [uid];
    if (state != -2) {
        sql += " AND a.pay_state=? ";
        sql_count += " AND a.pay_state=? ";
        sql_params.push(state);
    }
    sql += " ORDER BY create_time DESC LIMIT ?,?";
    sql_params.push(limit);
    sql_params.push(size);
    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);
    let data = {
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }
    return data;
}

/**
 * 获取用户出售订单
 */
user.getSaleOrders = async (limit, size, uid, state = -2) => {
    let sql = `SELECT a.*,b.avatar buyer_avatar,b.nickname buyer_nickname,b.phone buyer_phone,b.payee_name buyer_payeename,b.payee_bankname buyer_bankname,b.payee_bankno buyer_bankno,b.wxpay_img buyer_wxpay_img,b.alipay_img buyer_alipay_img,
    c.avatar saler_avatar,c.nickname saler_nickname,c.phone saler_phone,c.payee_name saler_payeename,c.payee_bankname saler_bankname,c.payee_bankno saler_bankno,c.wxpay_img saler_wxpay_img,c.alipay_img saler_alipay_img,
    d.name goods_name,d.img goods_img,b.bucket_id,e.bucket_name,e.admin_uid  
    FROM user_order a 
    LEFT JOIN user b ON a.uid=b.uid 
    LEFT JOIN user c ON a.saler_id=c.uid 
    LEFT JOIN goods_rush d ON d.gid=a.gid 
    LEFT JOIN user_bucket e ON e.uid=b.bucket_id 
    WHERE a.saler_id=? AND a.state>-1 `;
    let sql_count = `SELECT COUNT(*) total_count  
    FROM user_order a 
    LEFT JOIN user b ON a.uid=b.uid 
    LEFT JOIN user c ON a.saler_id=c.uid 
    WHERE a.saler_id=? AND a.state>-1 `;
    let sql_params = [uid];
    if (state != -2) {
        sql += " AND a.pay_state=? ";
        sql_count += " AND a.pay_state=? ";
        sql_params.push(state);
    }
    sql += " ORDER BY create_time DESC LIMIT ?,?";
    sql_params.push(limit);
    sql_params.push(size);
    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);
    let data = {
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }
    return data;
}

/**
 * 同步抢购
 */
user.syncRushSingle = async (gid) => {
    let data = await mysql.query("SELECT * FROM goods_rush WHERE gid=?", gid);
    await redis.Client0.hSet(`${KEYS.RUSH_GOODS}${data[0].sid}`, gid.toString(), JSON.stringify(data[0]));
    if (data[0].state == 1) {
        await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}${data[0].sid}`, gid.toString(), '1');
    } else {
        await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}${data[0].sid}`, gid.toString(), '0');
    }
};

/**
 * 递归查找用户下所有下级
*/
user.selectAllLevelUser = async(uid, uidArr) => {
  if( uid ){
    let result = await mysql.query("SELECT * FROM user WHERE level1_recommender = ?", [uid])
    if(result.length > 0){
      for(let i = 0;i<result.length;i++){
        let item = result[i]
        if(item){
          uidArr.push( item.uid )
          await user.selectAllLevelUser(item.uid, uidArr)
        }
      }
    }
    return uidArr
  }
}

module.exports = user;