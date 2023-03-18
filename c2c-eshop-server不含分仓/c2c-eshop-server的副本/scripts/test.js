const mysql = require('mysql')
var qr = require('qr-image')
let fs = require('fs')
var co = require('co')
var OSS = require('ali-oss')
const moment = require('moment')
const XLSX=require('xlsx')
const config = require('../package.json').config
var client = new OSS({
  region: config.OssRegion,
  accessKeyId: config.OssAccessKeyId,
  accessKeySecret: config.OssAccessKeySecret,
  bucket: config.OssBucket,
})

const pool = mysql.createPool({
  host: '39.99.242.7',
  user: 'root',
  password: 'DigiCostarDB))1',
  database: 'c2c_eshop',
  port: 30001,
  charset: 'utf8',
  timezone: '08:00',
  multipleStatements: true,
})

const sqlquery = function (sql, params) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
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
const run = async () => {
  // user表
  const workbook = [['商品id','商品名称', '原商品归属人uid','订单收货人姓名','收货地址省份','收货地址城市','收货地址区','收货地址详情','订单创建时间']]
  const goods = await sqlquery('SELECT * FROM goods_rush where belong>3136')
  for (let good of goods) {
    let order = await sqlquery(`select * from user_order where uid=${good.belong} and gid=${good.gid} order by create_time desc limit 1`)
    if(order.length>0){
        const addressInfo = JSON.parse(order[0].address_info)
        workbook.push([good.gid, good.name, good.belong, addressInfo.name, addressInfo.province, addressInfo.city,addressInfo.county, addressInfo.detail, addressInfo.create_time])
        // console.info(good.gid, good.name, good.belong, addressInfo.name, addressInfo.detail)
    }
  }
  const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(workbook)
    XLSX.utils.book_append_sheet(wb, ws)
    XLSX.writeFile(wb, `可能存在问题货物清单.xlsx`, {
        compression: true,
    })
// let count = 0
// let target = 0
//   const users = await sqlquery('SELECT * FROM user where uid>3136 and state=1')
//   for(let user of users){
//       count++
//       if(user.payee_name){
//         const address_info = await sqlquery(`SELECT uid FROM user_order where uid>3136 and address_info like '%${user.payee_name}%'`)
//         if(address_info.length>0){
//             console.info(user.uid,user.payee_name,user.nickname,address_info[0].uid)
//             target++
//         } else {
//             const address = await sqlquery(`SELECT uid FROM user_address where uid>3136 and name like '%${user.payee_name}%'`)
//             if(address.length>0 && address[0].uid!==user.uid){
//                 console.info(user.uid,user.payee_name,user.nickname,address[0].uid)
//             target++
//             }
//         }
//       } else {
//       }
//   }
  console.info('done')
  process.exit(1)
}

// run()
const test = async () => {
  let sqlArr = []
  for (let i = 3503; i< 3600;i++){
      const str =  `INSERT INTO user (uid, state) VALUES (${i}, -1)`
      sqlArr.push(str)
  }
  console.info(sqlArr.join(';'))
}

test( )
