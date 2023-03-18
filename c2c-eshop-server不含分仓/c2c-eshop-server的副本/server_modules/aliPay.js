const AlipaySdk = require('alipay-sdk').default // 引入 SDK

const AlipayFormData = require('alipay-sdk/lib/form').default
let mysql = require('./mysql')
let base = require('./base')
const { env } = require('process')
let config = require('../package.json').config
// const axios = require('axios')
const alipaySdk = new AlipaySdk({
  appId: '2021000119629760', // 开放平台上创建应用时生成的 appId
  signType: 'RSA2', // 签名算法,默认 RSA2
  gateway: config.AlipayGateway || 'https://openapi.alipaydev.com/gateway.do', // 支付宝网关地址 ，沙箱环境下使用时需要修改
  alipayPublicKey:
    config.AlipayPublicKey || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAve00fDBBlVYUedHH+HuPTfil2UyJwum6GCROIsHtexeyGptADQ4MXUeT+hB02/I4POhHbxZSldVu6tuV6k//x/MZmOhKPhVW+4Y7zG7laDWHhcbRkhjjB8ImTvqwas71eM75xwGBT1wY3IMggcvMNutve7mRgHJ17ejf+106lJWQZH8oufcRUCWIE5ENurICS+pZNCa8+uC71CVV7o5P+8M79NKGwAtMNmZBE7LR1IUjJ8twhdkEaQhNA9Fsk5NMXiMYcDqbXZmbI9fFDe8gaHGw1gqTjz7+6hxk0vEIivGa72GhD47niq0ao1IpGDWtUi1Ui+jytcA1uUNswaRjHwIDAQAB', // 支付宝公钥，需要对结果验签时候必填
  privateKey:
    config.AlipayPrivateKey || 'MIIEowIBAAKCAQEArzUB02pBSt+yiFnKlKZSCfEeSpWcdxQed90waeVxMChaWrBfvia41cAiihqR3HO+codisGKXfKzHwRv6aNSzmNSKqEa860IUHBukEVASPK7rBbZDii/vL4LTVRlRzWYe8MZEFPdoh8jIyZZnmb2PneI+vGX66rTV5FMlto2z8jk63nP5oudCOqBxXOXXRBxbianLP2cxjr1vgp9YqBSvnWwy3BXw/LAr63NxIdDuQ3m0kid/l58mxXUHHLHuT0hYpaAttYJzbEDCOSixx9h9Oflxs+Dm4+5nVqAo4PGu8R0zJaKJ/ANumZJuv6MERawPWCx0I3SVVFKh7N224egbWwIDAQABAoIBAC3V5zFg1c35saIcI3Q6ArJZIvyOIU3BtKrU8cpyXOclV2XsSE/dn3ND/YU1qD0NBqC9rGLKmCjkpqltYVg1dPqhd9jIELpXIh2sWYKx+ONpO1DWOtsW6TL7vb/AjPb4JVYF+F+nze/f5i9eqqG8xqqeOp1c7ISkZGSEIBSfA5l1URPhvjWIN4XjsygmhXB8QR2dtdglwYTRVACuSGLrVDpTVTh8vV6OV8LM0gHPnaTzv3bCPr+xWA53qlG3QwBduYBy3vvdZD598tcm+X7GGg4ZAfe5cFm6vBfdG8tvBGpfqG8oxHdCn8BoIi46gU4Hr9JBtVxRuuEUfZLmDE6jRTECgYEA+Y0MWptRmHYMqLyi9WHnVOLpucjXF00T0TaUfdYTvCiHEM9stEoEVTK9SXbjjYqKvQUvlSXmIhDpsWMNlAnhfKPNb6JkHwVBA70zbKt7PEzFq4uRLBSPEqguVO80s4Jn4nreFx/MmCdyGFG95Qevbrf9UVNLfYzB55ZpKtydgJkCgYEAs7wfZXb3jZNf8OIsbnpsTugbnwApjuhQoSYY535/C4gDjiBIGFmvGqCxbK+5092KIOsOUgKDA9eQDm/IRFt1rGNZmNbsk5BuUlG0bYi2iArLpBpQiO+6RB0Nzp7fEqzG+13HGN4rPFpEfivjP2WCswWqV1tGkIxPz5/KEkJeEBMCgYAT4WW7jiYY9Eab5rNAwzTvsUgXceWYyJ4si6GWyMg3tC7Wav/o+QCRXQJxaNRGAWR+HHym8Cb+TcSgShjZ01OwX0hNfW1mfz+nsZn4LU0bB66ztOGy1kxzmwxd3dSf/GKUS1+IDhN5h6LyRwjOxyb1thirMuyPqvgDoBruvDab+QKBgBPR6/hpbRUcqljK6DFqqKTu7ZTUFMEglzueEuL8TRA9eH7kym58/VVHYSlmG2zkokXNBfA/PKlgzQ76frAjEc/nyMqU8NO4+qFzRx1JFS/dWOWIzVa8cOLv/UTKuji5+ttfVQRGA6iNH752IoIsNIR/XHBzrU1lW6u+qC7pSKwnAoGBAMbkfTIHDXGep/Rp9IiG9b9FWJ62ezhspe5G2SjHU5E3XeFgRDFsQpjGrg7gIMCyYPxzcCTwAOVhpMCTCyWULFp5szz0OiwdN+qXq4JGJ0ym6jc+zeu+K/Rq6xYP5vaLUjIWo4v6gvDRgJR7aewl+HdtPZTN3qB1tL3s1LylpE+t', // 应用私钥字符串
})

const aliPay = {}

aliPay.getPay = async (
  description,
  order_no,
  total_fee,
  openid,
  uid,
  goods_tag
) => {
  try {
    const formData = new AlipayFormData()
    formData.setMethod('get')
    formData.addField(
      'notify_url',
      // 'https://wx.meetmoma.com/web/alipaycallback'
      config.AliPayNotifyUrl || 'https://wx.meetmoma.com/web/alipaycallback' // 原腾讯云测试服测试链接
    )
    formData.addField('bizContent', {
      outTradeNo: order_no, // 商户订单号,64个字符以内、可包含字母、数字、下划线,且不能重复
      productCode: 'FAST_INSTANT_TRADE_PAY', // 销售产品码，与支付宝签约的产品码名称,仅支持FAST_INSTANT_TRADE_PAY
      totalAmount: '0.01', // 订单总金额，单位为元，精确到小数点后两位
      subject: `当代摩玛商城${goods_tag || 'home'}订单`, // 订单标题
      body: description, // 订单描述
    })
    const result = await alipaySdk.exec(
      'alipay.trade.page.pay', // 统一收单下单并支付页面接口
      {}, // api 请求的参数（包含“公共请求参数”和“业务参数”）
      { formData: formData }
    )
    return result
  } catch (err) {
    console.log(err)
    return null
  }
}

/**
 * 支付回调
 */
aliPay.paycallback = async (req, res) => {
  console.log('---- alipay call back ----')
  try {
    const verifyData = alipaySdk.checkNotifySign(req.body)
    if (!verifyData) {
      return res.send('fail')
    }
    const alipayResult = req.body
    const tradeStatus = alipayResult && alipayResult.trade_status
    if (!tradeStatus) {
      return res.send('fail')
    }
    switch (tradeStatus) {
      case 'WAIT_BUYER_PAY':
        res.send('success')
        break
      case 'TRADE_CLOSED':
        res.send('success')
        break
      case 'TRADE_SUCCESS':
        const mode = alipayResult.subject.includes('home') ? 'home' : 'rush'
        await aliPay.updateGood(alipayResult.out_trade_no, mode)
        res.send('success')
        break
      case 'TRADE_FINISHED':
        res.send('success')
        break
      default:
        res.send('success')
    }
  } catch (e) {
    res.send('fail')
  }
}

aliPay.updateGood = async (order_no, goods_tag) => {
  try {
    if (goods_tag == 'home') {
      let order_info = await mysql.query(
        'SELECT * FROM user_order_shelves WHERE order_no=?',
        order_no
      )
      if (order_info.length == 0) {
        console.log(`没有查询到订单 ${order_no}`)
        return
      }
      order_info = order_info[0]
      let list = JSON.parse(order_info.goods_info)

      for (let i = 0; i < list.length; i++) {
        await mysql.query(
          'UPDATE goods_shelves SET count=count-? WHERE gid=?',
          [list[i].count, list[i].gid]
        )
      }
      await mysql.query(
        'UPDATE user_order_shelves SET pay_state=1 WHERE order_id=? AND uid=?',
        [order_info.order_id, order_info.uid]
      )
      return base.result_ok('ok')
    } else {
      let order_info = await mysql.query(
        'SELECT * FROM user_order_publish WHERE order_no=?',
        order_no
      )
      if (order_info.length == 0) {
        return base.result_error('没有查询到订单')
      }
      order_info = order_info[0]

      let sql =
        'UPDATE goods_rush SET state=1,last_price=price,price=?,publish_order_no=? WHERE gid=? AND state=0 AND belong=?'
      let sql_result = await mysql.query(sql, [
        order_info.newprice,
        order_no,
        order_info.gid,
        order_info.uid,
      ])

      // 更新原抢购用户订单状态
      let goods_rush_info = await mysql.query(
        'SELECT * FROM goods_rush WHERE gid=? AND belong=?',
        [order_info.gid, order_info.uid]
      )
      goods_rush_info = goods_rush_info[0]
      await mysql.query('UPDATE user_order SET pay_state=2 WHERE order_id=?', [
        goods_rush_info.current_order_id,
      ])

      await base.updateUserBelong([order_info.uid])
      await mysql.query(
        'UPDATE user_order_publish SET pay_state=1 WHERE order_no=? AND uid=?',
        [order_info.order_no, order_info.uid]
      )
      return base.result_ok('ok')
    }
  } catch (e) {
    console.log('🚀 ~ file: aliPay.js ~ line 187 ~ aliPay.updateGood= ~ e', e)
  }
}

module.exports = aliPay
