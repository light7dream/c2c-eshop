/**
 * 公共开发 API
 */
let common = {};

let user = {};
let config = require('../../package.json').config;
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let KEYS = require('../redis_key');
let redis = require('../redis');
const { env } = require('process')

/**
 * 获取商品分类【2】
 * @param {*} req 
 * @param {*} res 
 */
common.getCategory = async (req, res) => {
    let data = await redis.updateGetByDB(3, KEYS.CATEGORY_LIST, async () => {
        let sql = "SELECT * FROM goods_category WHERE state=1";
        let sql_result = await mysql.query(sql, []);
        return sql_result;
    });
    res.send(base.result_ok("ok", data));
};

/**
 * 获取公告【0】
 * @param {*} req 
 * @param {*} res 
 */
common.getNotice = async (req, res) => {
    let data = await redis.updateGetByDB(3, KEYS.NOTICE_LIST, async () => {
        let sql = "SELECT * FROM public_notice WHERE state>0 ORDER BY no,nid ASC";
        let sql_result = await mysql.query(sql, []);
        return sql_result;
    });
    res.send(base.result_ok("ok", data));
};

/**
 * 获取货架商品列表【2】
 * @param {*} req 
 * @param {*} res 
 */
common.getGoodsList = async (req, res) => {
    let uid = 0;
    let token_info = await base.checkToken(req);
    if (token_info.res_code > 0) {
        uid = token_info.data.uid;
    }
    let cid = parseInt(req.body.cid);
    let name = req.body.name;

    if (!(cid > 0)) {
        cid = 0;
    }

    let keys = await redis.Client3.HKEYS(`${KEYS.SHELVES_GOODS}${cid}`);
    if (keys.length == 0) {
        res.send(base.result_ok("ok", []));
        return;
    }
    let data = await redis.Client3.HMGET(`${KEYS.SHELVES_GOODS}${cid}`, keys);

    data = data.map(d => {
        return JSON.parse(d);
    });
    try {
        data.sort((a, b) => {
            return a.gid - b.gid;
        });
    } catch {
        console.log('--err');
        console.log(data);
    }


    if (name != null && name != "") {
        data = data.filter(d => {
            return d.name.indexOf(name) > -1;
        });
    }

    res.send(base.result_ok("ok", data));
    return;
};

/**
 * 获取Banner列表【2】
 * @param {*} req 
 * @param {*} res 
 */
common.getBannerList = async (req, res) => {
    let data = await redis.updateGetByDB(3, KEYS.BANNER_LIST, async () => {
        let sql = "SELECT gid,code,cid,name,summary,description,price,img FROM goods_shelves WHERE state=1 ORDER BY gid DESC LIMIT 5";
        let sql_result = await mysql.query(sql, []);
        return sql_result;
    });
    res.send(base.result_ok("ok", data));
    return;
};


/**
 * 获取协议页面基地址【1】
 * @param {*} req 
 * @param {*} res 
 */
common.getProtocolBaseUrl = async (req, res) => {
    res.send(base.result_ok('ok', env.protocol_baseurl || config.protocol_baseurl));
};


/**
 * 获取协议【1】
 * @param {*} req 
 * @param {*} res 
 */
common.getProtocol = async (req, res) => {
    let protocol = req.query.protocol;
    let pid = 0;
    if (protocol == "用户须知") {
        pid = 1;
    } else if (protocol == "用户隐私政策") {
        pid = 2;
    } else if (protocol == "注册及服务协议") {
        pid = 3;
    } else if (protocol == "商品上架规范及用户间交易协议") {
        pid = 4;
    } else if (protocol == "上架品类资质名录") {
        pid = 5;
    } else if (protocol == "促销活动协议") {
        pid = 6;
    } else if (protocol == "扣款协议") {
        pid = 7;
    } else if (protocol == "员工用语及行为标准") {
        pid = 8;
    } else if (protocol == "著作权转让合同") {
        pid = 9;
    } else if (protocol == "供货商入驻服务协议") {
        pid = 10;
    } else if (protocol == "供销框架协议含订单样式") {
        pid = 11;
    } else if (protocol == "用户推荐协议") {
        pid = 12;
    }

    if (pid == 0) {
        res.send(base.result_error("加载失败"));
        return;
    }
    let data = await redis.updateGetByDB(3, `${KEYS.PROTOCOL_LIST}${pid}`, async () => {
        let sql = "SELECT * FROM protocol WHERE pid=?";
        let sql_result = await mysql.query(sql, [pid]);
        if (sql_result.length > 0) {
            return sql_result[0];
        }
        return null;
    });
    // res.send(base.result_ok("ok", data));
    // return;

    if (data) {
        res.send(data.content);
    }
    return `
        <div>
            <p style="margin:20px;fpnt-size:1.5em;">页面不见了...</p>
            <Button class="backhome"
                content="返回首页"
                v-on:onClick="onClick" />
        </div>
    `

};

/**
 * 获取上架手续费率【2】
 * @param {*} req 
 * @param {*} res 
 */
common.getHandlingFeeRate = async (req, res) => {
    let rate = await redis.Client3.get(`${KEYS.RATE_HANHDING}`);
    if (rate == null) {
        let sql = "SELECT * FROM other_config WHERE id=1";
        let sql_result = await mysql.query(sql, []);
        rate = sql_result[0].value3;
        await redis.Client3.set(`${KEYS.RATE_HANHDING}`, rate.toString());
    }
    res.send(base.result_ok("ok", Number(rate)));
    return;
};

/**
 * 获取商品委托上架时间【2】
 * @param {*} req 
 * @param {*} res 
 */
common.getGoodsLaunchTime = async (req, res) => {
    let rate = await redis.Client3.get(`${KEYS.GOODS_LAUNCH_TIME}`);
    if (rate == null) {
        let sql = "SELECT * FROM other_config WHERE id=6";
        let sql_result = await mysql.query(sql, []);
        rate = sql_result[0].value1;
        await redis.Client3.set(`${KEYS.GOODS_LAUNCH_TIME}`, rate.toString());
    }
    res.send(base.result_ok("ok", Number(rate)));
    return;
};

/**
 * 获取全平台商品上架功能状态【2】
 * @param {*} req 
 * @param {*} res 
 */
common.getAllGoodsLaunchStatus = async (req, res) => {
    let state = await redis.Client3.get(`${KEYS.ALL_GOODS_LAUNCH_STATE}`);
    if (state == null) {
        let sql = "SELECT * FROM other_config WHERE id=7";
        let sql_result = await mysql.query(sql, []);
        state = sql_result[0].value1;
        await redis.Client3.set(`${KEYS.ALL_GOODS_LAUNCH_STATE}`, state.toString());
    }
    res.send(base.result_ok("ok", Number(state)));
    return;
};

/**
 * 获取商品上架涨幅【2】
 * @param {*} req 
 * @param {*} res 
 */
common.getGoodsLaunchGain = async (req, res) => {
    let rate = await redis.Client3.get(`${KEYS.GOODS_LAUNCH_GAIN}`);
    if (rate == null) {
        let sql = "SELECT * FROM other_config WHERE id=8";
        let sql_result = await mysql.query(sql, []);
        rate = Number(sql_result[0].value2);
        await redis.Client3.set(`${KEYS.GOODS_LAUNCH_GAIN}`, rate.toString());
    }
    res.send(base.result_ok("ok", Number(rate)));
    return;
};

/**
 * 获取商品上架涨幅【2】
 * @param {*} req 
 * @param {*} res 
 */
common.setData = async (req, res) => {
    let token_info = await base.checkToken(req);
    let uid = 0;
    if (token_info.res_code > 0) {
        uid = token_info.data.uid;
    }

    switch (req.body.type) {
        case '进入场次':
            let sid = parseInt(req.body.sid);
            // // 计算Timeout: 当前晚上12点过期
            // let curTime = new Date();
            // let y = curTime.getFullYear();
            // let M = curTime.getMonth();
            // let d = curTime.getDate();
            // let expiresTime = new Date(y, M, d + 1, 0, 0, 0);
            // let timeout = Math.floor((expiresTime.getTime() - curTime.getTime()) / 1000);

            let data = await redis.Client3.hGet(`${KEYS.LOG_SCHEDULE}${sid}`, `${uid}`);
            if (data) {
                await redis.Client3.hIncrBy(`${KEYS.LOG_SCHEDULE}${sid}`, `${uid}`, 1);
            } else {

                await redis.Client3.hSet(`${KEYS.LOG_SCHEDULE}${sid}`, `${uid}`, '1');
            }

            break;
        default: break;
    }

    // TODO 
    res.send(base.result_ok("ok"));
    return;
};

// /**
//  * 获取统计
//  * @param {*} req 
//  * @param {*} res 
//  */
//  common.test = async (req, res) => {
//      let sql = "SELECT * FROM user WHERE uid>214";
//      let users = await mysql.query(sql,[]);
//      let uids=[];
//      function digui(){
//          let count=0;
//         users.forEach(u=>{
//             if(uids.indexOf(u.level1_recommender)>-1 || u.level1_recommender==214){
//                 if(uids.indexOf(u.uid)==-1){
//                     uids.push(u.uid);
//                     count++;
//                 }
//             }
//         });
//         if(count>0){
//             digui();
//         }
//      }

//      digui();
//      let last=[];
//      for(let i=0;i<uids.length;i++){
//         let data = await redis.Client3.hGet(`${KEYS.LOG_SCHEDULE}${1}`, `${uids[i]}`);
//         if (data) {
//             last.push(uids[i]);
//         }
//      }

//      let data=[];
//      if(last.length>0){
//         let r = await mysql.query("SELECT uid,nickname,phone FROM user WHERE uid IN (?)",[last]);
//         data=r;
//      }

//     res.send(data);
// };

/**
 * 获取统计
 * @param {*} req 
 * @param {*} res 
 */
common.test = async (req, res) => {
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
 * 获取服务器时间
 * @param {*} req
 * @param {*} res
 */
 common.getServeTime = async (req, res) => {
  res.send(base.result_ok("ok", { time: Date.parse(new Date) }))
  return
}
common.test = async (req, res) => {
  res.send(base.result_ok("ok"))
  return
}
module.exports = common;