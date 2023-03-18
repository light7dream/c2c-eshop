# API文档

后台API服务同时为前端的移动端的应用提供接口服务，同时也为管理员的后台管理提供API服务。

# 一、前台相关接口

地址前缀：`/web/`

## 1 用户相关（user）

###  用户注册

* 地址：`user/register`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "nickname":"小小收藏家",
      "phone":"15136388552",
      "sms_code":"864502",
      "pwd":"123456",
      "rid":0
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "注册成功"
  }
  ```

  

###  用户登录

* 地址：`user/login`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "phone":"15136388552",
      "pwd":"123456"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "登录成功",
      "data":{
      	"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",
          "nickname": "小小收藏家",
          "phone": "15200089521",
          "avatar": "xxx"
      }
  }
  ```
  



###  刷新Token

* 地址：`user/refreshToken`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9"
  }
  ```





###  获取用户信息

* 地址：`user/getInfo`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "登录成功",
      "data":{
      	"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",
          "nickname": "小小收藏家",
          "phone": "15200089521",
          "avatar": "xxx"
      }
  }
  ```

  



###  修改密码

* 地址：`user/resetPwd`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "cur_pwd":"123456",
      "new_pwd":"123456"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "密码修改成功,请重新登录"
  }
  ```



###  重置密码（验证码重置）

* 地址：`user/resetPwdSmsCode`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "phone":"15136388552",
      "sms_code":"445966",
      "new_pwd":"123456"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "密码修改成功,请重新登录"
  }
  ```

  

### 更新用户信息（包括昵称、银行卡信息）

* 地址：`user/updateUserInfo`

* 接口方式：`POST`

* 参数：（**以下参数均可选**）

  ```json
  {
      "nickname":"荒野之息",
      "avatar":"xxx",
      "gender":2,
      "email":"xx@xx.xx",
      "payee_name":"小树叶",
      "payee_bankno":"622245884652254",
      "payee_bankname":"建设银行中关村支行"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```




* 

### 获取粉丝数据

* 地址：`user/getFnasList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10,
      "level":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "today_count": 1,
          "total_count": 10
      }
  }
  ```

  



### 获取粉丝列表

* 地址：`user/getFansList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10,
      "level":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "total_count": 1,
          "list": [
              {
                  "nickname": "fans",
                  "avatar": "https://sxxxxx.png",
                  "phone": "15200089521",
                  "create_time": "2021-11-29 23:28:11"
              }
          ]
      }
  }
  ```




### 获取粉丝订单

* 地址：`user/getFansOrder`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "list": [
              {
                  "order_no": "D2112291210020001199",
                  "level": 1,
                  "fans_uid": 119,
                  "income": 4306,
                  "rate": 0,
                  "fans_nickname": "熊",
                  "fans_avatar": "",
                  "goods_name": "蜘蛛女郎",
                  "code": "M00A",
                  "g_price": 1435623
              }
          ]
      }
  }
  ```




### 获取粉丝订单统计信息

* 地址：`user/getFansOrderInfo`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "orders_total_price": 4306,
          "orders_total_count": 1
      }
  }
  ```

  





### 用户登出（退出登录）

* 地址：`user/logout`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```

  

### 修改昵称

* 地址：`user/editNickname`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "nickname":"sxx"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "修改成功"
  }
  ```

  

### 修改头像

* 地址：`user/editAvatar`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "avatar":"sxx"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "修改成功"
  }
  ```

### 上传微信收款码/支付宝收款码

* 地址：`user/editReceiptCode`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "imgUrl":"sxx", // 收款码url
      "type": "wxpay_img" // 只接受以下两种类型：wxpay_img: 微信收款码， alipay_img: 支付宝收款码
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "修改成功"
  }
  ```

  

### 查询推荐人信息

* 地址：`user/whoIsRecommender`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "rid":"Fct3idDrv=="
  }
  ```

* 返回值：

  ```json
  {
      "rid": 1,
      "rname": "小树叶",
      "rphone":15500010001
  }
  ```

  











## 2 公共接口（common）

### 获取商品分类

* 地址：`common/getCategory`

* 接口方式：`POST`

* 参数：`无`

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "cid": 0,
              "name": "全部",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          },
          {
              "cid": 1,
              "name": "原作手绘",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          },
          {
              "cid": 2,
              "name": "艺术微喷",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          },
          {
              "cid": 3,
              "name": "限量版画",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          },
          {
              "cid": 4,
              "name": "摄影艺术",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          },
          {
              "cid": 5,
              "name": "艺术海报",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          },
          {
              "cid": 6,
              "name": "雕塑摆件",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          },
          {
              "cid": 7,
              "name": "潮流手办",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          },
          {
              "cid": 8,
              "name": "最新作品",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          }
      ]
  }
  ```

  

### 获取公告信息

* 地址：`common/getNotice`

* 接口方式：`POST`

* 参数：`无`

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "nid": 1,
              "summary": "请及时更新收款信息",
              "notice": "收款信息是非常重要的哦，不然卖出去的东东就收不到钱了",
              "no": 0,
              "state": 1,
              "create_time": "2021-11-29 15:49:53",
              "update_time": "2021-11-29 15:59:49"
          }
      ]
  }
  ```




### 获取Banner列表地址

* 地址：`common/getBannerList`

* 接口方式：`POST`

* 参数：`无`

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "gid": 14,
              "cid": 2,
              "name": "2",
              "summary": "3",
              "description": "3",
              "price": 1,
              "img": "[]"
          }
      ]
  }
  ```




### 获取货架（首页）商品列表

* 地址：`common/getGoodsList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "cid": 0,
      "name":"xx"
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "gid": 14,
              "cid": 2,
              "name": "2",
              "summary": "3",
              "description": "3",
              "price": 1,
              "img": "[]"
          }
      ]
  }
  ```




### 获取协议基础地址

* 地址：`common/getProtocolBaseUrl`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "protocol":"sss"
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": 'http://xxxx'
  }
  ```

  



### 获取协议

* 地址：`common/getProtocol`

* 接口方式：`GET`

* 参数：

  ```json
  {
      "protocol":"sss"
  }
  ```

  

* 返回值：

  ```json
  page content.
  ```
  



### 获取上架手续费率

* 地址：`common/getHandlingFeeRate`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": 4
  }
  ```

  ### 获取商品委托上架时间

* 地址：`common/getGoodsLaunchTime`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": 2 // 单位为小时
  }
  ```

  ### 获取全平台商品上架功能状态

* 地址：`common/getAllGoodsLaunchStatus`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": 1 // 1为打开， 0为关闭，默认关闭
  }
  ```

  ### 获取商品上架涨幅

* 地址：`common/getGoodsLaunchGain`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": 6 // 计算时注意转成6%计算
  }
  ```

  





## 3 收益相关

### 获取总收益统计信息

* 地址：`income/getIncomeInfo`

* 接口方式：`POST`

* 参数：`无`

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "uid": 1,
          "income_total": 0,
          "income": 0,
          "withdrawal": 0,
          "income_order_count": 0,
          "update_time": "2021-11-29 23:33:52"
      }
  }
  ```




### 获取收益记录

* 地址：`income/getIncomeRecord`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "total_count": 1,
          "list": [
              {
                  "id": 1,
                  "uid": 1,
                  "order_id": 1,
                  "order_no": "xxxx",
                  "fans_level": 1,
                  "fans_uid": 2,
                  "before_total_income": 0,
                  "before_available_income": 0,
                  "income": 100,
                  "create_time": "2021-11-29 23:39:00"
              }
          ]
      }
  }
  ```




### 获取提现记录

* 地址：`income/getWithdrawalRecord`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "total_count": 1,
          "list": [
              {
                  "id": 1,
                  "uid": 1,
                  "before_total_income": 100,
                  "before_availble_income": 100,
                  "amount": 100,
                  "state": 2,
                  "msg": "",
                  "create_time": "2021-11-29 23:39:26",
                  "verify_time": "2021-11-29 23:39:26"
              }
          ]
      }
  }
  ```

  

## 4 地址相关

### 获取收获地址

* 地址：`address/getList`

* 接口方式：`POST`

* 参数：`无`

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "id": 2,
              "uid": 1,
              "name": "李四光",
              "phone": "18212344333",
              "province": "北京市",
              "city": "北京市",
              "county": "朝阳区",
              "detail": "柳芳西里26号",
              "isdefault": 1,
              "create_time": "2021-11-29 23:48:45"
          }
      ]
  }
  ```



### 添加收获地址

* 地址：`address/add`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "name":"张三",
      "phone":"15212344567",
      "province":"山东省",
      "city":"济南市",
      "county":"xx区",
      "detail":"纬三路123号xxx",
      "isdefault":0
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "添加成功"
  }
  ```



### 修改收货地址

* 地址：`address/update`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "id":1,
      "name":"刘能",
      "phone":"18212344333",
      "province":"北京市",
      "city":"北京市",
      "county":"朝阳区",
      "detail":"柳芳西里26号",
      "isdefault":1
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```



### 删除收获地址

* 地址：`address/delete`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "id":1
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```





## 5 快递相关

### 获取我的快递信息

* 地址：`user_parcel/getList`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "id": 1,
              "uid": 2,
              "order_id": 3,
              "parcel": "SF100023344400",
              "parcel_state": 1,
              "state": 1,
              "create_time": "2021-12-03 14:11:34",
              "update_time": "2021-12-03 14:24:50"
          }
      ]
  }
  ```



### 申请发货

* 地址：`user_parcel/needParcel`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "order_id":1
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "申请成功"
  }
  ```





### 确认收货

* 地址：`user_parcel/ack`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "id":1
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```



### 删除收货信息

* 地址：`user_parcel/delete`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "id":1
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```



## 6 验证码相关

### 获取验证码（注册）

* 地址：`sms/getCodeByRegister`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "phone":"15200089521"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "验证码已发送"
  }
  ```

  

### 获取验证码（找回密码）

* 地址：`sms/getCodeByFindPwd`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "phone":"15200089521"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "验证码已发送"
  }
  ```

  

## 7 OSS

### 获取临时上传权限

* 地址：`oss/getAuth`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "authType":"15200089521"
  }
  ```

* 返回值：

  ```json
  {
      "success": true,
      "data": {
          "region": "oss-cn-beijing",
          "endpoint": "oss-cn-beijing.aliyuncs.com",
          "bucket": "costar-eshop",
          "accessKeyId": "STS.NUBU3zeJQ9KLQeDoxWyNJs5KW",
          "accessKeySecret": "GJubRVBKDD2RVf7isYjZQ2GapRCrjaPT5LWkazwNXAdS",
          "stsToken": "CAIS3QJ*********HonOiJVwjHU=",
          "filepath": "/"
      }
  }
  ```




## 8 抢购相关

### 获取抢购场次

* 地址：`rush/getRushSchedule`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data":{
          "list": [
              {
                  "id": 2,
                  "name": "上午8点场2",
                  "starttime": "08:00:00",
                  "endtime": "09:30:00"
              }
      	],
          "time":121435,
          "gtime":0
      }
  }
  ```




### 获取抢购的商品

* 地址：`rush/getRushGoods`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "cid": 1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "gid": 7,
              "cid": 0,
              "name": "首饰",
              "summary": "首饰",
              "description": "首饰",
              "img": "[]",
              "base_price": 1,
              "last_price": 0,
              "price": 1,
              "rusher_id": 1,
              "belong": 1,
              "last_belong": 1,
              "real_path": "[]",
              "show_path": "[]",
              "state": 1,
              "create_time": "2021-12-07 23:47:16",
              "update_time": "2021-12-07 23:47:16",
              "origin": 0,
              "origin_type":1
          }
      ]
  }
  ```

  

### 上传抢购商品支付截图

* 地址：`rush/setPayPic`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid": 1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
  }
  ```




### 唤起支付参数【TODO】

* 地址：`rush/payPrepare`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid": 1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
  }
  ```

### 支付宝接入唤起支付参数

* 地址：`rush/aliPayPrepare`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid": 1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": "https://openapi.alipaydev.com/gateway.do?method=alipay.trade.page.pay&app_id=2021000119629760&charset=utf-8&version=1.0&sign_type=RSA2&timestamp=2022-03-08%2019%3A15%3A19&notify_url=https%3A%2F%2Fdigicostar.com%2Fweb%2Falipaycallback&sign=nyQSDDEHXHD3hQTU64hiqltDTN47HTSbEfpcBw8kh3eF7CLVWaOW77wnYh2ftuV7uutSEnphjMVf6J7F9yLC1%2FjhWW1MnefpGUyMOYRY9JVNkxCCGzixeAwdNLbnOM3PtMlU49j%2BpDY8HCxcz0VNREopZ9vB6kqUeu%2Bly1Eb3V%2Bn5WTzC%2FZJBT0ZNsdmAAn%2Fm7KRXJIRA7Zzx9uE3lakF9NOiZJdifSYMxDEV1y5XmRT3ykp0PBK61GTqibp654qVJBqFhq2mZR1GSA9iaPKjgO%2BwQsQvXtUhA5JgqeodKjMg4txDpUxpT3zxI5QdIIHcGivCEdV8rWde5QHyFjToQ%3D%3D&alipay_sdk=alipay-sdk-nodejs-3.2.0&biz_content=%7B%22out_trade_no%22%3A%22H2203081915150017135%22%2C%22product_code%22%3A%22FAST_INSTANT_TRADE_PAY%22%2C%22total_amount%22%3A%220.01%22%2C%22subject%22%3A%22%E5%BD%93%E4%BB%A3%E6%91%A9%E7%8E%9B%E5%95%86%E5%9F%8Ehome%E8%AE%A2%E5%8D%95%22%2C%22body%22%3A%22%E5%AE%87%E5%AE%99%E5%A5%B3%E5%AD%A9(%E9%97%AD%E7%9C%BC)%22%7D"
  }
  ```




### 上架支付【TODO】

* 地址：`rush/setPayPic`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid": 1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
  }
  ```




### 确认收款（卖家操作）

* 地址：`rush/setPayPic`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid": 1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
  }
  ```

  

### 支付确认（买家操作）

* 地址：`rush/setPayPic`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid": 1，
      "order_id":1,
      "order_no":"DX121343454",
      "price":2333400
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
  }
  ```

  

## 9 用户商品相关

### 获取货架商品详情

* 地址：`user_goods/getGoodsDetail`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid": 1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "gid": 2,
          "name": "大萝卜",
          "price": 3,
          "count": 3,
          "description": "大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜",
          "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/d43b3ebb-0071-4774-a245-5f28309d4bcb.png\"]",
          "update_time": "2021-12-07 09:52:45"
      }
  }
  ```



### 我的购物车（待支付）商品

* 地址：`user_goods/myCart`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "gid": 2,
          "name": "大萝卜",
          "price": 3,
          "count": 3,
          "description": "大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜",
          "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/d43b3ebb-0071-4774-a245-5f28309d4bcb.png\"]",
          "update_time": "2021-12-07 09:52:45"
      }
  }
  ```



### 我已支付的商品

* 地址：`user_goods/myPayedGoods`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "gid": 2,
              "name": "真野恵里菜 写真集 『 陽炎 - KAGEROH - 』日本原版进口",
              "rusher_id": 12,
              "saler_name": "13100001001",
              "price": 48000,
              "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/1716adbd-a725-4641-94a6-a5fff5b69d48.png\"]",
              "state": 3,
              "update_time": "2021-12-12 22:46:11"
          }
      ]
  }
  ```



### 我拥有的商品

* 地址：`user_goods/myGoods`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "gid": 2,
              "name": "真野恵里菜 写真集 『 陽炎 - KAGEROH - 』日本原版进口",
              "rusher_id": 12,
              "buyer_name": "13100001001",
              "price": 48000,
              "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/1716adbd-a725-4641-94a6-a5fff5b69d48.png\"]",
              "state": 3,
              "update_time": "2021-12-12 22:46:11"
          }
      ]
  }
  ```



### 添加购物车

* 地址：`user_goods/addCart`

* 接口方式：`POST`

* 参数：

  ```json
  {
  	"gid":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```



### 添加购物车列表

* 地址：`user_goods/myCartList`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "gid": 12,
              "cid": 7,
              "code": "C00A",
              "name": " 村上隆Xcomplex con",
              "summary": " 村上隆Xcomplex con",
              "description": "村上隆 x Complex con限量版Mr.DOB雕塑潮流艺术摆",
              "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/60c48fa7-55c3-43eb-a25e-d9328d38f320.png\"]",
              "price": 1,
              "count": 2,
              "belong": 0,
              "state": 1,
              "create_time": "2022-01-06 11:26:19",
              "update_user_id": 0,
              "update_time": "2022-01-02 19:00:13",
              "id": 6,
              "uid": 130,
              "selected": 1,
              "goods_count": 3
          }
      ]
  }
  ```





### 获取货架商品支付参数【TODO】

* 地址：`order/purchasePrepare`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "gid": 2,
          "name": "大萝卜",
          "price": 3,
          "count": 3,
          "description": "大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜",
          "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/d43b3ebb-0071-4774-a245-5f28309d4bcb.png\"]",
          "update_time": "2021-12-07 09:52:45"
      }
  }
  ```

### 获取货架商品支付宝支付参数【TODO】

* 地址：`order/alipayPurchasePrepare`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

 ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": "https://openapi.alipaydev.com/gateway.do?method=alipay.trade.page.pay&app_id=2021000119629760&charset=utf-8&version=1.0&sign_type=RSA2&timestamp=2022-03-08%2019%3A15%3A19&notify_url=https%3A%2F%2Fdigicostar.com%2Fweb%2Falipaycallback&sign=nyQSDDEHXHD3hQTU64hiqltDTN47HTSbEfpcBw8kh3eF7CLVWaOW77wnYh2ftuV7uutSEnphjMVf6J7F9yLC1%2FjhWW1MnefpGUyMOYRY9JVNkxCCGzixeAwdNLbnOM3PtMlU49j%2BpDY8HCxcz0VNREopZ9vB6kqUeu%2Bly1Eb3V%2Bn5WTzC%2FZJBT0ZNsdmAAn%2Fm7KRXJIRA7Zzx9uE3lakF9NOiZJdifSYMxDEV1y5XmRT3ykp0PBK61GTqibp654qVJBqFhq2mZR1GSA9iaPKjgO%2BwQsQvXtUhA5JgqeodKjMg4txDpUxpT3zxI5QdIIHcGivCEdV8rWde5QHyFjToQ%3D%3D&alipay_sdk=alipay-sdk-nodejs-3.2.0&biz_content=%7B%22out_trade_no%22%3A%22H2203081915150017135%22%2C%22product_code%22%3A%22FAST_INSTANT_TRADE_PAY%22%2C%22total_amount%22%3A%220.01%22%2C%22subject%22%3A%22%E5%BD%93%E4%BB%A3%E6%91%A9%E7%8E%9B%E5%95%86%E5%9F%8Ehome%E8%AE%A2%E5%8D%95%22%2C%22body%22%3A%22%E5%AE%87%E5%AE%99%E5%A5%B3%E5%AD%A9(%E9%97%AD%E7%9C%BC)%22%7D"
  }
```



### 货架商品支付【TODO】

* 地址：`order/purchaseAck`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "gid": 2,
          "name": "大萝卜",
          "price": 3,
          "count": 3,
          "description": "大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜大萝卜",
          "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/d43b3ebb-0071-4774-a245-5f28309d4bcb.png\"]",
          "update_time": "2021-12-07 09:52:45"
      }
  }
  ```



## 10 优惠券相关

### 获取我的优惠券列表

* 地址：`coupon/getCouponList`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "id": 2,
              "uid": 9,
              "cid": 2,
              "state": 1,
              "time_valid": "2021-11-11 00:00:00",
              "create_time": "2021-12-14 18:23:54",
              "update_time": "2021-12-14 18:23:54",
              "name": "10元优惠券",
              "description": "1. 发布单品的时候可以使用\n2. 手续费满足100元时可以抵扣\n3. 优惠券有有效期，请及时使用\n4. 最终解释权归公司所有",
              "value": 1000,
              "threshold": 343400,
              "valid_day": 1
          }
      ]
  }
  ```











# 二、后台相关接口

地址前缀：`/admin/`

## 1 商品分类管理

### 获取商品分类

* 地址：`common/getCategory`

* 接口方式：`POST`

* 参数：`无`

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "cid": 0,
              "name": "全部",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          },
          {
              "cid": 1,
              "name": "原作手绘",
              "img": "",
              "state": 1,
              "create_time": "2021-11-28 18:26:44"
          }
      ]
  }
  ```

  



###  新增分类

* 地址：`/category/add`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "name":"新增分类",
      "img":"http://172.51.216.72:9000/s/dhrxlg"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "添加成功",
      "data":9
  }
  ```



###  修改分类

* 地址：`/category/update`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "cid":9,
      "name":"修改分类",
      "state":1,
      "img":"http://172.51.216.72:9000/s/dhrxlg"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```



###  删除分类

* 地址：`/category/delete`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "cid":9
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```



## 2 公告管理

### 获取公告信息

* 地址：`common/getNotice`

* 接口方式：`POST`

* 参数：`无`

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "nid": 1,
              "summary": "请及时更新收款信息",
              "notice": "收款信息是非常重要的哦，不然卖出去的东东就收不到钱了",
              "no": 0,
              "state": 1,
              "create_time": "2021-11-29 15:49:53",
              "update_time": "2021-11-29 15:59:49"
          }
      ]
  }
  ```

  

### 添加公告

* 地址：`/notice/add`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "summary":"请及时添加收货地址",
      "notice":"请及时添加收货地址，以便可以正常接受快递。",
      "state":1,
      "no":0
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "添加成功",
      "data": 1
  }
  ```



### 更新公告

* 地址：`/notice/update`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "nid":1,
      "summary":"sssss",
      "notice":"dddddddddddd",
      "state":0,
      "no":0
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```



### 更新公告显示顺序

* 地址：`/notice/updateOrder`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "oldList":[1,2,3],
      "newList":[2,3,1]
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功",
      "data": [
          {
              "id": 1,
              "summary": "xxxx",
              "notice": "xxxxxxx",
              "no": 3,
              "state": 1,
              "create_time": "2021-11-29 15:49:53",
              "update_time": "2021-11-29 15:59:49"
          }
      ]
  }
  ```





### 删除公告

* 地址：`/notice/delete`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "nid":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```



## 3 优惠券管理

### 获取优惠券

* 地址：`/coupon/getCoupon`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "id": 1,
              "name": "满减券",
              "description": "1.禁止恶意套现 2.解释权归xx所有",
              "value": 1200,
              "threshold": 10000,
              "valid_day": 180,
              "state": 1,
              "create_time": "2021-11-29 16:51:57"
          }
      ]
  }
  ```



### 添加优惠券

* 地址：`/coupon/add`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "name":"满减券",
      "description":"1.禁止恶意套现 2.解释权归xx所有",
      "value":1200,
      "threshold":10000,
      "valid_day":180
  }
  ```
  
* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "添加成功",
      "data": 1
  }
  ```



### 更新优惠券

* 地址：`/coupon/update`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "id":1,
      "name":"满减券2",
      "description":"1.禁止恶意套现 2.解释权归xx所有",
      "value":1000,
      "threshold":5000,
      "valid_day":180,
  }
  ```
  
* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```



### 删除优惠券

* 地址：`/coupon/delete`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "id":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```



### 获取用户优惠券列表

* 地址：`/coupon/getUserCoupon`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "id": 2,
              "uid": 9,
              "cid": 2,
              "state": 1,
              "time_valid": "2021-11-11 00:00:00",
              "create_time": "2021-12-14 18:23:54",
              "update_time": "2021-12-14 18:23:54",
              "name": "10元优惠券",
              "description": "1. 发布单品的时候可以使用\n2. 手续费满足100元时可以抵扣\n3. 优惠券有有效期，请及时使用\n4. 最终解释权归公司所有",
              "value": 1000,
              "threshold": 343400,
              "valid_day": 1
          }
      ]
  }
  ```



### 发放优惠券

* 地址：`/coupon/setUserCoupon`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uids":[1,2,3],
      "coupon_id":2
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```





## 4 抢购场次管理

### 获取抢购场次列表

* 地址：`/rush_schedule/getList`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          "list":{
              "id": 1,
              "name": "上午8点场",
              "starttime": "08:00:00",
              "endtime": "10:00:00"
          },
  		"time":"2021-10-12 10:00:01"
      ]
  }
  ```



### 添加抢购场次

* 地址：`/rush_schedule/add`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "name":"上午8点场",
      "starttime":"8:00",
      "endtime":"10:00"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "添加成功",
      "data": 1
  }
  ```



### 更新抢购场次

* 地址：`/rush_schedule/update`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "id":1,
      "name":"上午8点场2",
      "starttime":"8:00",
      "endtime":"9:30"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```



### 删除抢购场次

* 地址：`/rush_schedule/delete`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "id":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```



## 5 快递相关

### 获取快递列表

* 地址：`user_parcel/getList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index": 0,
      "page_size": 10,
      "state": 0,
      "parcel_state":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "total_count": 1,
          "list": [
              {
                  "id": 1,
                  "uid": 2,
                  "order_id": 3,
                  "parcel": "SF100023344400",
                  "parcel_state": 1,
                  "state": 0,
                  "create_time": "2021-12-03 14:11:34",
                  "update_time": "2021-12-03 14:50:12"
              }
          ]
      }
  }
  ```



### 更新快递状态

* 地址：`user_parcel/update`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "id": 1,
      "parcel_state": 2,
      "state":1,
      "parcel":"中通：ZT3432132434"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```



## 6 管理员相关

###  管理员登录

* 地址：`login`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "phone":"15136388552",
      "pwd":"123456"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "登录成功",
      "data":{
      	"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",
          "nickname": "小小收藏家",
          "phone": "15200089521",
          "avatar": "xxx"
      }
  }
  ```



### 用户登出（退出登录）

* 地址：`user/logout`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```

  




###  随机添加用户【测试用】

* 地址：`randomAddUser`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "count":50
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "添加成功"
  }
  ```



###  获取上架手续费率

* 地址：`system/getHandlingFeeRate`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": 4
  }
  ```





###  设置商品上架手续费比例

* 地址：`system/setHandlingFeeRate`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "rate":4
  }
  ```

* 返回值：

  ```json
  {
      "res_code": -1,
      "msg": "设置成功"
  }
  ```

###  获取商品委托上架时间

* 地址：`system/getGoodsLaunchTime`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": 2
  }
  ```

###  设置商品委托上架时间

* 地址：`system/setGoodsLaunchTime`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "time":4 // 委托上架时间，单位:小时
  }
  ```

* 返回值：

  ```json
  {
      "res_code": -1,
      "msg": "设置成功"
  }
  ```

###  获取全平台商品上架功能状态

* 地址：`system/getAllGoodsLaunchStatus`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": 1 // 1为打开，0为关闭，默认打开
  }
  ```


###  设置全平台商品上架功能状态

* 地址：`system/setAllGoodsLaunchStatus`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "state":1 // 只能为1和0，其余值报错
  }
  ```

* 返回值：

  ```json
  {
      "res_code": -1,
      "msg": "设置成功"
  }
  ```

###  获取商品上架涨幅

* 地址：`system/getGoodsLaunchGain`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": 6 // 百分数，计算时注意。 默认6%
  }
  ```


###  设置商品上架涨幅

* 地址：`system/setGoodsLaunchGain`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "rate":4
  }
  ```

* 返回值：

  ```json
  {
      "res_code": -1,
      "msg": "设置成功"
  }
  ```



###  获取推荐人收益比例

* 地址：`system/getIncomeRate`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "level": 1,
              "name": "直接推荐人分成比例",
              "value": 3
          },
          {
              "level": 2,
              "name": "间接推荐人分成比例",
              "value": 1
          }
      ]
  }
  ```



###  设置推荐人收益比例

* 地址：`system/setIncomeRate`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "data": [
          {
              "level": 1,
              "value": 2
          },
          {
              "level": 2,
              "value": 0.5
          }
      ]
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "设置成功"
  }
  ```



###  获取新用户特权

* 地址：`system/getNewUserPrivilege`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "count": 2,
          "time": 10
      }
  }
  ```



###  设置新用户特权

* 地址：`system/setNewUserPrivilege`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "time": 10,
      "count": 2
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "设置成功"
  }
  ```



###  获取订单统计信息

* 地址：`system/getOrderStatistics`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "total_count": 21,
          "total_money": 12773541,
          "today_count": 0,
          "today_money": 0,
          "user_count": 21,
          "first_count": 2
      }
  }
  ```


  ###  获取订单统计信息

* 地址：`system/getFansOrderStatisticsByUser`

* 接口方式：`POST`

* 参数：

  ```json
  {
    "uid": 130
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [{
        "address_info": "{\"id\":15,\"uid\":130,\"name\":\"心情了\",\"phone\":\"15200000000\",\"province\":\"北京市\",\"city\":\"北京市\",\"county\":\"西城区\",\"detail\":\"睡醒没\",\"isdefault\":1,\"create_time\":\"2022-01-01 19:02:03\"}",
        "avatar": "http://costar-eshop.oss-cn-beijing.aliyuncs.com/avatar/130.png",
        "code": "M00A",
        "coupon_id": 0,
        "coupon_price": 0,
        "create_time": "2022-01-01 19:40:39",
        "dispute": "",
        "g_count": 1,
        "g_price": 234512,
        "gid": 2,
        "name": "兔子",
        "nickname": "管理员152",
        "order_id": 1,
        "order_no": "D2201011940390001301",
        "pay_method": 0,
        "pay_state": 1,
        "phone": "15200000000",
        "real_price": 0,
        "saler_id": 1,
        "schedule_id": 8,
        "state": 1,
        "u_coupon_id": 0,
        "uid": 130,
        "update_time": "2022-01-01 19:50:06"
      }
      ...
      ]
  }
  ```


###  获取粉丝当天进场数据和抢购成功数据

* 地址：`system/getFansAccessData`

* 接口方式：`POST`

* 参数：

  ```json
  {
    "s": 1, // 场次id
    "uid": 10, // 需要查询的用户id
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "inList": [{ // 进场粉丝数据
            "uid": 55,
            "nickname": "吴先生",
            "phone": 15874976788
          }
          ...
          ],
          "okList": [{ // 抢购成功粉丝数据
            "uid": 55,
            "nickname": "吴先生",
            "phone": 15874976788
          }
          ...
          ]
      }
  }
  ```







## 7 货架商品相关

###  获取货架商品列表

* 地址：`goods/getGoods`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":20,
      "cid":0,
      "name":"娃",
      "state":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 20,
          "total_count": 1,
          "list": [
              {
                  "gid": 1,
                  "category_id": 0,
                  "name": "吉娃娃",
                  "summary": "吉娃娃",
                  "description": "这是一只狗.",
                  "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/share/test.jpg\"]",
                  "price": 1000000,
                  "count": 1,
                  "belong": 0,
                  "state": 1,
                  "create_time": "2021-12-05 11:28:31",
                  "update_user_id": 0,
                  "update_time": "2021-12-05 11:31:49"
              }
          ]
      }
  }
  ```


###  导出货架商品列表

* 地址：`goods/exportGoods`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "cid":0,
      "name":"娃",
      "state":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": "./xlsx/货架商品列表_2022-03-28_1648461918202.xlsx"
  }
  ```

  

###  添加货架商品

* 地址：`goods/add`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "cid":0,
      "name":"俄罗斯套娃",
      "summary":"",
      "description":"这是一个来自老大哥的礼物.",
      "price":10000,
      "count":3,
      "state":1,
      "img":"[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/share/test.jpg\"]"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "添加成功",
      "data": 1
  }
  ```

  

###  更新货架商品

* 地址：`goods/update`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid":1,
      "cid":0,
      "name":"吉娃娃",
      "summary":"吉娃娃",
      "description":"这是一只狗.",
      "price":1000000,
      "count":1,
      "state":1,
      "img":"[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/share/test.jpg\"]"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```

  

###  删除货架商品

* 地址：`goods/delete`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```

  

## 8 抢购商品相关

###  获取抢购商品列表

* 地址：`goods_rush/getGoods`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":20,
      "cid":0,
      "name":"娃",
      "onsale":1,
      "state":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 5,
          "page_size": 1,
          "total_count": 12,
          "list": [
              {
                  "gid": 7,
                  "code": "M00A",
                  "cid": 0,
                  "name": "Secret Garden: An Inky Treasure Hunt and Coloring Book",
                  "summary": "Johanna fauna that surrounds her home in rural Scotland.",
                  "description": "Tumble inspirational.",
                  "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/7de2d6eb-1eae-4bf5-9980-69bb6d4c8962.png\"]",
                  "base_price": 30000,
                  "last_price": 30000,
                  "price": 31800,
                  "rusher_id": 67,
                  "belong": 69,
                  "last_belong": 67,
                  "real_path": "[]",
                  "show_path": "[]",
                  "state": 0,
                  "create_time": "2021-12-18 19:12:47",
                  "update_time": "2021-12-30 16:21:55",
                  "origin_type": 0,
                  "origin": 0,
                  "next_time": "2021-12-19 16:00:00",
                  "current_order_id": 8,
                  "belong_nickname": "186****29",
                  "belong_phone": "18612967076",
                  "belong_avatar": "",
                  "rusher_nickname": "185****18",
                  "rusher_phone": "18511819981",
                  "rusher_avatar": "",
                  "last_belong_nickname": "185****18",
                  "last_belong_phone": "18511819981",
                  "last_belong_avatar": "",
                  "schedulelist": []
              }
          ]
      }
  }
  ```
  
  
###  导出抢购商品列表

* 地址：`goods_rush/exportGoods`

* 接口方式：`POST`

* 参数：

  ```json
   {
      "cid":0,
      "name":"娃",
      "onsale":1,
      "state":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": "./xlsx/抢购商品列表_2022-03-28_1648461918202.xlsx"
  }
  ```


###  添加抢购商品

* 地址：`goods_rush/add`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "cid":0,
      "name":"俄罗斯套娃",
      "summary":"",
      "description":"这是一个来自老大哥的礼物.",
      "price":10000,
      "onsale":1,
      "state":1,
      "belong":1, // 归属人uid
      "img":"[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/share/test.jpg\"]"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "添加成功",
      "data": 1
  }
  ```

  

###  更新抢购商品

* 地址：`goods_rush/update`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid": 2,
      "cid":4,
      "name": "俄罗斯套娃2",
      "summary": "俄罗斯套娃2",
      "description": "老大哥的礼物.",
      "price": 600,
      "onsale": 0,
      "state": 1,
      "belong":1, // 归属人uid
      "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/share/test.jpg\"]"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "更新成功"
  }
  ```




###  拆分抢购商品

* 地址：`goods_rush/divRushGoods`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "origin_gid":5,
      "sub_gids":[11,16],
      "new_price":67500,
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "拆分成功"
  }
  ```

  



###  删除抢购商品

* 地址：`goods_rush/delete`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```

  

## 9 用户管理相关

###  获取用户列表

* 地址：`user/getList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index": 0,
      "page_size": 20,
      "nickname": "荒野",
      "phone": "1",
      "has_recommender":0,
      "isbad":1,
      "state": 1
  }
  ```

###  导出用户列表

* 地址：`user/exportList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "nickname": "荒野",
      "phone": "1",
      "has_recommender":0,
      "isbad":1,
      "state": 1
  }
  ```

* 参数说明：

  * `nickaname | phone` 可选参数，模糊搜索
  * `has_commender` 可选参数，有效值0或1， 没有推荐人=0 有推荐人=1
  * `isbad`可选参数，有效值0或1，恶意用户=1 普通用户=0
  
* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": "./xlsx/用户列表_2022-03-28_1648461918202.xlsx"
  }
  ```
  
  

###  重置用户密码

* 地址：`user/resetPwd`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":1,
      "pwd":"123456"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "重置成功"
  }
  ```

  

###  解禁用户

* 地址：`user/free`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":2
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "操作成功"
  }
  ```

  

###  禁用用户

* 地址：`user/forbidden`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":2
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "操作成功"
  }
  ```

  

###  删除用户

* 地址：`user/delete`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":2
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```

###  设置管理员

* 地址：`user/setAdminUser`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":2
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "操作成功"
  }
  ```


###  取消管理员

* 地址：`user/removeAdminUser`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":2
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "操作成功"
  }
  ```




###  获取用户订单

* 地址：`user/getOrders`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10,
      "uid":"87",
      "order_type":"buy",
      "order_state":"1"
  }
  ```

* 参数说明：

  order_type 有效值  `buy | sale | all`【可选】

  order_state 有效值 `-1 | 0 | 1`【可选】

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_size": 10,
          "page_index": 0,
          "total_count": 1,
          "list": [
              {
                  "order_id": 8,
                  "order_no": "D2112191543200000683",
                  "uid": 68,
                  "gid": 7,
                  "g_price": 30000,
                  "g_count": 1,
                  "saler_id": 1,
                  "pay_method": 0,
                  "real_price": 0,
                  "coupon_id": 0,
                  "u_coupon_id": 0,
                  "coupon_price": 0,
                  "pay_state": 0,
                  "state": 1,
                  "create_time": "2021-12-19 15:43:20",
                  "update_time": "2021-12-19 15:43:20",
                  "buyer_avatar": "",
                  "buyer_nickname": "185****08",
                  "buyer_phone": "18510872975",
                  "buyer_payeename": "赵",
                  "buyer_bankname": "建行",
                  "buyer_bankno": "18510872975",
                  "saler_avatar": "https://file03.16sucai.com/2017/1100/16sucai_p20161114134_7cf.JPG",
                  "saler_nickname": "超级管理员",
                  "saler_phone": "15136388552",
                  "saler_payeename": "小树叶",
                  "saler_bankname": "建设银行中关村支行",
                  "saler_bankno": "622245884652254",
                  "goods_name": "Secret Garden: An Inky Treasure Hunt and Coloring Book",
                  "goods_img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/7de2d6eb-1eae-4bf5-9980-69bb6d4c8962.png\",\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/1f764d9e-00b8-4566-b6d2-10dece46bf0a.png\"]"
              }
          ]
      }
  }
  ```
  



###  获取所属用户抢购商品

* 地址：`user/getBelongUserRushGoods`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10,
      "uid":"87"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "total_count": 4,
          "list": [
              {
                  "gid": 4,
                  "code": "M00A",
                  "cid": 0,
                  "name": "绘味人间 臻品草原 正宗内蒙羊肉卷",
                  "summary": "绘味人间 臻品草原 正宗内蒙羊肉卷",
                  "description": "商品名称：绘味人间内蒙锡林郭勒羊排商品编号：100016658001商品毛重：1.5kg商品产地：中国内蒙品种：其他类别：羊肋排重量：1000g及以上包装形式：简装原产地：内蒙古国产/进口：国产",
                  "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/7d5b57a3-8049-440f-a9cc-f667e0f89f3c.png\"]",
                  "base_price": 10000,
                  "last_price": 10000,
                  "price": 10600,
                  "rusher_id": 0,
                  "belong": 87,
                  "last_belong": 76,
                  "real_path": "[]",
                  "show_path": "[]",
                  "state": 0,
                  "create_time": "2021-12-18 19:12:47",
                  "update_time": "2021-12-24 11:08:34",
                  "origin_type": 0,
                  "origin": 0,
                  "next_time": "2021-12-24 12:00:00",
                  "current_order_id": 14,
                  "last_belong_nickname": "小张",
                  "last_belong_avatar": "http://costar-eshop.oss-cn-beijing.aliyuncs.com/avatar/76.png",
                  "last_belong_phone": "13999999999",
                  "last_belong_payee_name": "张朝阳",
                  "last_belong_payee_bankname": "交通银行中关村支行",
                  "last_belong_payee_bankno": "6222620910002310658",
                  "rusher_nickname": null,
                  "rusher_avatar": null,
                  "rusher_phone": null,
                  "rusher_payee_name": null,
                  "rusher_payee_bankname": null,
                  "rusher_payee_bankno": null
              }
          ]
      }
  }
  ```

  



###  查看订单支付截图

* 地址：`user/viewOrderPayImg`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid": 69,
      "order_id": 9
  }
  ```

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "id": 8,
              "uid": 69,
              "order_id": 9,
              "img": "http://costar-eshop.oss-cn-beijing.aliyuncs.com/user-pay/69/9/20211219160030.png",
              "create_time": "2021-12-19 16:00:31"
          },
          {
              "id": 11,
              "uid": 69,
              "order_id": 9,
              "img": "http://costar-eshop.oss-cn-beijing.aliyuncs.com/user-pay/69/9/20211219160127.png",
              "create_time": "2021-12-19 16:01:27"
          }
      ]
  }
  ```

  

###  设置用户修改银行卡信息权限

* 地址：`user/setUserEditBankAccess`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid": 69,
      "access": 1
  }
  ```

* 参数说明

  有效值` 0 | 1`，1=可编辑  0=不可编辑

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "设置成功"
  }
  ```



###  设置恶意用户

* 地址：`user/setBadUser`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid": 69,
      "isbad": 1
  }
  ```

* 参数说明

  有效值` 0 | 1`，1=恶意用户  0=普通用户

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "设置成功"
  }
  ```





###  设置用户推荐人

* 地址：`user/setUserRecommender`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid": 69,
      "recommender_id": 1
  }
  ```

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "设置成功"
  }
  ```

  

###  获取指定用户提现申请列表

* 地址：`user/getUserWithdrawalList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index": 0,
      "page_size": 10,
      "uid":76
  }
  ```

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "list": [
              {
                  "id": 3,
                  "uid": 76,
                  "before_total_income": 5000,
                  "before_availble_income": 4700,
                  "amount": 500,
                  "state": 0,
                  "msg": "",
                  "create_time": "2021-12-22 14:29:50",
                  "verify_time": "2021-12-22 14:29:50",
                  "nickname": "139****99",
                  "phone": "13999999999",
                  "avatar": "",
                  "payee_name": "",
                  "payee_bankno": "",
                  "payee_bankname": ""
              }
          ]
      }
  }
  ```

  

###  获取所有提现申请列表

* 地址：`user/getWithdrawalList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index": 0,
      "page_size": 10,
      "state": 1
  }
  ```

* 参数说明

  有效值`-1 | 0 | 1`  拒绝申请=-1  申请中待处理=0  申请通过已打钱=1

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "list": [
              {
                  "id": 3,
                  "uid": 76,
                  "before_total_income": 5000,
                  "before_availble_income": 4700,
                  "amount": 500,
                  "state": 0,
                  "msg": "",
                  "create_time": "2021-12-22 14:29:50",
                  "verify_time": "2021-12-22 14:29:50",
                  "nickname": "139****99",
                  "phone": "13999999999",
                  "avatar": "",
                  "payee_name": "",
                  "payee_bankno": "",
                  "payee_bankname": ""
              }
          ]
      }
  }
  ```

  

###  处理用户提现申请

* 地址：`user/ackUserWithdrawal`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":76,
      "withdrawal_id":3,
      "ack": -1,
      "ack_reason": "已转账"
  }
  ```

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "处理成功"
  }
  ```

  



###  获取可选的推荐人列表

* 地址：`user/getRecommenders`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":76,
      "searchkey": ""
  }
  ```

* 参数说明

  `searchkey`模糊搜索手机号和昵称

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "uid": 85,
              "nickname": "152****00000",
              "phone": "15200000000"
          }
      ]
  }
  ```



###  获取推荐树

* 地址：`user/getRecommenderTree`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值说明

  用户基础信息的递归树形结构

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "uid": 1,
              "nickname": "超级管理员",
              "avatar": "https://file03.16sucai.com/2017/1100/16sucai_p20161114134_7cf.JPG",
              "phone": "15136388552",
              "state": 1,
              "level1_recommender": 0,
              "level2_recommender": 0
          },
          {
              "uid": 2,
              "nickname": "测试用户",
              "avatar": "http://costar-eshop.oss-cn-beijing.aliyuncs.com/avatar/2.png",
              "phone": "18800000001",
              "state": 1,
              "level1_recommender": 1,
              "level2_recommender": 0
          }
      ]
  }
  ```




###  ~~获取推荐树~~[obsolete]

* 地址：`user/getRecommenderTree`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值说明

  用户基础信息的递归树形结构

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "tree": [
              {
                  "uid": 1,
                  "nickname": "超级管理员",
                  "avatar": "https://file03.16sucai.com/2017/1100/16sucai_p20161114134_7cf.JPG",
                  "phone": "15136388552",
                  "state": 1,
                  "level1_recommender": 0,
                  "level2_recommender": 0,
                  "list": []
              },
              {
                  "uid": 76,
                  "nickname": "139****99",
                  "avatar": "",
                  "phone": "13999999999",
                  "state": 1,
                  "level1_recommender": 0,
                  "level2_recommender": 0,
                  "list": [
                      {
                          "uid": 85,
                          "nickname": "152****00000",
                          "avatar": "",
                          "phone": "15200000000",
                          "state": 1,
                          "level1_recommender": 76,
                          "level2_recommender": 0,
                          "list": []
                      }
                  ]
              },
          ],
          "err": []
      }
  }
  
  [
      {
          "uid": 85,
          "nickname": "152****00000",
          "avatar": "",
          "phone": "15200000000",
          "state": 1,
          "level1_recommender": 76,
          "level2_recommender": 0,
      }
  ]
  ```




###  获取投诉订单

* 地址：`user/getDisputeOrder`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10,
  }
  ```

* 返回值说明

  `dispute`属性是投诉内容

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 1,
          "total_count": 1,
          "list": [
              {
                  "gid": 16,
                  "code": "M00A",
                  "cid": 0,
                  "name": "测试物品",
                  "summary": "测试u",
                  "description": "测试",
                  "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-rush/f0258a12-763f-4389-91fa-351c0b4aa939.png\"]",
                  "base_price": 50000,
                  "last_price": 0,
                  "price": 50000,
                  "rusher_id": 67,
                  "belong": 87,
                  "last_belong": 0,
                  "real_path": "[]",
                  "show_path": "[]",
                  "state": 5,
                  "create_time": "2021-12-19 15:57:22",
                  "update_time": "2021-12-28 15:34:44",
                  "origin_type": 0,
                  "origin": 0,
                  "next_time": "2021-12-26 23:30:00",
                  "current_order_id": 9,
                  "order_id": 9,
                  "order_no": "D2112262259560000679",
                  "dispute": "买家没有付款",
                  "belong_nickname": null,
                  "belong_avatar": null,
                  "belong_phone": null,
                  "belong_payee_name": null,
                  "belong_bankno": null,
                  "belong_payee_bankname": null,
                  "rusher_nickname": "185****18",
                  "rusher_avatar": "",
                  "rusher_phone": "18511819981",
                  "rusher_payee_name": "急啊急啊就",
                  "rusher_bankno": "2123123",
                  "rusher_payee_bankname": "123123"
              }
          ]
      }
  }
  ```

  



###  获取提货订单

* 地址：`user/getPickupOrder`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10,
  }
  ```

* 返回值说明

  重要的属性有：

  物流信息：`"parcel_info":null`

  发物流的地址

  ```json
  "address_info": {
                      "id": 12,
                      "uid": 2,
                      "name": "你可以",
                      "phone": "152000000000",
                      "province": "北京市",
                      "city": "北京市",
                      "county": "西城区",
                      "detail": "入户",
                      "isdefault": 1,
                      "create_time": "2021-12-26 23:08:12"
                  },
  ```

  

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "total_count": 3,
          "list": [
              {
                  "gid": 10,
                  "code": "M00A",
                  "cid": 0,
                  "name": "真野恵里菜 写真集 『 陽炎 - KAGEROH - 』日本原版进口",
                  "summary": "真野恵里菜 写真集 『 陽炎 - KAGEROH - 』日本原版进口",
                  "description": "今の真野恵里菜に向き合って下さい。",
                  "img": "[\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/1716adbd-a725-4641-94a6-a5fff5b69d48.png\"]",
                  "base_price": 40000,
                  "last_price": 40000,
                  "price": 42400,
                  "rusher_id": 0,
                  "belong": 2,
                  "last_belong": 68,
                  "real_path": "[]",
                  "show_path": "[]",
                  "state": 6,
                  "create_time": "2021-12-18 19:12:47",
                  "update_time": "2021-12-28 22:20:35",
                  "origin_type": 0,
                  "origin": 0,
                  "next_time": "2021-12-28 23:30:00",
                  "current_order_id": 10,
                  "order_id": 10,
                  "order_no": "D2112282218560000022",
                  "belong_nickname": "测试用户",
                  "address_info": {
                      "id": 12,
                      "uid": 2,
                      "name": "你可以",
                      "phone": "152000000000",
                      "province": "北京市",
                      "city": "北京市",
                      "county": "西城区",
                      "detail": "入户",
                      "isdefault": 1,
                      "create_time": "2021-12-26 23:08:12"
                  },
                  "belong_avatar": "http://costar-eshop.oss-cn-beijing.aliyuncs.com/avatar/2.png",
                  "belong_phone": "18800000001",
                  "belong_payee_name": "18510872975",
                  "belong_bankno": "18510872975",
                  "belong_payee_bankname": "18510872975",
                  "parcel_info": null
              }
          ]
      }
  }
  ```
  
  

###  获取商城订单

* 地址：`user/getShelvesOrder`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index":0,
      "page_size":10,
  }
  ```

* 返回值

  重要的属性有：

  物流信息：`"parcel_info":null`

  发物流的地址

  ```json
  "address_info": {
                      "id": 12,
                      "uid": 2,
                      "name": "你可以",
                      "phone": "152000000000",
                      "province": "北京市",
                      "city": "北京市",
                      "county": "西城区",
                      "detail": "入户",
                      "isdefault": 1,
                      "create_time": "2021-12-26 23:08:12"
                  },
  ```

  

* 返回值

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 10,
          "total_count": 0,
          "list": [
              {
                  "order_id": 6,
                  "order_no": "H2112282140180000022",
                  "uid": 2,
                  "goods_info": "[{\"gid\":2,\"cid\":1,\"code\":\"C00A\",\"name\":\"蒙玛特 丙烯 颜料100ml便携\",\"summary\":\"蒙玛特 丙烯 颜料100ml便携\",\"description\":\"品牌： 法比亚诺\\n\",\"img\":\"[\\\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/6ec35eb3-b5e9-4138-8766-f6602436fc47.png\\\",\\\"http://costar-eshop.oss-cn-beijing.aliyuncs.com/goods-shelves/1608929a-e6bf-48a6-82fd-bcd3aa741052.png\\\"]\",\"price\":18700,\"count\":1,\"belong\":0,\"state\":1,\"create_time\":\"2021-12-11 12:35:18\",\"update_user_id\":0,\"update_time\":\"2021-12-18 19:13:06\",\"goods_count\":396}]",
                  "price": 18700,
                  "pay_method": 0,
                  "real_price": 18700,
                  "coupon_id": 0,
                  "u_coupon_id": 0,
                  "coupon_price": 0,
                  "pay_state": 1,
                  "state": 1,
                  "create_time": "2021-12-28 21:40:18",
                  "update_time": "2021-12-28 21:41:31",
                  "address_info": {
                      "id": 12,
                      "uid": 2,
                      "name": "你可以",
                      "phone": "152000000000",
                      "province": "北京市",
                      "city": "北京市",
                      "county": "西城区",
                      "detail": "入户",
                      "isdefault": 1,
                      "create_time": "2021-12-26 23:08:12"
                  },
                  "buyer_nickname": "测试用户",
                  "buyer_avatar": "http://costar-eshop.oss-cn-beijing.aliyuncs.com/avatar/2.png",
                  "buyer_phone": "18800000001",
                  "parcel_info": null
              }
          ]
      }
  }
  ```

  

###  设置抢购订单信息

* 地址：`sync/setRushOrderInfo`

* 接口方式：`POST`

* 参数说明：

  `state`有效值 1=上架状态 2=已抢购（未付款） 3=已支付 

  `state`和'parcel_info'配合使用：state=6 设置快递 parcel_info=快递单号信息

* 参数：

  ```json
  {
      "state": 1,
      "parcel": "顺丰110"
      "order_id":8
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "已设置"
  }
  ```



###  设置首页货架订单信息

* 地址：`sync/setShelvesOrderInfo`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "parcel": "顺丰110"
      "order_id":8
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "已设置"
  }
  ```



###  获取用户粉丝列表

* 地址：`user/getUserFans`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index": 5,
      "page_size": 1,
      "uid":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 5,
          "page_size": 1,
          "total_count": 7,
          "list": [
              {
                  "uid": 124,
                  "nickname": "何",
                  "avatar": "",
                  "phone": "13683420213",
                  "create_time": "2021-12-29 13:09:36",
                  "level": 2
              }
          ]
      }
  }
  ```



###  获取用指定粉丝订单

* 地址：`user/getUserFansOrder`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "page_index": 5,
      "page_size": 1,
      "uid":119
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 1,
          "list": [
              {
                  "order_no": "D2112291210020001199",
                  "level": 1,
                  "fans_uid": 119,
                  "income": 4306,
                  "rate": 0,
                  "fans_nickname": "熊",
                  "fans_avatar": "",
                  "goods_name": "蜘蛛女郎",
                  "code": "M00A",
                  "g_price": 1435623
              }
          ]
      }
  }
  ```


###  获取所有总经销，或者按管理员ID获取总经销

* 地址：`user/getTopFuns`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [{
        "level1_recommender": 1,
        "level2_recommender": 0,
        "nickname": "坚果",
        "roles": [],
        "uid": 116,
      },{
        "level1_recommender": 1,
        "level2_recommender": 0,
        "nickname": "熊",
        "roles": "[]",
        "uid": 119,
      }]
  }
  ```







## 10 上帝之手



### 获取用户的上帝权限（单用户查看设置）

* 地址：`user_god/getGodState`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid":2
  }
  ```

* 返回值：

  ```json
  {
  	"res_code": 1,
  	"msg": "ok",
  	"data": {
  		"uid": 1,
  		"phone": "15136388552",
  		"avatar": "https://file03.16sucai.com/2017/1100/16sucai_p20161114134_7cf.JPG",
  		"nickname": "荒野之息",
  		"state": 1,
  		"create_time": "2021-11-29 14:39:40",
  		"last_login_time": "2021-12-08 14:55:50",
  		"god": {
  			"limit": {
  				"use": false,
  				"data": 0,
  				"timeout": 0
  			},
  			"blacklist": {
  				"use": false,
  				"data": [],
  				"timeout": 0
  			},
  			"blackroom": {
  				"use": false,
  				"data": 0,
  				"timeout": 0
  			},
  			"godtime": {
  				"use": false,
  				"data": 0,
  				"timeout": 0
  			}
  		}
  	}
  }
  ```

  

### 上帝的抚爱

* 地址：`user_god/setGodState`

* 接口方式：`POST`

* 参数：

  ```json
  {
  	"limit": {
  		"use": true,
  		"data": 2,
  		"timeout": 0
  	},
  	"blacklist": {
  		"use": true,
  		"data": [
  			{
  				"gid": 17,
  				"cid": 2,
  				"name": "3",
  				"summary": "额",
  				"description": "e",
  				"img": "[]",
  				"base_price": 1,
  				"last_price": 0,
  				"price": 1,
  				"rusher_id": 0,
  				"belong": 1,
  				"last_belong": 0,
  				"real_path": "[]",
  				"show_path": "[]",
  				"state": 1,
  				"create_time": "2021-12-07 21:56:34",
  				"update_time": "2021-12-07 21:56:34",
  				"origin_type": 0,
  				"origin": 0
  			},
  			{
  				"gid": 15,
  				"cid": 1,
  				"name": "1",
  				"summary": "1",
  				"description": "1",
  				"img": "[]",
  				"base_price": 1,
  				"last_price": 0,
  				"price": 1,
  				"rusher_id": 0,
  				"belong": 1,
  				"last_belong": 0,
  				"real_path": "[]",
  				"show_path": "[]",
  				"state": 1,
  				"create_time": "2021-12-07 21:47:23",
  				"update_time": "2021-12-07 21:47:23",
  				"origin_type": 0,
  				"origin": 0
  			}
  		],
  		"timeout": 0
  	},
  	"blackroom": {
  		"use": true,
  		"data": 0,
  		"timeout": 0
  	},
  	"godtime": {
  		"use": true,
  		"data": 3,
  		"timeout": 0
  	},
  	"uid": 10
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "设置成功"
  }
  ```

  



## 11 数据同步

###  同步抢购商品数据

* 地址：`sync/syncRush`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```




###  同步货架商品数据

* 地址：`sync/syncShelves`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```




###  清空用户抢购权限

* 地址：`sync/celarUserGod`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "gid":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```




###  其他数据同步

* 地址：`sync/syncCommon`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "key":"notice"
  }
  ```

* 参数说明：有效值 `banner | notice | schedule | category | protocol`

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```

  

## 12 OSS

### 获取临时上传权限

* 地址：`oss/getAuth`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "authType":"goods-shelves | goods-rush | goods-category | user-avatar | wxpay-receipt-code| alipay-receipt-code",
      "cid":1  // authType 参数取值 goods-category 时，此参数必传，分类id
  }
  ```

* 返回值：

  ```json
  {
      "success": true,
      "data": {
          "region": "oss-cn-beijing",
          "endpoint": "oss-cn-beijing.aliyuncs.com",
          "bucket": "costar-eshop",
          "accessKeyId": "STS.NUBU3zeJQ9KLQeDoxWyNJs5KW",
          "accessKeySecret": "GJubRVBKDD2RVf7isYjZQ2GapRCrjaPT5LWkazwNXAdS",
          "stsToken": "CAIS3QJ*********HonOiJVwjHU=",
          "filepath": "/"
      }
  }
  ```





## 12 协议

### 获取协议列表

* 地址：`protocol/getProtocalList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "authType":"15200089521"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
      "data": [
          "pid":1,
          "name":"协议",
          "content":"xxxx"
      ]
  }
  ```



### 更新协议

* 地址：`protocol/updateProtocol`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "pid":1,
      "content":"xxxx"
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```



### 获取协议

* 地址：`protocol/getProtocol`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "pid":1
  }
  ```

  

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
      	"id":1,
          "name":"xx",
          "content":"xxxxx"
      }
  }
  ```

  

## 13 分仓功能

### 创建分仓

* 地址：`user_bucket/createBucket`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "uid": 1,
      "bucket_name": "可选，默认写用户昵称吧",
      "admin_uid":5
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "创建成功"
  }
  ```



### 删除分仓

* 地址：`user_bucket/deleteBucket`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "bucket_id":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "删除成功"
  }
  ```



### 获取分仓成员

* 地址：`user_bucket/getBucketMembers`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "bucket_id":1
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "avatar": "",
              "nickname": "管理员133",
              "phone": "13300000000",
              "payee_name": "新荣",
              "payee_bankno": "6665248842784",
              "payee_bankname": "交通银行"
          }
      ]
  }
  ```





### 获取分仓列表

* 地址：`user_bucket/getBucketList`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "uid": 1,
              "bucket_name": "可选，默认写用户昵称吧",
              "admin_uid": 127,
              "members": "[1,113,114,115,116,117,118,119,120,121,122,123,124,125,126,1]",
              "create_time": "2021-12-31 20:44:03",
              "admin_nickname": "温暖海里的鱼",
              "admin_phone": "185****4299"
          }
      ]
  }
  ```



### 获取管理员列表

* 地址：`user_bucket/getAdminUserList`

* 接口方式：`POST`

* 参数：

  ```json
  无
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": [
          {
              "uid": 1,
              "nickname": "超级管理员",
              "avatar": "https://file03.16sucai.com/2017/1100/16sucai_p20161114134_7cf.JPG",
              "phone": "15136388552",
              "bucket_id": 1,
              "bucket_name": "可选，默认写用户昵称吧"
          }
      ]
  }
  ```



### 设置/取消管理员

* 地址：`user_bucket/setAdmin`

* 接口方式：`POST`

* 参数：

  isadmin  1=设置管理员 0=取消管理员

* 参数：

  ```json
  {
      "isadmin": 1,
      "uid": 117
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```



### 设置分仓管理员

* 地址：`user_bucket/setBucketAdmin`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "bucket_id": 1,
      "admin_uid": 117
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok"
  }
  ```

## 14 用户订单

### 获取订单

* 地址：`user_order/getList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "salerPhone": "151", // 出售人手机
      "buyerPhone": "152", // 购买人手机
      "state": 1, // 订单状态：1. 正常 -1： 删除
      "payState": 1, // 支付状态：0=提交订单待支付  -1=付款失败（取消） 1=成功付款  2=已上架
      "createdAtStart": "2022-01-01", // 订单创建时间开始
      "createdAtEnd": "2022-01-02", // 订单创建时间结束
      "goodName": "史莱姆", // 商品名称
      "topUid": 1 // 总经销商uid
  }
  ```

* 返回值：

  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": {
          "page_index": 0,
          "page_size": 1,
          "list": [
              "address_info": '{"id":18,"uid":133,"name":"werew","phone":"werewr","province":"北京市","city":"北京市","county":"西城区","detail":"rwere","isdefault":1,"create_time":"2022-01-02 16:02:25"}',
              "avatar": "",
              "code": "M00A",
              "coupon_id": 0,
              "coupon_price": 0,
              "create_time": "2022-01-06 03:37:58",
              "dispute": "",
              "g_count": 1,
              "g_price": 3452600,
              "gid": 10,
              "name": "魔术师",
              "nickname": "分仓152-3",
              "order_id": 148,
              "order_no": "D2201060337580001336",
              "pay_method": 0,
              "pay_state": 2,
              "phone": "15200000003",
              "real_price": 0,
              "saler_id": 1,
              "schedule_id": 4,
              "state": 1,
              "u_coupon_id": 0,
              "uid": 133,
              "update_time": "2022-01-06 04:31:59",
              "总销": {
                "uid": 131, 
                "nickname": "分仓152-1", 
                "level1_recommender": 130, 
                "level2_recommender": 0, 
                "roles": "[]"}
          ]
      }
  }
  ```

### 导出订单

* 地址：`user_order/exportList`

* 接口方式：`POST`

* 参数：

  ```json
  {
      "salerPhone": "151", // 出售人手机
      "buyerPhone": "152", // 购买人手机
      "state": 1, // 订单状态：1. 正常 -1： 删除
      "payState": 1, // 支付状态：0=提交订单待支付  -1=付款失败（取消） 1=成功付款  2=已上架
      "createdAtStart": "2022-01-01", // 订单创建时间开始
      "createdAtEnd": "2022-01-02", // 订单创建时间结束
      "goodName": "史莱姆", // 商品名称
      "topUid": 1 // 总经销商uid
  }
  ```

* 返回值：
  ```json
  {
      "res_code": 1,
      "msg": "ok",
      "data": "./xlsx/订单列表_2022-03-28_1648461918202.xlsx"
  }
  ```
