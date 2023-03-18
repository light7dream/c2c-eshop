let user = {};

let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let redis = require('../redis');
let KEYS = require('../redis_key');
const { getAllUsers, getRecommendLinks,getRecursionUids_v2 } = require('./utils')
/**
 * 获取用户
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
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
    a.edit_bank_access,a.has_read_protocol,
    a.qrcode,a.sign,a.state,a.bad,a.level1_recommender,b.phone recommender_phone,b.nickname recommender_nickname 
    FROM user a 
    LEFT JOIN user b ON a.level1_recommender=b.uid
    WHERE a.uid<>0 `;
    let sql_count = `SELECT COUNT(*) total_count FROM user WHERE uid<>0 `;
    let sql_params = [];

    if (user_info.isbucket) {
        let members = user_info.members;
        if (members.length == 0) {
            members = [0];
        }
        sql += " AND a.uid IN (?) ";
        sql_count += " AND uid IN (?) ";
        sql_params.push(members);
    }

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
 * 重置用户密码
 * @param {*} req 
 * @param {*} res 
 */
user.resetPwd = async (req, res) => {
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

    let pwd = req.body.pwd;
    if (!pwd) {
        res.send(base.result_error("密码不能为空"));
        return;
    }

    let pwdMd5 = base.md5Pwd(pwd);
    let token = "admin reset token";

    let sql = `UPDATE user SET pwd_md5=?,token=? WHERE uid=?`;
    let sql_params = [pwdMd5, token, uid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        res.send(base.result_ok("重置成功"));
        return;
    } else {
        res.send(base.result_warning("重置成功"));
        return;
    }
}

/**
 * 恢复账号 启用
 * @param {*} req 
 * @param {*} res 
 */
user.free = async (req, res) => {
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

    let sql = `UPDATE user SET state=1 WHERE uid=?`;
    let sql_params = [uid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        res.send(base.result_ok("操作成功"));
        return;
    } else {
        res.send(base.result_warning("操作异常"));
        return;
    }
}

/**
 * 禁用账号
 * @param {*} req 
 * @param {*} res 
 */
user.forbidden = async (req, res) => {
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

    if (uid == user_info.uid) {
        res.send(base.result_error("管理员不能放弃自己,大人慎重"));
        return;
    }

    let sql = `UPDATE user SET state=0 WHERE uid=?`;
    let sql_params = [uid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        res.send(base.result_ok("操作成功"));
        // 信息更新到redis
        await base.updateUserInfo(uid);
        return;
    } else {
        res.send(base.result_warning("操作异常"));
        return;
    }
}

/**
 * 删除用户【2】
 * @param {*} req 
 * @param {*} res 
 */
user.delete = async (req, res) => {
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

    if (uid == user_info.uid) {
        res.send(base.result_error("管理员不能自宫,大人慎重"));
        return;
    }

    let sql = `UPDATE user SET state=-1 WHERE uid=?`;
    let sql_params = [uid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        res.send(base.result_ok("删除成功"));
        // 信息更新到redis
        await base.updateUserInfo(uid);
        return;
    } else {
        res.send(base.result_warning("删除异常"));
        return;
    }
}

/**
 * 设置管理员
 * @param {*} req 
 * @param {*} res 
 */
user.setAdminUser = async (req, res) => {
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

    if (uid == user_info.uid) {
        res.send(base.result_error("管理员不能设置自己的管理员权限，请联系其他管理员吧"));
        return;
    }

    let sql = `SELECT * from user WHERE uid=? `
    let targetUsers = await mysql.query(sql, [uid])
    let existsRoles = (targetUsers && targetUsers[0] && targetUsers[0].roles && JSON.parse(targetUsers[0].roles)) || []
    if (existsRoles.includes(1)) {
        // return res.send(base.result_ok("用户已经是管理员了，无需重新设置"));
        return res.send(base.result_ok("操作成功"));
    }
    existsRoles.push(1)
    sql = `UPDATE user SET roles='[${existsRoles.join(',')}]' WHERE uid=?`;
    let sql_params = [uid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        res.send(base.result_ok("操作成功"));
        // 信息更新到redis
        await base.updateUserInfo(uid);
        // 信息更新到redis
        await base.updateUserInfo(uid, true);
        return;
    } else {
        res.send(base.result_warning("操作异常"));
        return;
    }
}

/**
 * 取消管理员
 * @param {*} req 
 * @param {*} res 
 */
user.removeAdminUser = async (req, res) => {
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

    if (uid == user_info.uid) {
        res.send(base.result_error("管理员不能取消自己的管理员权限，请联系其他管理员吧"));
        return;
    }

    let sql = `SELECT * from user WHERE uid=? `
    let targetUsers = await mysql.query(sql, [uid])
    let existsRoles = (targetUsers && targetUsers[0] && targetUsers[0].roles && JSON.parse(targetUsers[0].roles)) || []
    if (!existsRoles.includes(1)) {
        // return res.send(base.result_ok("该用户不是管理员"));
        return res.send(base.result_ok("操作成功"));
    }
    // 预防数据中被重复设置多个1的问题
    existsRoles = existsRoles.filter(v => v !== 1)
    sql = `UPDATE user SET roles='[${existsRoles.join(',')}]' WHERE uid=?`;
    let sql_params = [uid];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.affectedRows > 0) {
        // 信息更新到redis
        await base.updateUserInfo(uid);
        // 信息更新到redis
        await base.updateUserInfo(uid, true);
        res.send(base.result_ok("操作成功"));
        return;
    } else {
        res.send(base.result_warning("操作异常"));
        return;
    }
}

/**
 * 设置用户修改银行卡信息权限【2】
 * @param {*} req 
 * @param {*} res 
 */
user.setUserEditBankAccess = async (req, res) => {
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

    let access = parseInt(req.body.access);
    if (access != 0 && access != 1) {
        res.send(base.result_error("access参数错误"));
        return;
    }

    let sql = `UPDATE user SET edit_bank_access=? WHERE uid=?`;
    let sql_params = [access, uid];
    let sql_result = await mysql.query(sql, sql_params);
    // 信息更新到redis
    await base.updateUserInfo(uid);
    res.send(base.result_ok("设置成功", access));
    return;
}

/**
 * 设置恶意用户【2】
 * @param {*} req 
 * @param {*} res 
 */
user.setBadUser = async (req, res) => {
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

    let isbad = parseInt(req.body.isbad);
    if (isbad != 0 && isbad != 1) {
        res.send(base.result_error("状态参数错误"));
        return;
    }

    let sql = `UPDATE user SET bad=? WHERE uid=?`;
    let sql_params = [isbad, uid];
    let sql_result = await mysql.query(sql, sql_params);
    // 信息更新到redis
    await base.updateUserInfo(uid);
    base.logAdmin(user_info.uid, '设置恶意用户', `uid:${uid};isbad:${isbad}`);
    res.send(base.result_ok("设置成功", isbad));
    return;
}

/**
 * 设置用户推荐人【2】
 * @param {*} req 
 * @param {*} res 
 */
user.setUserRecommender = async (req, res) => {
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

    let recommender_id = parseInt(req.body.recommender_id);
    if (!(recommender_id > 0)) {
        res.send(base.result_error("推荐人id错误"));
        return;
    }
    // 是否要设置推荐路径? 暂不设置
    let sql = `UPDATE user a INNER JOIN user b ON a.uid=? AND b.uid=? SET a.level1_recommender=b.uid,a.level2_recommender=b.level1_recommender`;
    let sql_params = [uid, recommender_id];
    let sql_result = await mysql.query(sql, sql_params);

    let sql_firstStepFance = `SELECT uid FROM user WHERE level1_recommender =? `;
    let firstStepFance = await mysql.query(sql_firstStepFance, [uid]);
    if (firstStepFance.length > 0) {
        sql_firstStepFance = `UPDATE user SET level2_recommender =?  WHERE uid IN (${firstStepFance.map((v) => v.uid).join(',')})`;
        await mysql.query(sql_firstStepFance, [recommender_id]);
    }

    sql = `SELECT uid, nickname, level1_recommender, level2_recommender, roles FROM user WHERE state > -1`
    let users = await mysql.query(sql, [])
    let uids = [uid]
    // 递归获取当前用户相关的所有粉丝和二级粉丝
    getRecursionUids_v2(uids, users)
    sql = `SELECT bucket_id FROM user WHERE uid=? `;
    let res_bucket_id = await mysql.query(sql, [recommender_id]);
    if (res_bucket_id.length > 0) {
        sql = `UPDATE user SET bucket_id = ${res_bucket_id.map((v) => v.bucket_id)}  WHERE uid IN(?)  `;
        await mysql.query(sql, [uids]);
      }

    // 信息更新到redis
    await base.updateUserInfo(uid);
    base.logAdmin(user_info.uid, '设置用户推荐人', `uid:${uid};recommender_id:${recommender_id}`);
    base.logAdmin(user_info.uid, '设置用户粉丝二级推荐人', `uid:${firstStepFance.map((v) => v.uid).join(',')};level2_recommender_id:${recommender_id}`);
    base.logAdmin(user_info.uid, '设置用户分仓与推荐人一致', `uid:${uids};bucket_id: ${res_bucket_id.map((v) => v.bucket_id)}`);
    res.send(base.result_ok("设置成功"));
    return;
}

/**
 * 恢复账号
 * @param {*} req 
 * @param {*} res 
 */
 user.resetUser = async (req, res) => {
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

  let sql = `UPDATE user SET state=1, token="",admin_token="", open_id="" WHERE uid=?`;
  let sql_params = [uid];
  let sql_result = await mysql.query(sql, sql_params);
  if (sql_result.affectedRows > 0) {
      await redis.Client1.del(`${KEYS.ADMIN_TOKEN}${uid}`);
      await redis.Client1.del(`${KEYS.TOKEN}${uid}`);
      res.send(base.result_ok("操作成功"));
      return;
  } else {
      res.send(base.result_warning("操作异常"));
      return;
  }
}

/**
 * 彻底删除
 * @param {*} req 
 * @param {*} res 
 */
 user.deleteDeep = async (req, res) => {
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

  let sql = `DELETE FROM user WHERE uid=?`;
  let sql_params = [uid];
  let sql_result = await mysql.query(sql, sql_params);
  if (sql_result.affectedRows > 0) {
      res.send(base.result_ok("操作成功"));
      return;
  } else {
      res.send(base.result_warning("操作异常"));
      return;
  }
}

/**
 * 获取用户相关订单【2】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// TODO:v2
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
 * 获取纠纷订单【2】
 */
// TODO:v2
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

    // 如果分仓管理员
    if (user_info.isbucket) {
        let members = user_info.members;
        if (members.length == 0) {
            members = [0];
        }
        let sql = `SELECT a.*,b.order_id,b.order_no,b.dispute,c.nickname belong_nickname,c.avatar belong_avatar,c.phone belong_phone,
        c.payee_name belong_payee_name,c.payee_bankno belong_bankno,c.payee_bankname belong_payee_bankname,c.wxpay_img belong_wxpay_img,c.alipay_img belong_alipay_img,
        d.nickname rusher_nickname,d.avatar rusher_avatar,d.phone rusher_phone,
        d.payee_name rusher_payee_name,d.payee_bankno rusher_bankno,d.payee_bankname rusher_payee_bankname,d.wxpay_img rusher_wxpay_img,d.alipay_img rusher_alipay_img
        FROM goods_rush a 
        LEFT JOIN user_order b ON a.current_order_id=b.order_id 
        LEFT JOIN user c ON c.uid=a.belong 
        LEFT JOIN user d ON d.uid=a.rusher_id 
        WHERE a.state=5 AND a.belong IN (?)  
        ORDER BY a.update_time ASC 
        LIMIT ?,?`;
        let sql_count = "SELECT COUNT(*) total_count FROM goods_rush WHERE state=5 AND belong IN (?) ";
        let sql_params = [members, limit, page_size];

        let sql_result = await mysql.query(sql, sql_params);
        let sql_count_result = await mysql.query(sql_count, sql_params);

        let data = {
            page_index,
            page_size,
            total_count: sql_count_result[0].total_count,
            list: sql_result
        }

        res.send(base.result_ok("ok", data));
    } else {
        let sql = `SELECT a.*,b.order_id,b.order_no,b.dispute,c.nickname belong_nickname,c.avatar belong_avatar,c.phone belong_phone,
        c.payee_name belong_payee_name,c.payee_bankno belong_bankno,c.payee_bankname belong_payee_bankname,c.wxpay_img belong_wxpay_img,c.alipay_img belong_alipay_img,
        d.nickname rusher_nickname,d.avatar rusher_avatar,d.phone rusher_phone,
        d.payee_name rusher_payee_name,d.payee_bankno rusher_bankno,d.payee_bankname rusher_payee_bankname,d.wxpay_img rusher_wxpay_img,d.alipay_img rusher_alipay_img 
        FROM goods_rush a 
        LEFT JOIN user_order b ON a.current_order_id=b.order_id 
        LEFT JOIN user c ON c.uid=a.belong 
        LEFT JOIN user d ON d.uid=a.rusher_id 
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
    }
};

/**
 * 获取提货订单【2】
 */
// TODO:v2
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

    // 如果分仓管理员
    if (user_info.isbucket) {
        let members = user_info.members;
        if (members.length == 0) {
            members = [0];
        }
        let sql = `SELECT a.*,b.order_id,b.order_no,c.nickname belong_nickname,b.address_info,c.avatar belong_avatar,c.phone belong_phone,
        c.payee_name belong_payee_name,c.payee_bankno belong_bankno,c.payee_bankname belong_payee_bankname,c.wxpay_img belong_wxpay_img,c.alipay_img belong_alipay_img,
        d.parcel parcel_info  
        FROM goods_rush a 
        LEFT JOIN user_order b ON a.current_order_id=b.order_id 
        LEFT JOIN user c ON c.uid=a.belong 
        LEFT JOIN user_parcel d ON d.order_id=a.current_order_id AND d.order_from=2 
        WHERE a.state IN (6,7) AND a.belong IN (?)  
        ORDER BY a.update_time ASC 
        LIMIT ?,?`;
        let sql_count = "SELECT COUNT(*) total_count FROM goods_rush WHERE state IN (6,7) AND belong IN (?)";
        let sql_params = [members, limit, page_size];

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
    } else {
        let sql = `SELECT a.*,b.order_id,b.order_no,c.nickname belong_nickname,b.address_info,c.avatar belong_avatar,c.phone belong_phone,
        c.payee_name belong_payee_name,c.payee_bankno belong_bankno,c.payee_bankname belong_payee_bankname,c.wxpay_img belong_wxpay_img,c.alipay_img belong_alipay_img,
        d.parcel parcel_info  
        FROM goods_rush a 
        LEFT JOIN user_order b ON a.current_order_id=b.order_id 
        LEFT JOIN user c ON c.uid=a.belong 
        LEFT JOIN user_parcel d ON d.order_id=a.current_order_id AND d.order_from=2 
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
    }
};

/**
 * 获取商城订单【2】
 */
// TODO:v2
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

    // 如果分仓管理员
    if (user_info.isbucket) {
        let members = user_info.members;
        if (members.length == 0) {
            members = [0];
        }
        let sql = `SELECT a.*,c.nickname buyer_nickname,c.avatar buyer_avatar,c.phone buyer_phone,
        d.parcel parcel_info  
        FROM user_order_shelves a 
        LEFT JOIN user c ON c.uid=a.uid 
        LEFT JOIN user_parcel d ON d.order_id=a.order_id AND d.order_from=1 
        WHERE a.state=1 AND a.pay_state=1 AND a.uid IN (?)   
        ORDER BY a.update_time ASC 
        LIMIT ?,?`;
        let sql_count = "SELECT COUNT(*) total_count FROM user_order_shelves WHERE state=1 AND pay_state=1 AND uid IN (?)";
        let sql_params = [members, limit, page_size];

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
    } else {
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
    }
};


/**
 * 设置抢购订单信息【2】
 */
// TODO:v2
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

            let schedulelist = await mysql.query("SELECT * FROM goods_rush_schedule_map WHERE gid=?", [order_info.gid]);

            if (schedulelist.length > 0) {
                schedulelist = schedulelist.map(item => {
                    return item.sid;
                });
                let gdata = await mysql.query(`SELECT a.*,b.nickname belong_name,b.avatar belong_avatar FROM goods_rush a LEFT JOIN user b ON a.belong=b.uid WHERE a.gid=?`, [order_info.gid]);
                await user.syncRush();
            }
        }

        base.logAdmin(user_info.uid, '设置抢购订单信息', `order_id:${order_id};state:${state}`);
        res.send(base.result_ok("已处理"));
        return;
    }

    res.send(base.result_error("状态信息错误"));
};

/**
 * 设置首页货架订单信息【2】
 */
user.setShelvesOrderInfo = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
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
    let order_info = await mysql.query("SELECT * FROM user_order_shelves WHERE order_id=?", [order_id]);
    if (order_info.length == 0) {
        res.send(base.result_error("没有找到相关订单"));
        return;
    }
    order_info = order_info[0];

    let parcel_info = req.body.parcel_info;
    if (!parcel_info) {
        parcel_info = "";
    }

    let parcel = await mysql.query("SELECT * FROM user_parcel WHERE order_id=? AND order_from=1", [order_id]);
    if (parcel.length > 0) {
        await mysql.query("UPDATE user_parcel SET parcel=?,state=1 WHERE id=?", [parcel_info, parcel[0].id]);
    } else {
        await mysql.query("INSERT INTO user_parcel (uid,order_id,order_from,parcel,parcel_state) VALUES (?,?,?,?,?)", [order_info.uid, order_id, 1, parcel_info, 1]);
    }

    res.send(base.result_ok("已设置"));
    return;
};



/**
 * 获取所属用户抢购商品【2】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getBelongUserRushGoods = async (req, res) => {
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

    let sql = `SELECT a.*,b.name,b.code,b.img,c.nickname last_belong_nickname,c.avatar last_belong_avatar,c.phone last_belong_phone,
    c.payee_name last_belong_payee_name,c.payee_bankname last_belong_payee_bankname,c.payee_bankno last_belong_payee_bankno,c.wxpay_img last_belong_wxpay_img,c.alipay_img last_belong_alipay_img,
    d.nickname rusher_nickname,d.avatar rusher_avatar,d.phone rusher_phone,d.payee_name rusher_payee_name,d.payee_bankname rusher_payee_bankname,
    d.payee_bankno rusher_payee_bankno,d.wxpay_img rusher_wxpay_img,d.alipay_img rusher_alipay_img
    FROM goods_rush a 
    LEFT JOIN goods_rush b ON a.gid=b.gid 
    LEFT JOIN user c ON c.uid=a.last_belong 
    LEFT JOIN user d ON d.uid=a.rusher_id 
    WHERE a.belong=? ORDER BY gid ASC LIMIT ?,?`;
    let sql_count = `SELECT COUNT(*) total_count FROM goods_rush WHERE belong=?`;
    let sql_params = [uid, limit, page_size];

    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }
    res.send(base.result_ok("ok", data));
    return;
}

/**
 * 查看订单支付截图
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.viewOrderPayImg = async (req, res) => {
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

    let order_id = parseInt(req.body.order_id);
    if (!(order_id > 0)) {
        res.send(base.result_error("订单id错误"));
        return;
    }

    let data = await mysql.query("SELECT * FROM user_order_payimg WHERE order_id=? AND uid=?", [order_id, uid]);
    res.send(base.result_ok('ok', data));
    return;
}

/**
 * 获取提现申请列表
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getWithdrawalList = async (req, res) => {
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

    let state = parseInt(req.body.state);
    if (state != -1 && state != 0 && state != 1) {
        state = 0;
    }

    let sql = `SELECT a.*,b.nickname,b.phone,b.avatar,b.payee_name,b.payee_bankno,b.payee_bankname,b.wxpay_img,b.alipay_img 
    FROM user_withdrawal a 
    LEFT JOIN user b ON a.uid=b.uid 
    WHERE a.state=? 
    ORDER BY a.id ASC 
    LIMIT ?,?`;
    let sql_count = `SELECT COUNT(*) total_count  
    FROM user_withdrawal a 
    WHERE a.state=?`;

    let sql_params = [state, limit, page_size];
    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);

    let topUserStatics = {}

    const users = await getAllUsers()

    sql_result.forEach((result) => {
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

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
    return;
}

/**
 * 获取指定用户提现申请列表
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getUserWithdrawalList = async (req, res) => {
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

    let sql = `SELECT a.*,b.nickname,b.phone,b.avatar,b.payee_name,b.payee_bankno,b.payee_bankname,b.wxpay_img,b.alipay_img 
    FROM user_withdrawal a 
    LEFT JOIN user b ON a.uid=b.uid 
    WHERE a.uid=? 
    ORDER BY a.create_time DESC 
    LIMIT ?,?`;
    let sql_count = `SELECT COUNT(*) totoal_count  
    FROM user_withdrawal a 
    WHERE a.uid=? `;

    let sql_params = [uid, limit, page_size];
    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);
    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
    return;
}

/**
 * 处理用户提现申请
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.ackUserWithdrawal = async (req, res) => {
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

    let withdrawal_id = parseInt(req.body.withdrawal_id);
    if (!(withdrawal_id > 0)) {
        res.send(base.result_error("提现id错误"));
        return;
    }

    let ack = parseInt(req.body.ack);
    if (ack != -1 && ack != 1) {
        res.send(base.result_error("ack参数错误"));
        return;
    }

    let ack_reason = req.body.ack_reason;
    if (!ack_reason) {
        ack_reason = "";
    }
    let record = await mysql.query("SELECT * FROM user_withdrawal WHERE id=? AND uid=?", [withdrawal_id, uid]);
    if (record.length == 0) {
        res.send(base.result_error("没有找到记录"));
        return;
    }

    record = record[0];
    let sql = `UPDATE user_withdrawal SET state=?,msg=? WHERE id=? AND uid=? AND state!=?`;
    let sql_params = [ack, ack_reason, withdrawal_id, uid, ack];
    let sql_result = await mysql.query(sql, sql_params);

    if (sql_result.affectedRows > 0) {
        if (ack == 1) {
            // 更新已提现数据
            await mysql.query("UPDATE user_income SET withdrawal=withdrawal+? WHERE uid=?", [record.amount, uid]);
        } else if (ack == -1) {
            // 更新可提现数据
            await mysql.query("UPDATE user_income SET income=income+? WHERE uid=?", [record.amount, uid]);
        }
    }

    base.logAdmin(user_info.uid, '处理用户提现申请', `uid:${uid};ack:${ack};ack_reason:${ack_reason}`);
    res.send(base.result_ok("处理成功"));
    return;
}

/**
 * 获取可选的推荐人列表
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getRecommenders = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let uid = parseInt(req.body.uid);
    let searchkey = req.body.searchkey;
    if (searchkey == undefined) {
        searchkey = '';
    }


    let sql = `SELECT uid,nickname,phone FROM user WHERE state=1 AND bad=0 AND (nickname LIKE ? OR phone LIKE ?) `;
    let sql_params = [`%${searchkey}%`, `%${searchkey}%`];
    if (uid > 0) {
        sql += " AND uid<>? ";
        sql_params.push(uid);
    }

    let list = await mysql.query(sql, sql_params);
    res.send(base.result_ok('ok', list));
    return;
}

/**
 * 获取推荐树
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getRecommenderTree = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let alluser = await mysql.query("SELECT uid,nickname,avatar,phone,state,level1_recommender,level2_recommender FROM user WHERE state > -1", []);

    res.send(base.result_ok('ok', alluser));
    return;
}

/**
 * 获取推荐树
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getRecommenderTree_old = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let alluser = await mysql.query("SELECT uid,nickname,avatar,phone,state,level1_recommender,level2_recommender FROM user WHERE state > -1", []);

    // 查找顶级用户
    let topuser = alluser.filter(u => {
        return u.level1_recommender == 0 && u.level2_recommender == 0;
    });

    // 剩余用户
    let remianuser = alluser.filter(u => {
        return u.level1_recommender != 0;
    });

    // 生成树
    function createTree(left) {
        left.forEach(father => {
            if (remianuser.length == 0) {
                father.list = [];
            } else {
                let children = remianuser.filter(child => {
                    return father.uid == child.level1_recommender;
                });
                remianuser = remianuser.filter(child => {
                    return father.uid != child.level1_recommender;
                });

                children = createTree(children);
                father.list = children;
            }

        });

        return left;
    }

    createTree(topuser, remianuser);

    res.send(base.result_ok('ok', {
        tree: topuser,
        err: remianuser
    }));
    return;
}

/**
 * 获取用户粉丝列表
 * @param {*} req 
 * @param {*} res 
 */
user.getUserFansList = async (req, res) => {
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

    let sql = `SELECT uid,nickname,avatar,phone,level1_recommender,level2_recommender,create_time FROM user `;
    let sql_count = "SELECT COUNT(*) total_count FROM user ";

    sql += "WHERE level1_recommender=? OR level2_recommender=? LIMIT ?,?";
    sql_count += "WHERE level1_recommender=? OR level2_recommender=? ";

    let sql_params = [uid, uid, limit, page_size];
    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, [uid, uid]);

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result.map(item => {
            if (item.level1_recommender == uid) {
                item.level = 1;
            } else if (item.level2_recommender == uid) {
                item.level = 2;
            }
            delete item.level1_recommender;
            delete item.level2_recommender;
            return item;
        })
    }

    res.send(base.result_ok("ok", data));
    return;
};


/**
 * 获取用指定粉丝订单
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getUserFansOrder = async (req, res) => {
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

    let sql = `SELECT a.uid,a.order_id,a.order_no,b.fans_level level,b.income,b.rate,a.pay_state,
    c.nickname buyer_nickname,c.avatar buyer_avatar,c.phone buyer_phone,c.payee_name buyer_payeename,c.payee_bankno buyer_bankno,c.payee_bankname buyer_bankname,c.wxpay_img buyer_wxpay_img,c.alipay_img buyer_alipay_img,
    a.g_price,e.nickname saler_nickname,e.phone saler_phone,e.payee_name saler_payeename,e.payee_bankno saler_bankno,e.payee_bankname saler_bankname,e.wxpay_img saler_wxpay_img,e.alipay_img saler_alipay_img,
    d.name goods_name,d.code,a.g_price real_price,d.img goods_img,d.create_time  
    FROM user_order a 
    LEFT JOIN user_income_record b ON b.order_id=a.order_id 
    LEFT JOIN user c ON c.uid=a.uid 
    LEFT JOIN goods_rush d ON d.gid=a.gid 
    LEFT JOIN user e ON e.uid=a.saler_id 
    WHERE a.uid=? AND a.state=1 AND a.pay_state>-1  
    ORDER BY b.id ASC 
    LIMIT ?,?`;

    let sql_count = `SELECT COUNT(*) total_count  
    FROM user_order a 
    WHERE a.uid=? AND a.state=1 AND a.pay_state>-1 `;
    let sql_params = [uid, limit, page_size];
    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);
    let list = sql_result;
    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: list
    }

    res.send(base.result_ok("ok", data));
    return;
};


// --- private ---
/**
 * 获取所有相关订单
 */
// TODO:v2
user.getRelateOrders = async (limit, size, uid, state = -2) => {
    let sql = `SELECT a.*,b.avatar buyer_avatar,b.nickname buyer_nickname,b.phone buyer_phone,b.payee_name buyer_payeename,b.payee_bankname buyer_bankname,b.payee_bankno buyer_bankno,b.wxpay_img buyer_wxpay_img,b.alipay_img buyer_alipay_img,
    c.avatar saler_avatar,c.nickname saler_nickname,c.phone saler_phone,c.payee_name saler_payeename,c.payee_bankname saler_bankname,c.payee_bankno saler_bankno,c.wxpay_img saler_wxpay_img,c.alipay_img saler_alipay_img,
    d.name goods_name,d.img goods_img 
    FROM user_order a 
    LEFT JOIN user b ON a.uid=b.uid 
    LEFT JOIN user c ON a.saler_id=c.uid 
    LEFT JOIN goods_rush d ON d.gid=a.gid 
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
    let sql = `SELECT a.*,b.avatar buyer_avatar,b.nickname buyer_nickname,b.phone buyer_phone,b.payee_name buyer_payeename,b.payee_bankname buyer_bankname,b.payee_bankno buyer_bankno,
    c.avatar saler_avatar,c.nickname saler_nickname,c.phone saler_phone,c.payee_name saler_payeename,c.payee_bankname saler_bankname,c.payee_bankno saler_bankno,
    d.name goods_name,d.img goods_img 
    FROM user_order a 
    LEFT JOIN user b ON a.uid=b.uid 
    LEFT JOIN user c ON a.saler_id=c.uid 
    LEFT JOIN goods_rush d ON d.gid=a.gid 
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
// TODO:v2
user.getSaleOrders = async (limit, size, uid, state = -2) => {
    let sql = `SELECT a.*,b.avatar buyer_avatar,b.nickname buyer_nickname,b.phone buyer_phone,b.payee_name buyer_payeename,b.payee_bankname buyer_bankname,b.payee_bankno buyer_bankno,b.wxpay_img buyer_wxpay_img,b.alipay_img buyer_alipay_img,
    c.avatar saler_avatar,c.nickname saler_nickname,c.phone saler_phone,c.payee_name saler_payeename,c.payee_bankname saler_bankname,c.payee_bankno saler_bankno,c.wxpay_img saler_wxpay_img,c.alipay_img saler_alipay_img,
    d.name goods_name,d.img goods_img 
    FROM user_order a 
    LEFT JOIN user b ON a.uid=b.uid 
    LEFT JOIN user c ON a.saler_id=c.uid 
    LEFT JOIN goods_rush d ON d.gid=a.gid 
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
 * 获取所有总经销，或者按管理员ID获取总经销
 */
user.getTopFuns = async (req, res) => {
    let uid = req.body.uid
    let sql = `SELECT uid, nickname, level1_recommender, level2_recommender, roles FROM user WHERE state > -1 AND roles LIKE '%1%'`
    if (uid) {
        sql += ` AND uid=${uid} `
    }
    let users = await mysql.query(sql, [])
    const level1Uids = users.map(v => v.uid)
    sql = `SELECT uid, nickname, phone, level1_recommender, level2_recommender, roles FROM user WHERE state > -1 AND level1_recommender IN (${level1Uids.join(',')}) AND roles NOT LIKE '%1%'`

    let sql_result = await mysql.query(sql, []);
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

    res.send(base.result_ok("ok", sql_result));
    return;
}

// ---- private ----

/**
 * 同步抢购
 */
// TODO:v2
user.syncRush = async () => {
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
module.exports = user;