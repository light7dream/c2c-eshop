let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let redis = require('../redis');
let KEYS = require('../redis_key');

let user_bucket = {};

/**
 * 创建分仓
 * @param {*} req 
 * @param {*} res 
 */
user_bucket.createBucket = async (req, res) => {
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

    let bucket_name = req.body.bucket_name;
    if (!bucket_name) {
        bucket_name = '';
    }

    // let admin_uid = req.body.admin_uid;
    // if (!(admin_uid > 0)) {
    //     admin_uid = 0;
    // }

    let users = await mysql.query("SELECT uid,level1_recommender,level2_recommender FROM user WHERE uid>=?", [uid]);

    let members = [uid];
    let length = 1;
    function getMembers() {
        for (let i = 0; i < users.length; i++) {
            if (members.indexOf(users[i].level1_recommender) > -1 || members.indexOf(users[i].level2_recommender) > -1) {
                members.push(users[i].uid);
                users.splice(i--, 1);
            }
        }

        if (members.length > length) {
            length = members.length;
            getMembers();
        }
    }
    getMembers();
    members = Array.from(new Set(members));
    try {
        let sql = "INSERT INTO user_bucket (uid,bucket_name,admin_uid,members) VALUES (?,?,?,?)";
        let sql_result = await mysql.query(sql, [uid, bucket_name, uid, JSON.stringify(members)]);
        await mysql.query("UPDATE user SET bucket_id=? WHERE uid IN (?)", [uid, members]);

        // 更新管理员roles
        await user_bucket.updateAdminRole([1, 2], uid);
        await base.updateAllUserInfo(members);
        await base.updateUserInfo(uid, true);
        res.send(base.result_ok('创建成功'))
    } catch (err) {
        res.send(base.result_error('创建失败或分仓已存在', err))
    }
};


/**
 * 删除分仓
 * @param {*} req 
 * @param {*} res 
 */
user_bucket.deleteBucket = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let bucket_id = parseInt(req.body.bucket_id);
    if (!(bucket_id > 0)) {
        res.send(base.result_error("分仓id错误"));
        return;
    }
    let members = await mysql.query("SELECT * FROM user WHERE bucket_id=?", [bucket_id]);
    members = members.map(m => {
        return m.uid;
    });
    let sql = "DELETE FROM user_bucket WHERE uid=?";
    let sql_result = await mysql.query(sql, [bucket_id]);
    await mysql.query("UPDATE user SET bucket_id=0 WHERE bucket_id=?", [bucket_id]);
    await user_bucket.updateAdminRole([1], bucket_id);
    await base.updateUserInfo(bucket_id, true);
    await redis.Client2.del(`${KEYS.BUCKET_GOODS_LIST}${bucket_id}`);
    await base.updateAllUserInfo(members);
    res.send(base.result_ok('删除成功'));
};

/**
 * 分仓获取分仓成员
 * @param {*} req 
 * @param {*} res 
 */
user_bucket.getBucketMembers = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;


    let bucket_id = parseInt(req.body.bucket_id);
    if (!(bucket_id > 0)) {
        res.send(base.result_error("分仓id错误"));
        return;
    }


    let bucket = await mysql.query("SELECT * FROM user_bucket WHERE uid=?", [bucket_id]);

    if (bucket.length == 0) {
        res.send(base.result_ok('ok', []))
        return;
    }

    let members = JSON.parse(bucket[0].members);
    let sql = "SELECT avatar,nickname,phone,payee_name,payee_bankno,payee_bankname,wxpay_img,alipay_img FROM user WHERE uid in (?)";
    let sql_result = await mysql.query(sql, [members]);

    res.send(base.result_ok('ok', sql_result))
    return;

};

/**
 * 获取分仓列表
 * @param {*} req 
 * @param {*} res 
 */
user_bucket.getBucketList = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT a.*,b.nickname admin_nickname,b.phone admin_phone 
    FROM user_bucket a 
    LEFT JOIN user b ON a.admin_uid=b.uid `;

    let sql_result = await mysql.query(sql, []);
    res.send(base.result_ok("ok", sql_result));
    return;
};

/**
 * 设置分仓管理员
 * @param {*} req 
 * @param {*} res 
 */
user_bucket.setBucketAdmin = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let bucket_id = parseInt(req.body.bucket_id);
    if (!(bucket_id > 0)) {
        res.send(base.result_error("分仓id错误"));
        return;
    }

    let admin_uid = parseInt(req.body.admin_uid);
    if (!(admin_uid > 0)) {
        res.send(base.result_error("管理员id错误"));
        return;
    }

    await user_bucket.updateAdminRole([1, 2], admin_uid);

    let sql = "UPDATE user_bucket SET admin_uid=? WHERE uid=?";
    let sql_result = await mysql.query(sql, [admin_uid, bucket_id]);
    res.send(base.result_ok('ok'))
};

/**
 * 设置/取消管理员
 * @param {*} req 
 * @param {*} res 
 */
user_bucket.setAdmin = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;

    let isadmin = parseInt(req.body.isadmin);
    if (isadmin != 0 && isadmin != 1) {
        res.send(base.result_error("isadmin参数错误"));
        return;
    }

    let uid = parseInt(req.body.uid);
    if (!(uid > 0)) {
        res.send(base.result_error("用户id错误"));
        return;
    }

    let roles = [];
    if (isadmin == 1) {
        roles.push(1);
    }
    await user_bucket.updateAdminRole(roles, uid);

    res.send(base.result_ok('ok'))
};

/**
 * 获取管理员列表
 * @param {*} req 
 * @param {*} res 
 */
user_bucket.getAdminUserList = async (req, res) => {
    let token_info = await base.checkAdminToken(req);
    if (token_info.res_code < 0 || token_info.data.roles.indexOf(1) == -1) {
        res.send(base.result_error("登录失败"));
        return;
    }
    let user_info = token_info.data;


    let sql = `SELECT a.uid,a.nickname,a.avatar,a.phone,a.bucket_id,b.bucket_name 
    FROM user a 
    LEFT JOIN user_bucket b ON a.uid=b.admin_uid 
    WHERE a.roles=? AND a.state > -1`;
    let sql_result = await mysql.query(sql, [JSON.stringify([1])]);
    res.send(base.result_ok('ok', sql_result))
};


// ---- private ----
/**
 * 更新管理员权限
 * @param {*} roles 
 * @param {*} uid 
 */
user_bucket.updateAdminRole = async (roles, uid) => {
    try {
        await mysql.query("UPDATE user SET roles=? WHERE uid=?", [JSON.stringify(roles), uid]);
    } catch (err) {
        console.log(err);
    }
};

module.exports = user_bucket;