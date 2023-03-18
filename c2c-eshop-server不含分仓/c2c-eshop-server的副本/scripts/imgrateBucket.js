const mysql = require('mysql')
const XLSX = require('xlsx')
const moment = require('moment')

// const config = {
//   register_url: 'https://wx.meetmoma.com/register',
//   OssRegion: 'oss-cn-beijing',
//   OssBucket: 'meetingmoma-eshop',
//   OssAccessKeyId: 'LTAI5tM6A7bqmun8Y2CeDpzN',
//   OssAccessKeySecret: 'TnFaaCQK5uEBrPmMSA2Z4atJkgHiQd',
// }
// const config = require('../package.json').config
// var client = new OSS({
//   region: config.OssRegion,
//   accessKeyId: config.OssAccessKeyId,
//   accessKeySecret: config.OssAccessKeySecret,
//   bucket: config.OssBucket,
// })

// const pool = mysql.createPool({
//   host: '8.142.134.247',
//   user: 'root',
//   password: 'DigiCostarDB))1',
//   database: 'c2c_eshop',
//   port: 30001,
//   charset: 'utf8',
//   timezone: '08:00',
//   multipleStatements: true,
// })

const momapool = mysql.createPool({
    host: '123.56.23.211',
    user: 'root',
    password: 'DigiCostarDB))1',
    database: 'c2c_eshop',
    port: 30001,
    charset: 'utf8',
    timezone: '08:00',
    multipleStatements: true,
  })

// const sqlquery = async (sql, params) => {
//   return new Promise(function (resolve, reject) {
//     pool.getConnection(function (err, connection) {
//       if (err) {
//         console.error(
//           moment().format() + ' sql.query:' + err + '----sql:' + sql
//         )
//         reject(err)
//       }
//       // console.error(sql, params)
//       connection.query(sql, params, function (err, result) {
//         if (err) {
//           console.error(
//             moment().format() +
//               '\n #### sql.query:' +
//               err +
//               '\n----sql:' +
//               sql +
//               '\n----param:' +
//               params
//           )
//           reject(err)
//         }

//         //console.log(result);
//         resolve(result)
//       })
//       //回收pool
//       connection.release()
//     })
//   })
// }

const momasqlquery = async (sql, params) => {
    return new Promise(function (resolve, reject) {
        momapool.getConnection(function (err, connection) {
        if (err) {
          console.error(
            moment().format() + ' sql.query:' + err + '----sql:' + sql
          )
          reject(err)
        }
        // console.error(sql, params)
        connection.query(sql, params, function (err, result) {
          if (err) {
            console.error(
              moment().format() +
                '\n #### sql.query:' +
                err +
                '\n----sql:' +
                sql +
                '\n----param:' +
                params
            )
            reject(err)
          }
  
          //console.log(result);
          resolve(result)
        })
        //回收pool
        connection.release()
      })
    })
  }





const getRecursionUids = (uids, users) => {
    let searchUids = []
    users.forEach((v) => {
      if (
        !uids.includes(v.uid) &&
        (uids.includes(v.level1_recommender) ||
          uids.includes(v.level2_recommender))
      ) {
        searchUids.push(v.uid)
      }
    })
    // 找不到包含的粉丝uid时，终止递归
    if (searchUids.length === 0) {
      return
    }
    uids.push(...searchUids)
    getRecursionUids(uids, users)
  }
  
  
  // 获取所有用户
  const getAllUsers = async () => {
    let sql = `SELECT uid, nickname, phone, level1_recommender, level2_recommender, roles FROM user WHERE state > -1`
    let users = await momasqlquery(sql, [])
    return users
  }

  const run  = async (uid) => {
    const users = await getAllUsers()
    const curUser = users.find((v) => v.uid === uid)
    const allUids = [uid]
    getRecursionUids(allUids, users)
    for(let aUid of allUids){
      const user = users.find((v) => v.uid === aUid)
      if(user){
        console.info('uid:',user.uid, 'nickname:',user.nickname,'phone:',user.phone,)
      }
      await momasqlquery(`update user set bucket_id = 43 where uid = ?`, [aUid])
    }
    // let sql = `SELECT * FROM goods_rush WHERE belong IN (${allUids.join(',')}) AND state > -1`
    // let allGoods = await momasqlquery(sql, allUids)
    // const allGids = allGoods.map(v=>v.gid).filter(Boolean)
    // console.log('🚀 ~ file: imgrateBucket.js ~ line 146 ~ run ~ allGids', allGoods)
    // const workbook = [['用户id','nickname','phone']]
    // if(allUids.length>0){
    //     for(let aUid of allUids){
    //         const user = users.find((v) => v.uid === aUid)
    //         if(user){
    //             workbook.push([aUid,user.nickname,user.phone])
    //         }
    //     }
    // }
    // workbook.push(['','',''])
    // workbook.push(['商品id','商品编码','商品名称','商品短描述','商品所属人id'])
    // for(let good of allGoods){
    //     const belongUser = users.find(v=>v.uid===good.belong)
    //     workbook.push([good.gid,good.code,good.name,good.summary,(belongUser&&belongUser.uid) || '',(belongUser&&belongUser.nickname) || ''])
    // }
    // const wb = XLSX.utils.book_new()
    // const ws = XLSX.utils.aoa_to_sheet(workbook)
    // XLSX.utils.book_append_sheet(wb, ws)
    // XLSX.writeFile(wb, `${curUser.nickname}用户和抢购商品清单.xlsx`, {
    //     compression: true,
    // })
    // //goods_rush
    // sql = `update goods_rush set state = -1 where gid in (${allGids.join(',')})`
    // await momasqlquery(sql,[])
    // sql = `update goods_rush set state = -1 where gid NOT in (${allGids.join(',')})`
    // await sqlquery(sql,[])

    // // goods_rush_schedule_map
    // sql = `DELETE FROM goods_rush_schedule_map where gid in (${allGids.join(',')})`
    // await momasqlquery(sql,[])
    // sql = `DELETE FROM goods_rush_schedule_map where gid NOT in (${allGids.join(',')})`
    // await sqlquery(sql,[])

    // // user
    // sql = `update user set state = -1 where uid in (${allUids.join(',')})`
    // await momasqlquery(sql,[])
    // sql = `update user set state = -1 where uid NOT in (${allUids.join(',')})`
    // await sqlquery(sql,[])

    // // user_withdraw
    // sql = `update user_withdrawal set state = -1 where uid NOT in (${allUids.join(',')})`
    // await sqlquery(sql,[])

    process.exit(1)
  }
  run(12)