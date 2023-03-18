let rush = {};
let package_json = require('../../package.json');
let base = require('../base');
let mysql = require('../mysql');
let moment = require('moment');
let KEYS = require('../redis_key');
let redis = require('../redis');

let wx_pay = require('../wx_pay');
let aliPay = require('../aliPay')
let coupon = require('./coupon')
let order = require('./order')
const winston = require('winston')

/**
 * 获取抢购场次【2】
 * @param {*} req
 * @param {*} res
 */
// TODO:v2
rush.getRushSchedule = async (req, res) => {
  let token_info = await base.checkToken(req)
  let uid = 0
  if (token_info.res_code > 0) {
    uid = token_info.data.uid
  }
  let user_info = token_info.data
  let data = await redis.updateGet(KEYS.RUSH_SCHEDULE, async () => {
    let sql =
      'SELECT *,state schedule_state FROM rush_schedule ORDER BY starttime ASC '
    let sql_result = await mysql.query(sql, [])
    return sql_result
  })

  let gtime = 0
  if (uid > 0) {
    // await rush.newUserPrivilege(user_info); // 废弃不用
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
 * 获取用户提前抢购时间
 * @param {*} req
 * @param {*} res
 */
rush.getUserGTime = async (req, res) => {
  let token_info = await base.checkToken(req)
  let uid = 0
  if (token_info.res_code > 0) {
    uid = token_info.data.uid
  }
  let sid = parseInt(req.body.sid)
  let user_info = token_info.data

  let gtime = 0
  if (uid > 0) {
    // await rush.newUserPrivilege(user_info); // 废弃不用
    // 查看用户是否设置上帝之手
    let god = await redis.getUserGodState(uid)
    
    if (god && god.godtime.use) {
      if(sid&&sid > 0){
        let success_count = await redis.Client2.get(
          `special_success_${user_info.uid}_${sid}_count`
        )
        success_count = parseInt(success_count)
        // 检查用户有没有秒杀数量限制，如果有是否已经满足
        if (success_count >= god.limit.data) {
          gtime = 0
        } else {
          gtime = parseInt(god.godtime.data) * 1000
        }
      } else {
        gtime = parseInt(god.godtime.data) * 1000
      }
    }
  }

  let lastData = {
    gtime: gtime,
  }

  res.send(base.result_ok('ok', lastData))
  return
}

/**
 * 获取抢购物品列表【2】
 * @param {*} req
 * @param {*} res
 * @returns
 */
// TODO:v2
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

  // 分仓用户只能看仓内商品
  if (user_info.bucket_id > 0) {
    let bucket_goods = await redis.Client2.get(
      `${KEYS.BUCKET_GOODS_LIST}${user_info.bucket_id}`
    )
    if (bucket_goods != null) {
      bucket_goods = JSON.parse(bucket_goods)
    } else {
      bucket_goods = []
    }

    let filterKeys = []
    // 分仓发布的商品有可能不在同一场次，所以过滤下
    bucket_goods.forEach((b) => {
      if (allGoodsKeys.indexOf(b.toString()) > -1) {
        filterKeys.push(b.toString())
      }
    })
    allGoodsKeys = filterKeys
  } else {
    // 不是分仓用户只能看普通商品
    let bkeys = await redis.Client2.keys(`${KEYS.BUCKET_GOODS_LIST}*`)

    if (bkeys && bkeys.length > 0) {
      let bucket_goods = []
      for (let i = 0; i < bkeys.length; i++) {
        let bitem_goods = await redis.Client2.get(bkeys[i])
        if (bitem_goods != null) {
          bitem_goods = JSON.parse(bitem_goods)
          if (bitem_goods.length > 0) {
            bucket_goods = bucket_goods.concat(bitem_goods)
          }
        }
      }
      let filterKeys = []
      allGoodsKeys.forEach((b) => {
        if (bucket_goods.indexOf(parseInt(b)) == -1) {
          filterKeys.push(b)
        }
      })
      allGoodsKeys = filterKeys
    }
  }

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

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({
      filename: 'http-back.log',
      maxsize: '100m',
      maxFiles: 50,
      rotationFormat: () => {
        return moment().format('YYYY-MM-DD.log')
      },
    }),
    // new winston.transports.Console()
  ],
})

/**
 * 抢购【2】
 * @param {*} req
 * @param {*} res
 * @returns
 */
rush.shoot = async (req, res) => {
  let token_info = await base.checkToken(req)
  if (token_info.res_code < 0) {
    res.send(token_info)
    return
  }
  let user_info = token_info.data
  if(!(user_info.level1_recommender > 0)&&user_info.roles.indexOf(1) == -1){
    res.send(base.result_error('很遗憾,您没有抢到'))
    return
  }

  let gid = parseInt(req.body.gid)
  let sid = parseInt(req.body.sid)

  let address_info = req.body.address_info

  if (!(gid > 0) || !(sid > 0)) {
    res.send(base.result_error('抢购失败!'))
    return
  }

  if (!(user_info.level1_recommender > 0) && user_info.roles.indexOf(1) == -1) {
    res.send(base.result_error('很遗憾,您没有抢到'))
    return
  }

  // 初始化时间
  let curTime = new Date()
  let y = curTime.getFullYear()
  let M = curTime.getMonth()
  let d = curTime.getDate()
  let expiresTime = new Date(y, M, d + 1, 0, 0, 0) // 过期时刻
  let timeout = Math.floor((expiresTime.getTime() - curTime.getTime()) / 1000) // 计算Timeout: 当前晚上12点过期

  // 恶意用户直接失败
  if (user_info.bad == 1) {
    let badlist = await redis.Client2.get(
      `${KEYS.USER_BADLIST}${user_info.uid}`
    )
    if (badlist) {
      badlist = JSON.parse(badlist)
    } else {
      badlist = []
    }
    if (badlist.indexOf(gid) == -1) {
      badlist.push(gid)
    }
    await redis.Client2.setEx(
      `${KEYS.USER_BADLIST}${user_info.uid}`,
      timeout,
      JSON.stringify(badlist)
    )
    res.send(base.result_error('很遗憾,您没有抢到'))
    return
  }

  let mode = parseInt(req.body.mode)
  let data = base.result_error('商品抢购失败')
  if (mode == 1) {
    data = await rush.shootNormal(
      user_info,
      curTime,
      y,
      M,
      d,
      timeout,
      gid,
      sid,
      address_info
    )
  } else if (mode == 2) {
    let god = await redis.getUserGodState(user_info.uid)
    data = await rush.shootSpecial(
      user_info,
      curTime,
      y,
      M,
      d,
      timeout,
      gid,
      sid,
      address_info,
      god
    )
  }
  res.send(data)
  let loginfo = {
    uid: user_info.uid,
    sid: sid,
    gid: gid,
    ...data,
  }
  logger.info(
    `${moment().format('YYYY-MM-DD HH:mm:ss')}\t${JSON.stringify(loginfo)}`
  )
}

/**
 * 特权抢购
 */
rush.shootSpecial = async (
  user_info,
  curTime,
  y,
  M,
  d,
  timeout,
  gid,
  sid,
  address_info,
  god
) => {
  // 没有特权抢购权限
  if (!(god.limit.use && god.godtime.use)) {
    return base.result_error('优先抢购数量已用完，请等待正式抢购!')
  }

  // 检查抢购的商品是不是用户不可见的商品
  if (god.blacklist.use) {
    let findGoods = god.blacklist.data.find((item) => {
      return item.gid == gid
    })

    // 如果是，抢购失败（此情况发生证明数据出现了BUG，或者用户非法手段抢购）
    if (findGoods) {
      return base.result_error('抢购失败!')
    }
  }

  // 获取已经成功抢购的数量
  let success_count = await redis.Client2.get(
    `special_success_${user_info.uid}_${sid}_count`
  )
  success_count = parseInt(success_count)
  // 检查用户有没有秒杀数量限制，如果有是否已经满足
  if (success_count >= god.limit.data) {
    return base.result_error('优先抢购数量已用完，请等待正式抢购!')
  }

  // 提前时间
  let godTime = god.godtime.data
  // 取出场次
  let schedules = await redis.updateGet(KEYS.RUSH_SCHEDULE, async () => {
    let sql = 'SELECT * FROM rush_schedule ORDER BY starttime ASC '
    let sql_result = await mysql.query(sql, [])
    return sql_result
  })
  let findS = schedules.find((s) => {
    return s.id == sid
  })
  // 没有找到场次信息
  if (!findS) {
    return base.result_error('当前场次抢购失败!')
  }
  // 如果抢购场次已暂停
  if (findS.state != 1) {
    let tip = findS.tip
    if (!tip) {
      tip = '当前抢购已暂停抢购'
    }
    return base.result_error(tip)
  }
  let lastTime = curTime.getTime() + godTime * 1000 // 当前时间毫秒数
  let startArr = findS.starttime.split(':')
  let endArr = findS.endtime.split(':')
  let starttime = new Date(
    y,
    M,
    d,
    parseInt(startArr[0]),
    parseInt(startArr[1]),
    parseInt(startArr[2])
  ).getTime() // 当前场次开始时间
  let endtime = new Date(
    y,
    M,
    d,
    parseInt(endArr[0]),
    parseInt(endArr[1]),
    parseInt(endArr[2])
  ).getTime() // 当前场次结束时间

  if (!(lastTime >= starttime && lastTime < endtime)) {
    return base.result_error('当前时间抢购失败!')
  }

  // 条件符合，进队列抢购
  let lastCount = await redis.Client0.HINCRBY(
    `${KEYS.RUSH_GOODS_COUNTER}${sid}`,
    `${gid}`,
    -1
  )

  if (parseInt(lastCount) == 0) {
    // 生成订单
    let goods = await redis.Client0.HGET(
      `${KEYS.RUSH_GOODS}${sid}`,
      gid.toString()
    )
    if (!goods) {
      console.log('system err.')
      return base.result_error('当前商品抢购失败!')
    }
    goods = JSON.parse(goods)
    let order_id = await order.createRushOrder(
      user_info.uid,
      goods,
      sid,
      address_info
    )

    // 更新抢购商品状态
    // 20220113: 设置委托上架时间
    // let sql = "SELECT * FROM other_config WHERE id=6";
    // let sql_result = await mysql.query(sql, []);
    // const launchTime = (sql_result[0]&&sql_result[0].value1) || 2
    let sql =
      'UPDATE goods_rush SET rusher_id=?,state=2,next_time=?,current_order_id=? WHERE gid=?'
    // next_time存场次结束时间，这个接口里取上架的小时和是否上架
    await mysql.query(sql, [
      user_info.uid,
      moment(endtime) /*.add(launchTime, 'hours')*/
        .format('YYYY-MM-DD HH:mm:ss'),
      order_id,
      gid,
    ]) // 上架时间设置成抢购场次结束后2小时

    // 更新到抢购列表
    let data = await mysql.query('SELECT * FROM goods_rush WHERE gid=?', gid)
    await redis.Client0.hSet(
      `${KEYS.RUSH_GOODS}${sid}`,
      gid.toString(),
      JSON.stringify(data[0])
    )

    try {
      let ok_log = await redis.Client3.hGet(
        `${KEYS.LOG_SCHEDULE_RUSH_OK}${sid}`,
        `${user_info.uid}`
      )
      if (ok_log) {
        await redis.Client3.hIncrBy(
          `${KEYS.LOG_SCHEDULE_RUSH_OK}${sid}`,
          `${user_info.uid}`,
          1
        )
      } else {
        await redis.Client3.hSet(
          `${KEYS.LOG_SCHEDULE_RUSH_OK}${sid}`,
          `${user_info.uid}`,
          '1'
        )
      }
    } catch {}

    // 更新记录特权抢购数量
    if (
      await redis.Client2.exists(
        `special_success_${user_info.uid}_${sid}_count`
      )
    ) {
      await redis.Client2.INCRBY(
        `special_success_${user_info.uid}_${sid}_count`,
        1
      )
    } else {
      await redis.Client2.setEx(
        `special_success_${user_info.uid}_${sid}_count`,
        timeout,
        '1'
      )
    }
    return base.result_ok('抢购成功，请尽快支付!')
  } else if (lastCount < 0) {
    await redis.Client0.HINCRBY(`${KEYS.RUSH_GOODS_COUNTER}${sid}`, `${gid}`, 1)
    return base.result_error('已抢完')
  } else {
    await redis.Client0.HINCRBY(`${KEYS.RUSH_GOODS_COUNTER}${sid}`, `${gid}`, 1)
    return base.result_error('抢购失败!')
  }
}

/**
 * 正常抢购
 */
rush.shootNormal = async (
  user_info,
  curTime,
  y,
  M,
  d,
  timeout,
  gid,
  sid,
  address_info
) => {
  // 获取已经成功抢购的数量
  let success_count = await redis.getUserRushSuccess(user_info.uid, sid)
  success_count = parseInt(success_count)

  // 检查用户有没有秒杀数量限制，如果有是否已经满足
  let common_count = await redis.Client2.get(`${KEYS.USER_COMMON_LIMIT}`)
  if (common_count == null) {
    let sql = 'SELECT * FROM other_config WHERE id=5'
    let sql_result = await mysql.query(sql, [])
    common_count = sql_result[0].value1
    await redis.Client2.set(
      `${KEYS.USER_COMMON_LIMIT}`,
      common_count.toString()
    )
  } else {
    common_count = parseInt(common_count)
  }
  if (common_count > 0) {
    if (success_count >= common_count) {
      return base.result_error('当日抢购数量已达上限!')
    }
  }

  // 取出场次
  let schedules = await redis.updateGet(KEYS.RUSH_SCHEDULE, async () => {
    let sql = 'SELECT * FROM rush_schedule ORDER BY starttime ASC '
    let sql_result = await mysql.query(sql, [])
    return sql_result
  })
  let findS = schedules.find((s) => {
    return s.id == sid
  })
  // 没有找到场次信息
  if (!findS) {
    return base.result_error('当前场次抢购失败!')
  }
  // 如果抢购场次已暂停
  if (findS.state != 1) {
    let tip = findS.tip
    if (!tip) {
      tip = '当前抢购已暂停抢购'
    }
    return base.result_error(tip)
  }
  let lastTime = curTime.getTime() // 当前时间毫秒数
  let startArr = findS.starttime.split(':')
  let endArr = findS.endtime.split(':')
  let starttime = new Date(
    y,
    M,
    d,
    parseInt(startArr[0]),
    parseInt(startArr[1]),
    parseInt(startArr[2])
  ).getTime() // 当前场次开始时间
  let endtime = new Date(
    y,
    M,
    d,
    parseInt(endArr[0]),
    parseInt(endArr[1]),
    parseInt(endArr[2])
  ).getTime() // 当前场次结束时间

  if (!(lastTime >= starttime && lastTime < endtime)) {
    return base.result_error('当前时间抢购失败!')
  }

  // 条件符合，进队列抢购
  let lastCount = await redis.Client0.HINCRBY(
    `${KEYS.RUSH_GOODS_COUNTER}${sid}`,
    `${gid}`,
    -1
  )

  if (parseInt(lastCount) == 0) {
    // 生成订单
    let goods = await redis.Client0.HGET(
      `${KEYS.RUSH_GOODS}${sid}`,
      gid.toString()
    )
    if (!goods) {
      console.log('system err.')
      return base.result_error('抢购失败!')
    }
    goods = JSON.parse(goods)
    let order_id = await order.createRushOrder(
      user_info.uid,
      goods,
      sid,
      address_info
    )

    // 更新抢购商品状态
    // 20220113: 设置委托上架时间
    // let sql = "SELECT * FROM other_config WHERE id=6";
    // let sql_result = await mysql.query(sql, []);
    // const launchTime = (sql_result[0]&&sql_result[0].value1) || 2
    let sql =
      'UPDATE goods_rush SET rusher_id=?,state=2,next_time=?,current_order_id=? WHERE gid=?'
    // next_time存场次结束时间，这个接口里取上架的小时和是否上架
    await mysql.query(sql, [
      user_info.uid,
      moment(endtime) /*.add(launchTime, 'hours')*/
        .format('YYYY-MM-DD HH:mm:ss'),
      order_id,
      gid,
    ]) // 上架时间设置成抢购场次结束后2小时

    // 更新到抢购列表
    let data = await mysql.query('SELECT * FROM goods_rush WHERE gid=?', gid)
    await redis.Client0.hSet(
      `${KEYS.RUSH_GOODS}${sid}`,
      gid.toString(),
      JSON.stringify(data[0])
    )
    await redis.setUserRushSuccess(user_info.uid, sid, timeout, 1)

    try {
      let ok_log = await redis.Client3.hGet(
        `${KEYS.LOG_SCHEDULE_RUSH_OK}${sid}`,
        `${user_info.uid}`
      )
      if (ok_log) {
        await redis.Client3.hIncrBy(
          `${KEYS.LOG_SCHEDULE_RUSH_OK}${sid}`,
          `${user_info.uid}`,
          1
        )
      } else {
        await redis.Client3.hSet(
          `${KEYS.LOG_SCHEDULE_RUSH_OK}${sid}`,
          `${user_info.uid}`,
          '1'
        )
      }
    } catch {}

    return base.result_ok('抢购成功，请尽快支付!', {
      u: user_info.uid,
      c: lastCount,
      pc: parseInt(lastCount),
    })
  } else if (lastCount < 0) {
    // await redis.Client0.HINCRBY(`${KEYS.RUSH_GOODS_COUNTER}${sid}`, `${gid}`, 1);
    return base.result_error('很遗憾,您没有抢到', {
      u: user_info.uid,
      c: lastCount,
      pc: parseInt(lastCount),
    })
  } else {
    // await redis.Client0.HINCRBY(`${KEYS.RUSH_GOODS_COUNTER}${sid}`, `${gid}`, 1);
    return base.result_error('很遗憾,您没有抢到', {
      u: user_info.uid,
      c: lastCount,
      pc: parseInt(lastCount),
    })
  }
}

/**
 * 上架前支付
 * @param {*} req
 * @param {*} res
 * @returns
 */
// 获取支付参数
rush.payPrepare = async (req, res) => {
  let token_info = await base.checkToken(req)
  if (token_info.res_code < 0) {
    res.send(token_info)
    return
  }
  let user_info = token_info.data

  let gid = parseInt(req.body.gid)
  if (!(gid > 0)) {
    res.send(base.result_error('商品id错误'))
    return
  }
  let relate_order_id = parseInt(req.body.relate_order_id)
  if (!(relate_order_id > 0)) {
    // res.send(base.result_error("关联商品id错误"));
    // return;
    relate_order_id = 0
  }
  let newprice = parseInt(req.body.newprice)
  if (!(newprice > 0)) {
    res.send(base.result_error('发布价格错误'))
    return
  }
  let oldprice = parseInt(req.body.oldprice)
  if (!(oldprice > 0)) {
    res.send(base.result_error('原价格错误'))
    return
  }
  let payprice = parseInt(req.body.payprice)
  if (!(payprice > 0)) {
    res.send(base.result_error('手续费价格错误'))
    return
  }
  let rate = Number(req.body.rate)
  if (!(rate > 0)) {
    res.send(base.result_error('费率错误'))
    return
  }

  // 检查是否到可以上架时间
  // 20220113: 设置委托上架时间
  let sql = `SELECT * FROM goods_rush WHERE gid=${gid}`
  let goodsRush = await mysql.query(sql, [])
  const endTime = goodsRush[0] && goodsRush[0].next_time
  sql = 'SELECT * FROM other_config WHERE id=6'
  let sql_result = await mysql.query(sql, [])
  const launchTime =
    ((sql_result[0] && sql_result[0].value1) || 2) * 60 * 60 * 1000
  if (endTime) {
    let endTimestamp = new Date(endTime).getTime()
    if (Date.now() - endTimestamp < launchTime) {
      res.send(base.result_error('商品未到上架时间，还不允许上架'))
      return
    }
  }

  let coupon_id = Number(req.body.coupon_id)
  if (!(coupon_id > 0)) {
    coupon_id = 0
  }

  let order_info = await order.createPublishOrder(
    user_info.uid,
    gid,
    newprice,
    oldprice,
    payprice,
    rate,
    coupon_id,
    relate_order_id
  )

  // 订单显示名称
  let gname = `抢购商品:${goodsRush.name} ${goodsRush.code}${goodsRush.gid}`
  if (gname.length == 0) {
    gname = `抢购商品:${goodsRush.code}${goodsRush.gid}`
  } else if (gname.length > 127) {
    gname = gname.substring(0, 120) + '...'
  }

  let payprepare = await wx_pay.getPay(
    gname,
    order_info.order_no,
    payprice,
    user_info.open_id,
    user_info.uid,
    gid
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
 * 上架前支付宝支付
 * @param {*} req
 * @param {*} res
 * @returns
 */
// 获取支付链接
rush.aliPayPrepare = async (req, res) => {
  let token_info = await base.checkToken(req)
  if (token_info.res_code < 0) {
    res.send(token_info)
    return
  }
  let user_info = token_info.data

  let gid = parseInt(req.body.gid)
  if (!(gid > 0)) {
    res.send(base.result_error('商品id错误'))
    return
  }
  let relate_order_id = parseInt(req.body.relate_order_id)
  if (!(relate_order_id > 0)) {
    // res.send(base.result_error("关联商品id错误"));
    // return;
    relate_order_id = 0
  }
  let newprice = parseInt(req.body.newprice)
  if (!(newprice > 0)) {
    res.send(base.result_error('发布价格错误'))
    return
  }
  let oldprice = parseInt(req.body.oldprice)
  if (!(oldprice > 0)) {
    res.send(base.result_error('原价格错误'))
    return
  }
  let payprice = parseInt(req.body.payprice)
  if (!(payprice > 0)) {
    res.send(base.result_error('手续费价格错误'))
    return
  }
  let rate = Number(req.body.rate)
  if (!(rate > 0)) {
    res.send(base.result_error('费率错误'))
    return
  }

  // 检查是否到可以上架时间
  // 20220113: 设置委托上架时间
  let sql = `SELECT * FROM goods_rush WHERE gid=${gid}`
  let goodsRush = await mysql.query(sql, [])
  const endTime = goodsRush[0] && goodsRush[0].next_time
  sql = 'SELECT * FROM other_config WHERE id=6'
  let sql_result = await mysql.query(sql, [])
  const launchTime =
    ((sql_result[0] && sql_result[0].value1) || 2) * 60 * 60 * 1000
  if (endTime) {
    let endTimestamp = new Date(endTime).getTime()
    if (Date.now() - endTimestamp < launchTime) {
      res.send(base.result_error('商品未到上架时间，还不允许上架'))
      return
    }
  }

  let coupon_id = Number(req.body.coupon_id)
  if (!(coupon_id > 0)) {
    coupon_id = 0
  }

  let order_info = await order.createPublishOrder(
    user_info.uid,
    gid,
    newprice,
    oldprice,
    payprice,
    rate,
    coupon_id,
    relate_order_id
  )

  // 订单显示名称
  let gname = `抢购商品:${goodsRush.name} ${goodsRush.code}${goodsRush.gid}`
  if (gname.length == 0) {
    gname = `抢购商品:${goodsRush.code}${goodsRush.gid}`
  } else if (gname.length > 127) {
    gname = gname.substring(0, 120) + '...'
  }

  let payprepare = await aliPay.getPay(
    gname,
    order_info.order_no,
    payprice,
    user_info.open_id,
    user_info.uid,
    gid
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
 * 投诉订单【2】
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
rush.disputeOrder = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("商品id错误"));
        return;
    }

    let dispute = req.body.dispute;
    if (dispute == null || dispute == "") {
        res.send(base.result_error("请详细描述投诉内容"));
        return;
    }
    dispute = dispute.replace(/\s*/g, "");
    if (dispute == "") {
        res.send(base.result_error("请详细描述投诉内容"));
        return;
    }

    let sql = "SELECT * FROM goods_rush WHERE gid=? AND state IN (2,3) AND belong=?";

    let sql_result = await mysql.query(sql, [gid, user_info.uid]);
    if (sql_result.length == 0) {
        res.send(base.result_error("当前订单暂不能投诉"));
        return;
    }

    await mysql.query("UPDATE user_order SET dispute=? WHERE gid=? AND order_id=?", [dispute, gid, sql_result[0].current_order_id]);
    await mysql.query("UPDATE goods_rush SET state=5 WHERE gid=? AND state IN (2,3) AND belong=?", [gid, user_info.uid]);
    res.send(base.result_ok("已投诉，请耐心等待管理员解决"));
    return;
};


/**
 * 设置支付截图（买家操作）
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
rush.setPayPic = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("商品id错误"));
        return;
    }

    // 更新商品状态
    let sql = "UPDATE goods_rush SET state=3 WHERE rusher_id=? AND state=2 AND gid=?";
    let sql_result = await mysql.query(sql, [user_info.uid, gid]);

    res.send(base.result_ok("ok"));
    return;

};


/**
 * 支付确认(卖家操作)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
rush.payAck = async (req, res) => {
    let token_info = await base.checkToken(req);
    if (token_info.res_code < 0) {
        res.send(token_info);
        return;
    }
    let user_info = token_info.data;
    let gid = parseInt(req.body.gid);
    if (!(gid > 0)) {
        res.send(base.result_error("商品id错误"));
        return;
    }

    let order_id = parseInt(req.body.order_id);
    if (!(order_id > 0)) {
        res.send(base.result_error("订单id错误"));
        return;
    }

    let order_no = req.body.order_no;
    if (!order_no) {
        res.send(base.result_error("订单号错误"));
        return;
    }

    let price = parseInt(req.body.price); // 确认是实际支付的钱还是总钱数
    if (!(price > 0)) {
        res.send(base.result_error("订单价格错误"));
        return;
    }

    let findRusher = `SELECT a.*,b.belong,b.publish_order_no FROM user a INNER JOIN goods_rush b ON a.uid=b.rusher_id WHERE b.gid=? AND b.state=3 AND b.belong=?`;
    let rusher_info = await mysql.query(findRusher, [gid, user_info.uid]);
    if (rusher_info.length == 0) {
        res.send(base.result_error("订单状态异常"));
        return;
    }
    rusher_info = rusher_info[0];

    await mysql.query("UPDATE user_order_publish SET hassale=1 WHERE order_no=? AND uid=?", [rusher_info.publish_order_no, rusher_info.belong]);

    let sql = "UPDATE goods_rush SET state=0,last_belong=belong,belong=rusher_id,rusher_id=0 WHERE gid=? AND state=3 AND belong=? AND current_order_id=?";
    let sql_result = await mysql.query(sql, [gid, user_info.uid, order_id]);
    if (sql_result.affectedRows == 1) {

        // 更新订单
        sql = `UPDATE user_order SET pay_state=1 WHERE order_no=?`;
        await mysql.query(sql, [order_no]);

        // 更新推荐人收益
        if (rusher_info.level1_recommender > 0) {
            // 获取收益率
            let rate = await mysql.query("SELECT * FROM other_config WHERE id=2");
            if (rate.length > 0) {
                rate = rate[0].value3;
            } else {
                rate = 3;
            }
            let income = parseInt(price * rate * 0.001);
            let r1income = await mysql.query("SELECT * FROM user_income WHERE uid=?", [rusher_info.level1_recommender]);
            let beforeTotal = 0;
            let beforeAvaliable = 0;
            if (r1income.length > 0) {
                r1income = r1income[0];
                beforeTotal = r1income.income_total;
                beforeAvaliable = r1income.income;
                await mysql.query("UPDATE user_income SET income_total=income_total+?,income=income+?,income_order_count=income_order_count+1 WHERE uid=?", [income, income, rusher_info.level1_recommender]);
            } else {
                await mysql.query("INSERT INTO user_income (uid,income_total,income,income_order_count) VALUES (?,?,?,1)", [rusher_info.level1_recommender, income, income]);
            }
            await mysql.query(`INSERT INTO user_income_record (uid,order_id,order_no,fans_level,fans_uid,before_total_income,before_available_income,income,rate) 
            VALUES (?,?,?,?,?,?,?,?,?)`, [rusher_info.level1_recommender, order_id, order_no, 1, rusher_info.uid, beforeTotal, beforeAvaliable, income, rate]);
        }
        if (rusher_info.level2_recommender > 0) {
            // 获取收益率
            let rate = await mysql.query("SELECT * FROM other_config WHERE id=3");
            if (rate.length > 0) {
                rate = rate[0].value3;
            } else {
                rate = 2;
            }
            let income = parseInt(price * rate * 0.001);
            let r1income = await mysql.query("SELECT * FROM user_income WHERE uid=?", [rusher_info.level2_recommender]);
            let beforeTotal = 0;
            let beforeAvaliable = 0;
            if (r1income.length > 0) {
                r1income = r1income[0];
                beforeTotal = r1income.income_total;
                beforeAvaliable = r1income.income;
                await mysql.query("UPDATE user_income SET income_total=income_total+?,income=income+?,income_order_count=income_order_count+1 WHERE uid=?", [income, income, rusher_info.level2_recommender]);
            } else {
                await mysql.query("INSERT INTO user_income (uid,income_total,income,income_order_count) VALUES (?,?,?,1)", [rusher_info.level2_recommender, income, income]);
            }
            await mysql.query(`INSERT INTO user_income_record (uid,order_id,order_no,fans_level,fans_uid,before_total_income,before_available_income,income,rate) 
            VALUES (?,?,?,?,?,?,?,?,?)`, [rusher_info.level2_recommender, order_id, order_no, 2, rusher_info.uid, beforeTotal, beforeAvaliable, income, rate]);
        }

        res.send(base.result_ok("ok"));
        return;
    }
    res.send(base.result_ok("ok"));
};

// ---- private ----
/**
 * 生成抢购商品计数器
 * @param {*} data 
 */
rush.createRushGoodsCounter = async (data) => {
    let map = new Map();
    data.forEach(d => {
        map.set(`goods${d.gid}`, 1);
    });

    await redis.Client0.del(KEYS.RUSH_GOODS_COUNTER);
    await redis.Client0.hSet(KEYS.RUSH_GOODS_COUNTER, map);
};

// ---- 抢购Redis操作 ----

/**
 * 获取新用户特权
 * @param {*} uid 
 */
rush.newUserPrivilege = async (user_info) => {
    if (user_info.first_enter == 1) {
        let data = await mysql.query("SELECT * FROM other_config WHERE id=4");
        if (data.length > 0) {
            // 计算Timeout: 当前晚上12点过期
            let curTime = new Date();
            let y = curTime.getFullYear();
            let M = curTime.getMonth();
            let d = curTime.getDate();
            let expiresTime = new Date(y, M, d + parseInt(data[0].value2), 0, 0, 0);
            let timeout = Math.floor((expiresTime.getTime() - curTime.getTime()) / 1000);
            await redis.setUserGodTime(user_info.uid, true, parseInt(data[0].value3), timeout);
            await redis.setUserLimit(user_info.uid, true, data[0].value1, timeout);
            await mysql.query("UPDATE user SET first_enter=0 WHERE uid=?", [user_info.uid]);
        }
    }

    return 0;
};


/**
 * 使用新用户特权【说明：修改需求后，获取场次列表的时候就更新使用掉了】
 * @param {*} uid 
 */
rush.useNewUserPrivilege = async (user_info) => {
    // let data = await mysql.query("UPDATE user SET first_enter=0 WHERE uid=?", [user_info.uid]);
};



module.exports = rush;