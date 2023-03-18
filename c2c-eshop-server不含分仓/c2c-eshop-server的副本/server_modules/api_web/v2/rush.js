let rush = {};
let base = require('../../base');
let mysql = require('../../mysql');
let moment = require('moment');
let KEYS = require('../../redis_key');
let redis = require('../../redis');

const winston = require('winston')

/**
 * V2:获取抢购场次
 * @param {*} req
 * @param {*} res
 */
rush.getRushSchedule = async (req, res) => {
    let token_info = await base.checkToken(req)
    let uid = 0
    if (token_info.res_code > 0) {
        uid = token_info.data.uid
    }

    // 如果未登录不返回场次，防止分仓用户看见普通场次
    if (!(uid > 0)) {
        res.send(base.result_ok('ok', []))
        return;
    }

    let user_info = token_info.data
    let data = await redis.updateGet(KEYS.RUSH_SCHEDULE, async () => {
        let sql = 'SELECT *,state schedule_state FROM rush_schedule ORDER BY starttime ASC '
        let sql_result = await mysql.query(sql, [])
        return sql_result
    });

    if (data && data.length > 0) {
        data = data.filter(d => {
            return d.bucket_id === user_info.bucket_id;
        });
    }

    let gtime = 0
    if (uid > 0) {
        // 查看用户是否设置上帝之手
        let god = await redis.getUserGodState(uid)
        if (god && god.godtime.use) {
            gtime = parseInt(god.godtime.data) * 1000
        }
    }

    let lastData = {
        list: data,
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        gtime: gtime,
    }

    res.send(base.result_ok('ok', lastData))
    return
}

/**
 * V2:获取抢购物品列表
 * @param {*} req
 * @param {*} res
 * @returns
 */
rush.getRushGoods = async (req, res) => {
    let token_info = await base.checkToken(req)
    if (token_info.res_code < 0) {
        res.send(token_info)
        return
    }
    let user_info = token_info.data
    let uid = user_info.uid

    let page_size = parseInt(req.body.page_size)
    let page_index = parseInt(req.body.page_index)
    if (!(page_size > 0) || !(page_index >= 0)) {
        res.send(base.result_error('分页参数错误', { page_index, page_size }))
        return
    }
    let limit = page_index * page_size
    let sid = parseInt(req.body.sid) // 场次id

    if (!(sid > 0)) {
        res.send(base.result_ok('ok', []))
        return
    }
    // 获取黑名单商品id列表
    let bidArr = []
    let blacklist = await redis.Client2.get(`${KEYS.USER_BLACKLIST}${uid}`)

    if (blacklist) {
        blacklist = JSON.parse(blacklist)
        bidArr = blacklist.map((item) => {
            return item.gid
        })
    }

    // 获取恶意用户抢购过的商品id列表
    let badArr = []
    let badlist = await redis.Client2.get(`${KEYS.USER_BADLIST}${uid}`)
    if (badlist) {
        badArr = JSON.parse(badlist)
    }

    //获取用户自己发布的商品列表
    let userGoodsIds = await redis.Client2.hGet(KEYS.USER_BELONG, `${uid}`)

    if (userGoodsIds == null) {
        userGoodsIds = []
    } else {
        userGoodsIds = JSON.parse(userGoodsIds)
    }

    // 获取所有的抢购商品id
    let allGoodsKeys = await redis.Client0.hKeys(`${KEYS.RUSH_GOODS}${sid}`)
    // 过滤用户自己的商品和黑名单的商品
    allGoodsKeys = allGoodsKeys.filter((idStr) => {
        let id = parseInt(idStr)
        return bidArr.indexOf(id) == -1 && userGoodsIds.indexOf(id) == -1
    })

    if (allGoodsKeys.length == 0) {
        res.send(base.result_ok('ok', { total_count: 0, list: [] }))
        return
    }
    // 获取所有商品并排序
    let data = await redis.Client0.hmGet(`${KEYS.RUSH_GOODS}${sid}`, allGoodsKeys)
    data = data.map((item) => {
        let obj = JSON.parse(item)
        // 设置恶意用户抢购过的商品已售罄
        if (badArr.indexOf(obj.gid) > -1) {
            obj.state = 2
        }
        return obj
    })
    data.sort((a, b) => {
        if (a.state == 0) {
            return 3 - b.state
        } else if (b.state == 0) {
            return a.state - 3
        }
        return a.state - b.state
    })

    let lastGoods = []
    for (let i = limit; i < data.length && i < limit + page_size; i++) {
        lastGoods.push(data[i])
    }

    if (lastGoods.length == 0) {
        res.send(base.result_ok('ok', { total_count: 0, list: [] }))
    } else {
        res.send(
            base.result_ok('ok', {
                total_count: allGoodsKeys.length,
                list: lastGoods,
            })
        )
    }
}

module.exports = rush;