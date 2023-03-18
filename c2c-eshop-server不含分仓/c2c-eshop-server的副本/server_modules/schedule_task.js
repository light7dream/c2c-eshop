const schedule = require('node-schedule');
const { myCart } = require('./api_web/user_goods');
let mysql = require('./mysql');
let redis = require('./redis');
let moment = require('moment');
let KEYS = require('./redis_key');



/**
 * 抢购订单自动签收任务
 * 检查付款自动签收时间规则
 */
let checkPayRule = new schedule.RecurrenceRule();
checkPayRule.minute = [0, 10, 20, 30, 40, 50];
checkPayRule.second = [0];
let checkPayTask = schedule.scheduleJob(checkPayRule, async () => {
    // let sql = "SELECT * FROM goods_rush WHERE state=3 AND NOW()>(update_time-INTERVAL 2 HOUR)";

    // let sql = "UPDATE goods_rush SET state=0,last_belong=belong,belong=rusher_id,rusher_id=0 WHERE NOW()>(update_time + INTERVAL 1 MINUTE) AND state=3";
    let sql = "SELECT * FROM goods_rush WHERE NOW()>(update_time + INTERVAL 1 HOUR) AND state=3";
    let sql_result = await mysql.query(sql, []);
    if (sql_result.length > 0) {
        for (let i = 0; i < sql_result.length; i++) {
            let gid = sql_result[i].gid;
            let rusher_id = sql_result[i].rusher_id;
            let belong_id = sql_result[i].belong;
            let order_info = await mysql.query("SELECT * FROM user_order WHERE order_id=?", [sql_result[i].current_order_id]);
            order_info = order_info[0];
            let price = order_info.g_price;

            // 更新发布订单，计算收益使用
            let test_result = await mysql.query("UPDATE user_order_publish SET hassale=1 WHERE order_no=? AND uid=?", [sql_result[i].publish_order_no, belong_id]);
            if (!(test_result.affectedRows > 0)) {
                console.log(`自动签收，更新收益异常:gid:${gid}`);
                console.log(test_result);
            } else {
                console.log('ok');
            }

            // 设置商品状态
            sql = "UPDATE goods_rush SET state=0,last_belong=belong,belong=rusher_id,rusher_id=0 WHERE gid=?";
            let data = await mysql.query(sql, [gid]);
            // 更新订单
            sql = `UPDATE user_order SET pay_state=1 WHERE state=1 AND uid=? AND order_id=?`;
            await mysql.query(sql, [rusher_id, order_info.order_id]);

            let userinfo = await mysql.query("SELECT * FROM user WHERE uid=?", [rusher_id]);
            if (userinfo.length > 0) {
                userinfo = userinfo[0];
                // 更新推荐人收益
                if (userinfo.level1_recommender > 0) {
                    // 获取收益率
                    let rate = await mysql.query("SELECT * FROM other_config WHERE id=2");
                    if (rate.length > 0) {
                        rate = rate[0].value3;
                    } else {
                        rate = 3;
                    }

                    let income = parseInt(price * rate * 0.001);
                    let r1income = await mysql.query("SELECT * FROM user_income WHERE uid=?", [userinfo.level1_recommender]);
                    let beforeTotal = 0;
                    let beforeAvaliable = 0;
                    if (r1income.length > 0) {
                        r1income = r1income[0];
                        beforeTotal = r1income.income_total;
                        beforeAvaliable = r1income.income;
                        await mysql.query("UPDATE user_income SET income_total=income_total+?,income=income+?,income_order_count=income_order_count+1 WHERE uid=?", [income, income, userinfo.level1_recommender]);
                    } else {
                        await mysql.query("INSERT INTO user_income (uid,income_total,income,income_order_count) VALUES (?,?,?,1)", [userinfo.level1_recommender, income, income]);
                    }
                    await mysql.query(`INSERT INTO user_income_record (uid,order_id,order_no,fans_level,fans_uid,before_total_income,before_available_income,income,rate) 
          VALUES (?,?,?,?,?,?,?,?,?)`, [userinfo.level1_recommender, order_info.order_id, order_info.order_no, 1, userinfo.uid, beforeTotal, beforeAvaliable, income, rate]);
                }
                if (userinfo.level2_recommender > 0) {
                    // 获取收益率
                    let rate = await mysql.query("SELECT * FROM other_config WHERE id=3");
                    if (rate.length > 0) {
                        rate = rate[0].value3;
                    } else {
                        rate = 2;
                    }

                    let income = parseInt(price * rate * 0.001);
                    let r1income = await mysql.query("SELECT * FROM user_income WHERE uid=?", [userinfo.level2_recommender]);
                    let beforeTotal = 0;
                    let beforeAvaliable = 0;
                    if (r1income.length > 0) {
                        r1income = r1income[0];
                        beforeTotal = r1income.income_total;
                        beforeAvaliable = r1income.income;
                        await mysql.query("UPDATE user_income SET income_total=income_total+?,income=income+?,income_order_count=income_order_count+1 WHERE uid=?", [income, income, userinfo.level2_recommender]);
                    } else {
                        await mysql.query("INSERT INTO user_income (uid,income_total,income,income_order_count) VALUES (?,?,?,1)", [userinfo.level2_recommender, income, income, rate]);
                    }
                    await mysql.query(`INSERT INTO user_income_record (uid,order_id,order_no,fans_level,fans_uid,before_total_income,before_available_income,income,rate) 
          VALUES (?,?,?,?,?,?,?,?,?)`, [userinfo.level2_recommender, order_info.order_id, order_info.order_no, 2, userinfo.uid, beforeTotal, beforeAvaliable, income, rate]);
                }
            }

        }
    }
    if (sql_result.length > 0) {
        console.log(`自动签收订单数:${sql_result.length} ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    }
});



/**
 * 同步抢购商品任务
 * 获取抢购场次，开始时间在0-40分钟更新，检查周期30分钟，开抢前10分钟可看见商品
 */
let syncRushRule = new schedule.RecurrenceRule();
// syncRushRule.minute = [0,20, 50];
syncRushRule.second = [30];
let syncRushTask = schedule.scheduleJob(syncRushRule, async () => {
    let data = await redis.updateGet(KEYS.RUSH_SCHEDULE, async () => {
        let sql = "SELECT * FROM rush_schedule ORDER BY starttime ASC ";
        let sql_result = await mysql.query(sql, []);
        return sql_result;
    });
    let appTime = new Date();
    let y = appTime.getFullYear();
    let M = appTime.getMonth();
    let d = appTime.getDate();
    let curTime = appTime.getTime();

    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let startArr = item.starttime.split(":");
        let start = new Date(y, M, d, parseInt(startArr[0]), parseInt(startArr[1]), parseInt(startArr[2])).getTime();

        if (start > curTime && (start - curTime) <= 30 * 60 * 1000) {
            let sql = `SELECT a.*,a.sid,b.nickname belong_nickname,b.avatar belong_avatar  
            FROM goods_rush a 
            LEFT JOIN user b ON b.uid=a.belong 
            WHERE a.sid = ? AND a.state IN (0,1,2,3,4,5)`;
            let goods_data = await mysql.query(sql, [item.id]);

            // 清除抢购列表键
            const itemKeys = await redis.Client0.keys(`${KEYS.RUSH_GOODS}${item.id}`);
            if (itemKeys.length > 0) {
                await redis.Client0.del(itemKeys);
            }

            // 添加商品至抢购列表
            for (let m = 0; m < goods_data.length; m++) {
                await redis.Client0.hSet(`${KEYS.RUSH_GOODS}${item.id}`, goods_data[m].gid.toString(), JSON.stringify(goods_data[m]));
            }

            // 添加计数器
            for (let m = 0; m < goods_data.length; m++) {
                let map = new Map();
                let count = 0;
                if (goods_data[m].state == 1) {
                    count = 1;
                }
                map.set(`${goods_data[m].gid}`, parseInt(count));
                await redis.Client0.HDEL(`${KEYS.RUSH_GOODS_COUNTER}${item.id}`, `${goods_data[m].gid}`);
                await redis.Client0.HSET(`${KEYS.RUSH_GOODS_COUNTER}${item.id}`, map);
            }
            console.log(`更新抢购场次: ${item.name} Id: ${item.id} SID: ${item.id} ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        }
    }

    // 更新用户发布的商品
    let allusers = await mysql.query("SELECT uid FROM user WHERE state=1", []);
    let uids = allusers.map(a => {
        return a.uid;
    });

    for (let i = 0; i < uids.length; i++) {
        let uid = uids[i];
        // 更新用户发布商品
        let belongUsers = await mysql.query("SELECT gid FROM goods_rush WHERE belong=? AND state IN (0,1,2,3)", [uid]);
        await redis.Client2.hDel(`${KEYS.USER_BELONG}`, `${uid}`);

        if (belongUsers.length > 0) {
            let gidList = belongUsers.map(d => {
                return d.gid;
            });
            let map = new Map();
            map.set(`${uid}`, JSON.stringify(gidList));
            await redis.Client2.hSet(KEYS.USER_BELONG, map);
        }
    }

});


/**
 * 同步首页商品任务
 */
let asyncShelvesRule = new schedule.RecurrenceRule();
asyncShelvesRule.hour = [3];
asyncShelvesRule.minute = [0];
asyncShelvesRule.second = [0];
let asyncShelvesTash = schedule.scheduleJob(asyncShelvesRule, async () => {
    let data = await mysql.query("SELECT * FROM goods_shelves WHERE state=1 ORDER BY gid DESC", []);
    let cList = await mysql.query("SELECT * FROM goods_category WHERE state=1 AND cid>0 ORDER BY cid DESC", []);
    cList = cList.map(item => {
        return item.cid;
    });


    // 删除原先的键
    let delKeys = await redis.Client3.keys(`${KEYS.SHELVES_GOODS}*`);
    if (delKeys.length > 0) {
        await redis.Client3.del(delKeys);
    }

    // 全部分类列表中添加
    for (let i = 0; i < data.length; i++) {
        let map = new Map();
        map.set(`${data[i].gid}`, JSON.stringify(data[i]));
        await redis.Client3.hSet(`${KEYS.SHELVES_GOODS}0`, map);
    }

    // 各个分类中添加
    if (cList) {
        for (let i = 0; i < cList.length; i++) {
            let fdata = data.filter(d => {
                return d.cid == cList[i];
            });
            for (let i = 0; i < fdata.length; i++) {
                let map = new Map();
                map.set(`${fdata[i].gid}`, JSON.stringify(fdata[i]));
                await redis.Client3.hSet(`${KEYS.SHELVES_GOODS}${cList[i]}`, map);
            }
        }
    }

    // 清除计数器
    await redis.Client3.del(`${KEYS.SHELVES_GOODS_COUNTER}`);
    // 更新计数器
    for (let i = 0; i < data.length; i++) {
        let map = new Map();
        map.set(`${data[i].gid}`, parseInt(data[i].count));
        await redis.Client3.HSET(`${KEYS.SHELVES_GOODS_COUNTER}`, map);
    }

    console.log(`商城首页商品更新: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
});


/**
 * 商城订单自动取消任务
 * 10分钟取消订单
 */
let shelvesOrderRule = new schedule.RecurrenceRule();
shelvesOrderRule.minute = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];
shelvesOrderRule.second = [40];
let shelvesOrderTask = schedule.scheduleJob(shelvesOrderRule, async () => {
    let cancelOrders = await mysql.query("SELECT * FROM user_order_shelves WHERE state=1 AND pay_state=0 AND NOW()>(create_time + INTERVAL 10 MINUTE)", []);

    if (cancelOrders.length > 0) {
        for (let cancelIndex = 0; cancelIndex < cancelOrders.length; cancelIndex++) {
            let order = cancelOrders[cancelIndex];
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
            await mysql.query("UPDATE user_order_shelves SET state=-1 WHERE order_id=? ", [order.order_id]);
        }
    }
    if (cancelOrders.length > 0) {
        console.log(`自动取消商城单数:${cancelOrders.length} ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    }
});


/**
* 抢购场次刷新任务
* 5分钟刷新
*/
let scheduleRule = new schedule.RecurrenceRule();
scheduleRule.minute = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];
scheduleRule.second = [50];
let scheduleTask = schedule.scheduleJob(scheduleRule, async () => {
    let data = await mysql.query("SELECT *,state schedule_state FROM rush_schedule ORDER BY starttime ASC", []);
    await redis.Client0.set(KEYS.RUSH_SCHEDULE, JSON.stringify(data));
});

/**
* 抢购日志
*/
let rushLogRule = new schedule.RecurrenceRule();
rushLogRule.hour = [23]
rushLogRule.minute = [59];
rushLogRule.second = [50];
let rushLogTask = schedule.scheduleJob(rushLogRule, async () => {
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
            });
            await redis.Client3.del(`${KEYS.LOG_SCHEDULE}${allSchedules[sindex].id}`);
            await redis.Client3.del(`${KEYS.LOG_SCHEDULE_RUSH_OK}${allSchedules[sindex].id}`);
        }
    }
    await mysql.query("INSERT INTO z_log SET type=1,log=?", [JSON.stringify(data)]);
    console.log('抢购日志落盘');
});


// 是否有必要凌晨同步分仓用户：分仓逻辑暂不谈论

