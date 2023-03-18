let user = {};
let config = require('../../package.json').config;
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let qr_code = require('../qr_code');
let recommender = require('./recommender');
let sms = require('./sms');
let redis = require('../redis');
let KEYS = require('../redis_key');
const { env } = require('process')

/**
 * 检查注册信息
 * @param {*} req 
 * @param {*} res 
 */
user.checkInfo = async (req, res) => {
    let nickname = req.body.nickname;
    if (!nickname) {
        res.send(base.result_error("昵称不能为空"));
        return;
    }
    nickname = nickname.replace(/\s*/g, "");
    if (!nickname) {
        res.send(base.result_error("昵称不能为空"));
        return;
    }
    let phone = req.body.phone;
    phone = phone.replace(/\s*/g, "");
    if (!phone) {
        res.send(base.result_error("手机号不能为空"));
        return;
    }

    let data = await mysql.query("SELECT * FROM user WHERE phone=?", [phone]);

    if (data.length > 0) {
        data = data[0];
        if (data.phone == phone) {
            res.send(base.result_error("手机号已被占用"));
            return;
        } else if (data.nickname == nickname) {
            res.send(base.result_error("昵称已被使用"));
            return;
        }
    }
    res.send(base.result_ok("可以注册"));
    return;
};

/**
 * 用户注册
 * @param {*} req 
 * @param {*} res 
 */
user.register = async (req, res) => {

    let nickname = req.body.nickname;
    if (nickname == null || nickname == "") {
        res.send(base.result_error("昵称不能为空"));
        return;
    }
    nickname = nickname.replace(/\s*/g, "");
    if (nickname == "") {
        res.send(base.result_error("昵称不能为空"));
        return;
    }

    let phone = req.body.phone;
    phone = phone.replace(/\s*/g, "");
    if (!phone) {
        res.send(base.result_error("手机号不能为空"));
        return;
    }
    let sms_code = req.body.sms_code;
    if (!sms_code) {
        res.send(base.result_error("请填写验证码"));
        return;
    }
    let pwd = req.body.pwd;
    if (!pwd) {
        res.send(base.result_error("密码不能为空"));
        return;
    }
    let rid = parseInt(req.body.rid);

    let sql = "SELECT * FROM user WHERE phone = ?";
    let sql_params = [phone];
    let sql_result = await mysql.query(sql, sql_params);
    if (sql_result.length > 0) {
        res.send(base.result_error("该手机号已占用"));
        return;
    }

    let open_id = req.body.open_id;
    if (!open_id) {
        open_id = "";
    }

    let check = await sms.checkSMScode(phone, sms_code);
    if (!check) {
        res.send(base.result_error("验证码不正确"));
        return;
    }

    // 获取推荐关系
    let rData = await recommender.funcGetAllLevelRecommender(rid);

    sql = `INSERT INTO user (phone,nickname,avatar,pwd_md5,recommender_path,level1_recommender,level2_recommender,edit_bank_access,bucket_id,open_id) VALUES (?,?,?,?,?,?,?,1,?,?)`;
    sql_params = [phone, nickname, "", base.md5Pwd(pwd), rData.path, rData.level1, rData.level2, rData.bucket_id, open_id];
    sql_result = await mysql.query(sql, sql_params);
    if (sql_result.insertId > 0) {
        try {
            let qr_data = `${env.register_url || config.register_url}?rid=${sql_result.insertId}`;
            // let cryptUid = base.encrypt(`${sql_result.insertId}`);
            // cryptUid = encodeURIComponent(cryptUid);
            // let qr_data = `${config.register_url}?rid=${cryptUid}`;
            let qrFileData = qr_code.createQr(qr_data);
            let result = await qr_code.upload(sql_result.insertId, qrFileData);
            // let qr_url = result.url;
            let qr_url = result.url.replace('http://', 'https://')
            await mysql.query("UPDATE user SET qrcode=? WHERE uid=?", [qr_url, sql_result.insertId]);
        } catch (err) {
            console.log("用户注册时二维码生成错误");
            console.log(err);
        }

        // 如果推荐人有分仓，直接进分仓
        if (rData.bucket_id > 0) {
            let bdata = await mysql.query("SELECT * FROM user_bucket WHERE uid=?", [rData.bucket_id]);
            if (bdata.length > 0) {
                let members = JSON.parse(bdata[0].members);
                members.push(sql_result.insertId);
                await mysql.query("UPDATE user_bucket SET members=? WHERE uid=?", [JSON.stringify(members), rData.bucket_id]);
            }
        }

        res.send(base.result_ok("注册成功"));
        return;
    } else {
        res.send(base.result_error("注册失败"));
        return;
    }
};

/**
 * 用户登录
 * @param {*} req 
 * @param {*} res 
 */
// TODO:v2
user.login = async (req, res) => {
    let phone = req.body.phone;
    phone = phone.replace(/\s*/g, "");
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
        let token = base.createToken(user_info.uid);
        sql = "UPDATE user SET token=?,last_login_time=? WHERE uid=?";
        sql_result = await mysql.query(sql, [token, moment().format("YYYY-MM-DD HH:mm:ss"), user_info.uid]);

        if (!(user_info.state > 0)) {
            res.send(base.result_error("登录失败"));
            return;
        }

        let data = {
            token: token,
            nickname: user_info.nickname,
            phone: user_info.phone,
            avatar: user_info.avatar,
            qrcode: user_info.qrcode,
            payee_name: user_info.payee_name,
            payee_bankno: user_info.payee_bankno,
            payee_bankname: user_info.payee_bankname,
            wxpay_img: user_info.wxpay_img,
            alipay_img: user_info.alipay_img,
            has_sign: user_info.sign ? true : false,
            has_read_protocol: user_info.has_read_protocol,
            edit_bank_access: user_info.edit_bank_access,
            edit_avatar_access: user_info.edit_avatar_access,
            edit_nickname_access: user_info.edit_nickname_access,
            level1_recommender: user_info.level1_recommender,
            address_list: user_info.address_list,
            create_time: user_info.create_time,
            last_login_time: user_info.last_login_time,
            open_id: user_info.open_id,
        }

        delete user_info.pwd_md5;
        delete user_info.admin_pwd;
        user_info.roles = JSON.parse(user_info.roles);
        let alist = await mysql.query("SELECT * FROM user_address WHERE uid=?", [user_info.uid]);
        user_info.address_list = alist;
        user_info.token = token;
        data.roles = user_info.roles;

        await redis.Client1.setEx(`${KEYS.TOKEN}${user_info.uid}`, 86400 * 365, JSON.stringify(user_info));

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
// TODO:v2
user.getInfo = async (req, res) => {
    let token_info = await base.checkToken(req);
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
        qrcode: user_info.qrcode,
        payee_name: user_info.payee_name,
        payee_bankno: user_info.payee_bankno,
        payee_bankname: user_info.payee_bankname,
        wxpay_img: user_info.wxpay_img,
        alipay_img: user_info.alipay_img,
        has_sign: user_info.sign ? true : false,
        has_read_protocol: user_info.has_read_protocol,
        edit_bank_access: user_info.edit_bank_access,
        edit_avatar_access: user_info.edit_avatar_access,
        edit_nickname_access: user_info.edit_nickname_access,
        level1_recommender: user_info.level1_recommender,
        address_list: user_info.address_list,
        create_time: user_info.create_time,
        last_login_time: user_info.last_login_time,
        roles: user_info.roles,
        open_id: user_info.open_id
    }

    res.send(base.result_ok("ok", data));
    return;
};


/**
 * 修改昵称
 * @param {*} req 
 * @param {*} res 
 */
user.editNickname = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let nickname = req.body.nickname;
    if (nickname == null || nickname == "") {
        res.send(base.result_error("昵称不能为空"));
        return;
    }

    nickname = nickname.replace(/\s*/g, "");
    if (nickname == "") {
        res.send(base.result_error("昵称不能为空"));
        return;
    }

    let sql = `SELECT * FROM user WHERE nickname=? AND uid<>?`;
    let data = await mysql.query(sql, [nickname, user_info.uid]);

    if (data.length > 0) {
        res.send(base.result_error("昵称已被占用"));
        return;
    }

    sql = `UPDATE user SET nickname=? WHERE uid=?`;
    await mysql.query(sql, [nickname, user_info.uid]);
    // 信息更新到redis
    await base.updateUserInfo(user_info.uid);
    res.send(base.result_ok("修改成功"));
    return;
};



/**
 * 修改头像
 * @param {*} req 
 * @param {*} res 
 */
user.editAvatar = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let avatar = req.body.avatar;
    if (avatar == null || avatar == "") {
        res.send(base.result_error("头像不能为空"));
        return;
    }

    avatar = avatar.replace(/\s*/g, "");
    if (avatar == "") {
        res.send(base.result_error("头像不能为空"));
        return;
    }

    let sql = `UPDATE user SET avatar=? WHERE uid=?`;
    await mysql.query(sql, [avatar, user_info.uid]);
    // try {
    //     // 合成图片
    //     let data = await qr_code.combineQr(user_info.qrcode, avatar, user_info.uid);
    //     if (data.result) {
    //         await qr_code.uploadLocalFile(data.data, user_info.uid);
    //     }
    // } catch { }
    // 信息更新到redis
    await base.updateUserInfo(user_info.uid);
    res.send(base.result_ok("修改成功"));
    return;
};

/**
 * 上传微信收款码/支付宝收款
 * @param {*} req 
 * @param {*} res 
 */
 user.editReceiptCode = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let imgUrl = req.body.imgUrl;
    if (!imgUrl) {
        res.send(base.result_error("收款码不能为空"));
        return;
    }
    imgUrl = imgUrl.replace(/\s*/g, "");
    if (!imgUrl) {
        res.send(base.result_error("收款码不能为空"));
        return;
    }

    let type = req.body.type;
    if (!type) {
        res.send(base.result_error("请选择当前收款码的类型"));
        return;
    }
    if(!['wxpay_img', 'alipay_img'].includes(type)){
        res.send(base.result_error("收款码类型无效"));
        return; 
    }
    let sql = `UPDATE user SET ${type}=? WHERE uid=?`;
    await mysql.query(sql, [imgUrl, user_info.uid]);
    // 信息更新到redis
    await base.updateUserInfo(user_info.uid);
    res.send(base.result_ok("修改成功"));
    return;
};


/**
 * 刷新token
 * @param {*} req 
 * @param {*} res 
 */
user.refreshToken = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let token = base.createToken(user_info.uid);
    let sql = "UPDATE user SET token=?,last_login_time=? WHERE uid=?";
    let sql_result = await mysql.query(sql, [token, moment().format("YYYY-MM-DD HH:mm:ss"), user_info.uid]);
    let info = await redis.Client1.get(`${KEYS.TOKEN}${user_info.uid}`);
    if (info) {
        info = JSON.parse(info);
        info.token = token;
        await redis.Client1.setEx(`${KEYS.TOKEN}${user_info.uid}`, 86400 * 10, JSON.stringify(info));
    }
    res.send(base.result_ok("ok", token));
    return;
};

/**
 * 修改密码
 * @param {*} req 
 * @param {*} res 
 */
user.resetPwd = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let cur_pwd = req.body.cur_pwd;
    let new_pwd = req.body.new_pwd;

    if (!cur_pwd || !new_pwd) {
        res.send(base.result_error("密码不能为空"));
        return;
    }

    if (cur_pwd === new_pwd) {
        res.send(base.result_error("新密码不能与原密码相同"));
        return;
    }
    let uinfo = await mysql.query("SELECT * FROM user WHERE uid=?", [user_info.uid]);
    uinfo = uinfo[0];

    if (!(base.md5Pwd(cur_pwd) === uinfo.pwd_md5)) {
        console.log(base.md5Pwd(cur_pwd));
        console.log(uinfo.pwd_md5);
        res.send(base.result_error("原密码验证失败"));
        return;
    }

    let sql = "UPDATE user SET pwd_md5=?,token='pwd reset' WHERE uid=?";
    let sql_result = await mysql.query(sql, [base.md5Pwd(new_pwd), user_info.uid]);
    res.send(base.result_ok("密码修改成功,请重新登录"));
    return;
};


/**
 * 重置密码
 * @param {*} req 
 * @param {*} res 
 */
user.resetPwdSmsCode = async (req, res) => {
    let phone = req.body.phone;
    let sms_code = req.body.sms_code;
    let new_pwd = req.body.new_pwd;

    phone = phone.replace(/\s*/g, "");
    if (!phone) {
        res.send(base.result_error("手机号不能为空"));
        return;
    }
    if (!new_pwd) {
        res.send(base.result_error("密码不能为空"));
        return;
    }
    if (!sms_code) {
        res.send(base.result_error("验证码不能为空"));
        return;
    }

    let check = await sms.checkSMScode(phone, sms_code);
    if (!check) {
        res.send(base.result_error("验证码不正确"));
        return;
    }

    let sql = "SELECT * FROM user WHERE phone=?";
    let sql_result = await mysql.query(sql, [phone]);
    if (sql_result.length == 0) {
        res.send(base.result_error("用户不存在,请注册"));
        return;
    }
    let user_info = sql_result[0];

    sql = "UPDATE user SET pwd_md5=?,token='pwd reset' WHERE uid=?";
    sql_result = await mysql.query(sql, [base.md5Pwd(new_pwd), user_info.uid]);
    res.send(base.result_ok("密码重置成功,请重新登录"));
    return;
};

/**
 * 更新用户信息（包括昵称、银行卡信息）
 * @param {*} req 
 * @param {*} res 
 */
user.updateUserInfo = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let nickname = req.body.nickname;
    let avatar = req.body.avatar;
    let gender = parseInt(req.body.gender);
    let email = req.body.email;
    let payee_name = req.body.payee_name;
    let payee_bankno = req.body.payee_bankno;
    let payee_bankname = req.body.payee_bankname;
    let wxpay_img = req.body.wxpay_img;
    let alipay_img = req.body.alipay_img;
    let edit_bank_access = parseInt(req.body.edit_bank_access);
    let sign = req.body.sign;
    let has_read_protocol = parseInt(req.body.has_read_protocol);

    let sql = "UPDATE user SET ";
    let sql_params = [];
    let sql_where = " WHERE uid=?";

    if (nickname) {
        sql += " nickname=?,";
        sql_params.push(nickname);
    }
    if (avatar) {
        sql += " avatar=?,";
        sql_params.push(avatar);
    }
    if (gender == 0 || gender == 1 || gender == 2) {
        sql += " gender=?,";
        sql_params.push(gender);
    }
    if (email) {
        sql += " email=?,";
        sql_params.push(email);
    }
    if (edit_bank_access == 0 || edit_bank_access == 1) {
        if (payee_name) {
            sql += " payee_name=?,";
            sql_params.push(payee_name);
        }
        if (payee_bankno) {
            sql += " payee_bankno=?,";
            sql_params.push(payee_bankno);
        }
        if (payee_bankname) {
            sql += " payee_bankname=?,";
            sql_params.push(payee_bankname);
        }
        sql += " edit_bank_access=?,";
        sql_params.push(edit_bank_access);
    }
    if (wxpay_img) {
        sql += " wxpay_img=?,";
        sql_params.push(wxpay_img);
    }
    if (alipay_img) {
        sql += " alipay_img=?,";
        sql_params.push(alipay_img);
    }
    if (sign) {
        sql += " sign=?,";
        sql_params.push(sign);
    }
    if (has_read_protocol == 1) {
        sql += " has_read_protocol=?,";
        sql_params.push(has_read_protocol);
    }

    if (sql_params.length > 0) {
        sql = sql.substring(0, sql.length - 1);
        sql += sql_where;
        sql_params.push(user_info.uid);
        let sql_result = await mysql.query(sql, sql_params);

        // 信息更新到redis
        await base.updateUserInfo(user_info.uid);

        res.send(base.result_ok("更新成功"))
        return;
    } else {
        res.send(base.result_ok("没有要更新的信息"))
        return;
    }
};

/**
 * 获取粉丝数据信息
 * @param {*} req 
 * @param {*} res 
 */
user.getFansDataInfo = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT uid,create_time FROM user WHERE level1_recommender=? OR level2_recommender=? ORDER BY uid DESC`;
    let data = await mysql.query(sql, [user_info.uid, user_info.uid]);
    let start = new Date(new Date(new Date().toLocaleDateString()).getTime());
    let todayData = data.filter(d => {
        let ctime = new Date(d.create_time).getTime();
        return ctime >= start;
    });

    res.send(base.result_ok("ok", {
        today_count: todayData.length,
        total_count: data.length
    }));
    return;
};

/**
 * 获取粉丝列表
 * @param {*} req 
 * @param {*} res 
 */
user.getFansList = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let level = parseInt(req.body.level);
    if (level != 1 && level != 2) {
        res.send(base.result_error("粉丝等级参数错误"))
        return;
    }

    let page_size = parseInt(req.body.page_size);
    let page_index = parseInt(req.body.page_index);
    if (!(page_size > 0) || !(page_index >= 0)) {
        res.send(base.result_error("分页参数错误", { page_index, page_size }));
        return;
    }
    let limit = page_index * page_size;

    let sql = `SELECT nickname,avatar,phone,create_time FROM user `;
    let sql_count = "SELECT COUNT(*) total_count FROM user ";
    if (level == 1) {
        sql += "WHERE level1_recommender=? LIMIT ?,?";
        sql_count += "WHERE level1_recommender=?";
    } else {
        sql += "WHERE level2_recommender=? LIMIT ?,?";
        sql_count += "WHERE level2_recommender=?";
    }
    let sql_params = [user_info.uid, limit, page_size];
    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, [user_info.uid]);

    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: sql_result
    }

    res.send(base.result_ok("ok", data));
    return;
};


/**
 * 获取粉丝订单
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getFansOrder = async (req, res) => {
    let token_info = await base.checkToken(req);
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

    let sql = `SELECT a.order_no,c.fans_uid,c.income,c.rate,b.nickname fans_nickname,b.avatar fans_avatar,d.name goods_name,d.img goods_img,d.code,d.gid,
    a.g_price,b.level1_recommender,b.level2_recommender,a.pay_state,e.nickname saler_nickname   
    FROM user_order a 
    INNER JOIN user b ON a.uid=b.uid 
    LEFT JOIN user_income_record c ON c.order_id=a.order_id AND c.uid=a.uid  
    LEFT JOIN goods_rush d ON d.gid=a.gid 
    LEFT JOIN user e ON e.uid=a.saler_id 
    WHERE a.pay_state>-1 AND a.state=1 AND (b.level1_recommender=? OR b.level2_recommender=?) 
    ORDER BY a.create_time DESC 
    LIMIT ?,?`;

    let sql_count = `SELECT COUNT(*) total_count FROM user_order a INNER JOIN user b ON a.uid=b.uid WHERE a.pay_state>-1 AND a.state=1 AND (b.level1_recommender=? OR b.level2_recommender=?) `;
    let sql_params = [user_info.uid, user_info.uid, limit, page_size];
    let sql_result = await mysql.query(sql, sql_params);
    let sql_count_result = await mysql.query(sql_count, sql_params);
    let list = sql_result;
    let data = {
        page_index,
        page_size,
        total_count: sql_count_result[0].total_count,
        list: list
    }

    // 获取收益率
    let rates = await mysql.query("SELECT * FROM other_config WHERE id IN (2,3)");
    let r1 = 0;
    let r2 = 0;
    rates.forEach(item => {
        if (item.id == 2) {
            r1 = Number(item.value3);
        } else if (item.id == 3) {
            r2 = Number(item.value3);
        }
    });

    list = list.map(item => {
        if (item.level1_recommender == user_info.uid) {
            item.level = 1;
            if (item.income == null) { // 如果是没有确认收款的订单，实际上没有产生收益记录，此时实时计算
                item.income = parseInt(item.g_price * r1 * 0.001);
            }
        } else if (item.level2_recommender == user_info.uid) {
            item.level = 2;
            if (item.income == null) {// 如果是没有确认收款的订单，实际上没有产生收益记录，此时实时计算
                item.income = parseInt(item.g_price * r2 * 0.001);
            }
        }
        delete item.level1_recommender;
        delete item.level2_recommender;
        if (item.pay_state == 0) {
            item.stateStr = "待付款";
        } else if (item.pay_state == 1) {
            item.stateStr = "已付款";
        } else if (item.pay_state == 2) {
            item.stateStr = "已上架";
        }
    });

    res.send(base.result_ok("ok", data));
    return;
};


// /**
//  * 获取粉丝订单
//  * @param {*} req 
//  * @param {*} res 
//  * @returns 
//  */
// user.obsolete_getFansOrder_bak = async (req, res) => {
//     let token_info = await base.checkToken(req);
//     if (token_info.res_code < 0) {
//         res.send(token_info);
//         return;
//     }
//     let user_info = token_info.data;

//     let page_size = parseInt(req.body.page_size);
//     let page_index = parseInt(req.body.page_index);
//     if (!(page_size > 0) || !(page_index >= 0)) {
//         res.send(base.result_error("分页参数错误", { page_index, page_size }));
//         return;
//     }
//     let limit = page_index * page_size;

//     let sql = `SELECT a.order_no,a.fans_level level,a.fans_uid,a.income,a.rate,c.nickname fans_nickname,c.avatar fans_avatar,d.name goods_name,d.code,b.g_price  
//     FROM user_income_record a 
//     INNER JOIN user_order b ON a.order_id=b.order_id 
//     LEFT JOIN user c ON c.uid=a.fans_uid 
//     LEFT JOIN goods_rush d ON d.gid=b.gid 
//     WHERE a.uid=? 
//     ORDER BY a.id ASC 
//     LIMIT ?,?`;

//     let sql_count = `SELECT COUNT(*) total_count FROM user_income_record WHERE uid=? `;
//     let sql_params = [user_info.uid, limit, page_size];
//     let sql_result = await mysql.query(sql, sql_params);
//     let sql_count_result = await mysql.query(sql_count, sql_params);
//     let list = sql_result;
//     let data = {
//         page_index,
//         page_size,
//         total_count: sql_count_result[0].total_count,
//         list: list
//     }

//     res.send(base.result_ok("ok", data));
//     return;
// };

/**
 * 获取粉丝订单统计数据
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
user.getFansOrderInfo = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let sql = `SELECT * FROM user_order a 
    INNER JOIN user b ON a.uid=b.uid 
    WHERE (b.level1_recommender=? OR b.level2_recommender=?) AND a.pay_state>-1 AND a.state=1`;
    let sql_result = await mysql.query(sql, [user_info.uid, user_info.uid]);

    let data = {
        orders_total_price: 0,
        orders_total_count: 0,
    }
    if (sql_result.length > 0) {
        data.orders_total_count = sql_result.length;
    }
    sql = `SELECT SUM(a.g_price) orders_total_price FROM user_order a INNER JOIN user b ON a.uid=b.uid WHERE (b.level1_recommender=? OR b.level2_recommender=?) AND a.pay_state>-1 AND a.state=1 `;
    sql_result = await mysql.query(sql, [user_info.uid, user_info.uid]);
    if (sql_result.length > 0) {
        data.orders_total_price = sql_result[0].orders_total_price;
    }

    res.send(base.result_ok("ok", data));
    return;
};

// /**
//  * 获取粉丝订单统计数据
//  * @param {*} req 
//  * @param {*} res 
//  * @returns 
//  */
// user.getFansOrderInfo = async (req, res) => {
//     let token_info = await base.checkToken(req);
//     if (token_info.res_code < 0) {
//         res.send(token_info);
//         return;
//     }
//     let user_info = token_info.data;

//     let sql = `SELECT * FROM user_income WHERE uid=?`;
//     let sql_result = await mysql.query(sql, [user_info.uid]);

//     let data = {
//         orders_total_price: 0,
//         orders_total_count: 0,
//     }
//     if (sql_result.length > 0) {
//         data.orders_total_count = sql_result[0].income_order_count;
//     }
//     sql = `SELECT SUM(income) orders_total_price FROM user_income_record WHERE uid=?`;
//     sql_result = await mysql.query(sql, [user_info.uid]);
//     if (sql_result.length > 0) {
//         data.orders_total_price = sql_result[0].orders_total_price;
//     }

//     res.send(base.result_ok("ok", data));
//     return;
// };

// /**
//  * 获取粉丝订单
//  * @param {*} req 
//  * @param {*} res 
//  * @returns 
//  */
// user.getFansOrder = async (req, res) => {
//     let token_info = await base.checkToken(req);
//     if (token_info.res_code < 0) {
//         res.send(token_info);
//         return;
//     }
//     let user_info = token_info.data;

//     let page_size = parseInt(req.body.page_size);
//     let page_index = parseInt(req.body.page_index);
//     if (!(page_size > 0) || !(page_index >= 0)) {
//         res.send(base.result_error("分页参数错误", { page_index, page_size }));
//         return;
//     }
//     let limit = page_index * page_size;

//     let sql = `SELECT uid,level1_recommender,level2_recommender FROM user WHERE level1_recommender=? OR level2_recommender=?`;
//     let fans = await mysql.query(sql, [user_info.uid, user_info.uid]);
//     let fansObj = {};
//     fans.forEach(fan => {
//         if (fan.level1_recommender == user_info.uid) {
//             fansObj[fan.uid] = 1;
//         } else {
//             fansObj[fan.uid] = 2;
//         }
//     });

//     if (fans.length == 0) {
//         let data = {
//             page_index,
//             page_size,
//             total_count: 0,
//             list: []
//         }

//         res.send(base.result_ok("ok", data));
//         return;
//     }

//     let ids = fans.map(item => {
//         return item.uid;
//     });

//     sql = `SELECT a.*,b.nickname fans_nickname,b.avatar fans_avatar,c.name goods_name,c.code 
//     FROM user_order a 
//     INNER JOIN user b ON a.uid=b.uid 
//     LEFT JOIN goods_rush c ON a.gid=c.gid 
//     WHERE a.pay_state=1 AND a.uid IN (?) 
//     ORDER BY a.create_time DESC 
//     LIMIT ?,?`;
//     let sql_count = `SELECT COUNT(*) count FROM user_order a 
//     INNER JOIN user b ON a.uid=b.uid 
//     WHERE a.pay_state=1 AND a.uid IN (?) `;
//     let sql_params = [ids, limit, page_size];
//     let sql_result = await mysql.query(sql, sql_params);
//     let sql_count_result = await mysql.query(sql_count, sql_params);
//     let list = sql_result;
//     list.forEach(item => {
//         if (fansObj[item.uid]) {
//             item.level = fansObj[item.uid];
//         }
//     });

//     let data = {
//         page_index,
//         page_size,
//         total_count: sql_count_result[0].total_count,
//         list: list
//     }

//     res.send(base.result_ok("ok", data));
//     return;
// };


// /**
//  * 获取粉丝订单统计数据
//  * @param {*} req 
//  * @param {*} res 
//  * @returns 
//  */
// user.getFansOrderInfo = async (req, res) => {
//     let token_info = await base.checkToken(req);
//     if (token_info.res_code < 0) {
//         res.send(token_info);
//         return;
//     }
//     let user_info = token_info.data;

//     let sql = `SELECT uid,level1_recommender,level2_recommender FROM user WHERE level1_recommender=? OR level2_recommender=?`;
//     let fans = await mysql.query(sql, [user_info.uid, user_info.uid]);
//     if (fans.length == 0) {
//         res.send(base.result_ok("ok", {
//             orders_total_price: 0,
//             orders_total_count: 0,
//         }));
//         return;
//     }

//     let ids = fans.map(item => {
//         return item.uid;
//     });

//     sql = `SELECT SUM(g_price) orders_total_price FROM user_order WHERE pay_state=1 AND uid IN (?)`;
//     let sql_count = `SELECT COUNT(*) orders_total_count FROM user_order WHERE pay_state=1 AND uid IN (?)`;
//     let sql_params = [ids];
//     let sql_result = await mysql.query(sql, sql_params);
//     let sql_count_result = await mysql.query(sql_count, sql_params);

//     let data = {
//         orders_total_price: sql_result[0].orders_total_price,
//         orders_total_count: sql_count_result[0].orders_total_count,
//     }

//     res.send(base.result_ok("ok", data));
//     return;
// };

/**
 * 退出登录【2】
 * @param {*} req 
 * @param {*} res 
 */
user.logout = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(base.result_ok("ok"));
        return;
    }
    let user_info = token_info.data;

    let sql = "UPDATE user SET token=? WHERE uid=?";
    let sql_result = await mysql.query(sql, ['logout', user_info.uid]);

    res.send(base.result_ok("ok"));
    return;
};

/**
 * 获取推荐人信息【2】
 * @param {*} req 
 * @param {*} res 
 */
user.whoIsRecommender = async (req, res) => {
    // let rid = req.body.rid;
    let rid = parseInt(req.body.rid);
    if (!(rid > 0)) {
        res.send(base.result_ok("ok", { rid: 0, rname: "无" }));
        return;
    }
    // try {
    //     rid = base.decrypt(rid);
    // } catch (err) { console.log(err); console.log(rid); }
    let sql = "SELECT avatar,nickname,phone FROM user WHERE uid=?";
    let sql_result = await mysql.query(sql, [rid]);
    if (sql_result.length > 0) {
        let data = sql_result[0];
        res.send(base.result_ok("ok", { rid: rid, rname: data.nickname, rphone: data.phone, ravatar: data.avatar }));
        return;
    }

    res.send(base.result_ok("ok", { rid: 0, rname: "无" }));
    return;
};

/**
 * 修改用户open_id
 * @param {*} req 
 * @param {*} res 
 */
user.updateOpenId = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;

    let openId = req.body.openId;
    if (!openId) {
        res.send(base.result_error("openId不能为空"));
        return;
    }

    let sql = `SELECT * FROM user WHERE open_id=?`;
    let data = await mysql.query(sql, [openId]);

    // open_id可以重复
    // if (data.length > 0) {
    //     res.send(base.result_error("openId已被占用"));
    //     return;
    // }

    sql = `UPDATE user SET open_id=? WHERE uid=?`;
    await mysql.query(sql, [openId, user_info.uid]);
    // 信息更新到redis
    await base.updateUserInfo(user_info.uid);
    res.send(base.result_ok("修改成功"));
    return;
};

// ---- private ----

module.exports = user;