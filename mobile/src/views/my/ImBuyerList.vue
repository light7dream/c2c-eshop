<template>
  <div class="page">
    <BarNavigate class="nav-back" title="买方仓库" v-on:onBack="onBack" />
    <div class="tab-bar-panel">
      <div class="tab-bar">
        <div :class="{'tab-item':true,'div-select':selectedTab=='all'}" @click="onChangeTab('all')">
          <p>我的仓库</p>
          <div :class="{'tab-line':true,'line-select':selectedTab=='all'}"></div>
        </div>
        <div :class="{'tab-item':true,'div-select':selectedTab=='pay'}" @click="onChangeTab('pay')">
          <p>付款确认</p>
          <div :class="{'tab-line':true,'line-select':selectedTab=='pay'}"></div>
        </div>
        <div :class="{'tab-item':true,'div-select':selectedTab=='money'}" @click="onChangeTab('money')">
          <p>收款确认</p>
          <div :class="{'tab-line':true,'line-select':selectedTab=='money'}"></div>
        </div>
        <div :class="{'tab-item':true,'div-select':selectedTab=='question'}" @click="onChangeTab('question')">
          <p>投诉订单</p>
          <div :class="{'tab-line':true,'line-select':selectedTab=='question'}"></div>
        </div>
        <div :class="{'tab-item':true,'div-select':selectedTab=='package'}" @click="onChangeTab('package')">
          <p>发货状态</p>
          <div :class="{'tab-line':true,'line-select':selectedTab=='package'}"></div>
        </div>
      </div>
    </div>
    <div class="page-content">
      <div class="order-item" v-for="(item,index) in list" :key="index">
        <div class="title">
          <p><i></i>订单:{{item.order_no}}</p>
          <p class="state">{{_getStateStr(item.state)}}</p>
        </div>
        <hr class="line">
        <p style="font-size:14px;margin:5px 0;color:#11b9ac;">所属仓库: {{item.schedule_name}}</p>
        <div class="goods">
          <img class="img" :src="_getFirstImage(item.img)">
          <div class="goods-info">
            <p class="name">{{item.name}}</p>
            <p class="name">商品编号: {{item.code}}{{item.gid}}</p>
            <p class="price">￥{{(item.price/100).toFixed(2)}}</p>
          </div>
        </div>
        <div class="belong" v-if="item.state == 2 || item.state == 3 || item.state == 5">
          <p>交易方:</p>
          <img class="trans-img" :src="_getAvatar(item.belong_avatar)" alt="">
          <p>{{item.belong_nickname}}</p>
        </div>
        <div class="belong" v-if="item.state == 0 || item.state == 6">
          <p>交易方:</p>
          <img class="trans-img" :src="_getAvatar(item.last_belong_avatar)" alt="">
          <p>{{item.last_belong_nickname}}</p>
        </div>
        <div class="btn-bar">
          <div>
            <ButtonMini class="btn" fill='block' content="取消订单" v-if="item.state==2" v-on:onClick="onCancleOrder(item)" />
            <ButtonMini class="btn" content="提取货物" v-if="item.state==0" v-on:onClick="onGiveMe(item)" />
          </div>
          <div>
            <ButtonMini class="btn" fill='block' content="查看凭证" v-if="item.state == 2 || item.state == 3|| item.state == 5|| item.state == 6" v-on:onClick="onViewPayImg(item)" />
            <ButtonMini class="btn" fill="fill" content="上传凭证" v-if="item.state==2 || item.state==3" v-on:onClick="uploadImg(item)" />
            <ButtonMini class="btn" fill="fill" content="去支付" v-if="item.state==2 || item.state==3" v-on:onClick="showBankInfo(item)" />
            <ButtonMini class="btn" fill="fill" content="支付确认" v-if="item.state==2" v-on:onClick="onPayAct(item)" />
            <ButtonMini class="btn" fill="fill" content="委托上架" v-if="item.state==0" :enable="item.enable==1" v-on:onClick="checkOnsale(item)" />

          </div>
        </div>
      </div>

      <div v-show="list && list.length>0" class="bottomline">
        <span>------------ 我也是有底线的 ------------</span>
      </div>

      <div class="no-data" v-show="!list || list.length==0">
        <i class="icon mintui mintui-meiyoushuju"></i>
        <p>没有数据...</p>
      </div>
    </div>

    <mt-popup class="popup" v-model="popupBankVisible">
      <div class="pop-inner" v-if="popBankData">
        <div class="item">
          <div class="name">收款人: </div>
          <p>{{popBankData.payee_name}}</p>
          <span class="btn-copy" @click="onCopy(popBankData.payee_name)">复制</span>
        </div>
        <div class="item">
          <div class="name">银行卡号: </div>
          <p>{{popBankData.payee_bankno}}</p>
          <span class="btn-copy" @click="onCopy(popBankData.payee_bankno)">复制</span>
        </div>
        <div class="item">
          <div class="name">开户行: </div>
          <p>{{popBankData.payee_bankname}}</p>
          <span class="btn-copy" @click="onCopy(popBankData.payee_bankname)">复制</span>
        </div>
        <div class="item">
          <div class="name">金额: </div>
          <p>{{(popBankData.price/100).toFixed(2)}}</p>
          <span class="btn-copy" @click="onCopy(popBankData.price,true)">复制</span>
        </div>

        <!-- <div class="item">
          <a @click="onViewImg(0)" v-if="popBankData.wxpay_img">查看微信收款码</a>
          <a @click="onViewImg(1)" v-if="popBankData.alipay_img">查看支付宝收款码</a>
        </div> -->
        <div class="pop-btn-panel">
          <mt-button class="pop-btn" type="primary" @click="popupBankVisible = false">确定</mt-button>
        </div>
      </div>
    </mt-popup>

    <mt-popup class="popup" v-model="popupPayImgVisible">
      <img class="img" v-for="(item,index) in itemPayList" :src="item.img" :key="index">
    </mt-popup>

    <input type="file" id="fileSelector" accept="image/*" name="image" @change="preview($event)">
  </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import ButtonMini from "@/components/ButtonMini";
import {
  imBuyerList,
  viewPayImg,
  addPayImg,
  giveMe,
  cancelOrder,
} from "@/api/goods";
import { getUploadAuth } from "@/api/oss";
import { uplaodImage } from "@/utils/oss";
import { setPayPic } from "@/api/user";
import { Toast, MessageBox } from "mint-ui";
import _ from "lodash";
import { getGoodsLaunchTime, getAllGoodsLaunchStatus } from "@/api/goods";

export default {
  data() {
    return {
      selectedTab: "all",
      allHiddenList: [],
      list: [],
      itemPayList: [],
      uploadItem: null,
      popupBankVisible: false,
      popupPayImgVisible: false,
      popBankData: {},
      allowLaunch: 0,
      launchHour: 2,
      lauchTimeRemain: 1,
      timer: null,
    };
  },
  components: { BarNavigate, ButtonMini },
  async created() {
    let data = await imBuyerList();
    if (data.res_code > 0) {
      let resData = data.data;
      if (resData) {
        resData.forEach((item) => {
          item.enable = 0;
        });
      }
      this.list = resData;
      this.allHiddenList = this.list;
    } else {
      Toast({
        message: res_code.msg,
      });
    }
    let tab = sessionStorage.getItem("buyer-tab");
    if (tab) {
      this.onChangeTab(tab);
    } else {
      tab = "all";
    }

    let allowLaunchData = await getAllGoodsLaunchStatus();
    if (allowLaunchData.res_code > 0) {
      this.allowLaunch = parseInt(allowLaunchData.data);
      if (this.allowLaunch != 0 && this.allowLaunch != 1) {
        this.allowLaunch = 0;
      }
    }

    let launchHourData = await getGoodsLaunchTime();
    if (launchHourData.res_code > 0) {
      this.launchHour = parseInt(launchHourData.data);
      if (!(this.launchHour >= 0)) {
        this.launchHour = 2;
      }
    }
    this.chekCanLaunch();
    this.timer = setInterval(this.chekCanLaunch, 1000);
  },
  methods: {
    onViewImg(type) {
      let query = {payee_name:this.popBankData.payee_name,type};
      if (type === 0) {
        query.imgUrl = this.popBankData.wxpay_img;
      }
      if (type === 1) {
        query.imgUrl = this.popBankData.alipay_img;
      }
      this.$router.push({ path: `/payImg`, query });
    },
    onBack() {
      this.$router.go(-1);
    },
    onChangeTab(tab) {
      this.selectedTab = tab;
      sessionStorage.setItem("buyer-tab", tab);
      if (tab == "all") {
        this.list = this.allHiddenList;
      } else if (tab == "pay") {
        this.list = this.allHiddenList.filter((item) => {
          return item.state == 2;
        });
      } else if (tab == "money") {
        this.list = this.allHiddenList.filter((item) => {
          return item.state == 3;
        });
      } else if (tab == "question") {
        this.list = this.allHiddenList.filter((item) => {
          return item.state == 5;
        });
      } else if (tab == "package") {
        this.list = this.allHiddenList.filter((item) => {
          return item.state == 6;
        });
      }
    },
    _getFirstImage(imgStr) {
      if (imgStr) {
        imgStr = JSON.parse(imgStr);
        if (imgStr.length > 0) {
          return imgStr[0];
        }
      }
      return require("../../assets/img/none.png");
    },
    _getAvatar(avatar) {
      if (avatar) {
        return avatar;
      }
      return require("../../assets/img/user.png");
    },
    _getStateStr(state) {
      if (state == 0) {
        return "待委托";
      } else if (state == 1) {
        return "已上架";
      } else if (state == 2) {
        return "待付款确认";
      } else if (state == 3) {
        return "待收款确认";
      } else if (state == 5) {
        return "待解决";
      } else if (state == 6) {
        return "已提货";
      }
    },
    uploadImg(item) {
      this.uploadItem = item;
      document.getElementById("fileSelector").click();
    },
    async onViewPayImg(item) {
      let data = await viewPayImg({
        uid: item.rusher_id,
        order_id: item.current_order_id,
      });
      if (data.res_code > 0) {
        if (data.data.length == 0) {
          Toast({
            message: "没有找到支付截图",
          });
        } else {
          this.itemPayList = data.data;
          this.onChangeTab(this.selectedTab);
          this.popupPayImgVisible = true;
        }
      } else {
        Toast({
          message: data.msg,
        });
      }
    },
    async preview(event) {
      let files = document.getElementById("fileSelector").files[0];

      let isJPG =
        files.type === "image/jpeg" || files.type === "image/png";
      const isLt20M = files.size / 1024 / 1024 < 20;

      if (!isJPG) {
        Toast({
          message: "上传头像图片只能是 JPG 或 PNG 格式!",
        });
        return;
      }
      if (!isLt20M) {
        Toast({
          message: "上传头像图片大小不能超过 20MB!",
        });
        return;
      }

      let res = await getUploadAuth({
        authType: "user-pay",
        order_id: this.uploadItem.current_order_id,
      });
      if (res.success) {
        let sts = res.data;

        let result = await uplaodImage(files, sts);
        if (result && result.res.status == 200) {
          let data = await addPayImg({
            order_id: this.uploadItem.current_order_id,
            imgurl: result.url,
          });
          Toast({
            message: data.msg,
          });
        } else {
          Toast({
            message: "上传失败",
          });
        }
      } else {
        Toast({
          message: "获取上传参数失败",
        });
      }
    },
    async showBankInfo(item) {
      this.popBankData = item;
      this.popupBankVisible = true;
    },
    onCopy(cpText, isNumber) {
      if (isNumber) {
        cpText = (parseInt(cpText) / 100).toFixed(2);
      }
      this.$copyText(cpText)
        .then((e) => {
          alert("复制成功");
        })
        .catch((e) => {
          alert("复制失败");
        });
    },
    async onPayAct(item) {
      let payData = await viewPayImg({
        uid: item.rusher_id,
        order_id: item.current_order_id,
      });
      if (payData.res_code > 0) {
        if (payData.data.length == 0) {
          Toast({
            message: "请上传支付凭证",
          });
        } else {
          let data = await setPayPic({ gid: item.gid });
          if (data.res_code > 0) {
            data = await imBuyerList();
            if (data.res_code > 0) {
              this.allHiddenList = data.data;
              this.onChangeTab(this.selectedTab);
            }
          }
        }
      } else {
        Toast({
          message: data.msg,
        });
      }
    },
    async onGiveMe(item) {
      let this_ = this;
      if (localStorage.getItem("os") == "Android") {
        MessageBox.confirm("没有设置收货地址，请先设置选择").then(
          async (action) => {
            if (action == "confirm") {
              let data = await giveMe({ gid: item.gid });
              if (data) {
                Toast({
                  message: data.msg,
                });
                if (data.res_code > 0) {
                  data = await imBuyerList();
                  if (data.res_code > 0) {
                    this_.allHiddenList = data.data;
                    this_.onChangeTab(this_.selectedTab);
                  }
                }
              }
            }
          }
        );
      } else {
        let cresult = confirm("确定要提取货物?提取后不可再次委托上架");
        if (cresult) {
          let data = await giveMe({ gid: item.gid });
          if (data) {
            Toast({
              message: data.msg,
            });
            if (data.res_code > 0) {
              data = await imBuyerList();
              if (data.res_code > 0) {
                this_.allHiddenList = data.data;
                this_.onChangeTab(this_.selectedTab);
              }
            }
          }
        }
      }
    },
    async checkOnsale(item) {
      if (item.enable == 1) {
        this.$router.push({
          path: "/publishorder",
          query: {
            info: JSON.stringify(item),
          },
        });
      } else {
        Toast({
          message: "请等待可上架时间",
        });
      }
      // let appTime = new Date().getTime();
      // let nextTime = new Date(
      //     Date.parse(item.next_time.replace(/-/g, "/"))
      // ).getTime();
      // if (appTime < nextTime) {
      //     Toast({
      //         message: "当前抢购场次结束前不可委托上架",
      //     });
      // } else {
      //     this.$router.push({
      //         path: "/publishorder",
      //         query: {
      //             info: JSON.stringify(item),
      //         },
      //     });
      //     return;
      // }
    },

    async onCancleOrder(item) {
      let cresult = confirm(
        "取消订单后您已成功抢购的记录不会清除，确认取消订单？"
      );
      if (cresult) {
        let data = await cancelOrder({
          gid: item.gid,
          order_id: item.current_order_id,
        });
        if (data.res_code > 0) {
          let ldata = await imBuyerList();
          if (ldata.res_code > 0) {
            this.allHiddenList = ldata.data;
            this.onChangeTab(this.selectedTab);
          }
        }
      }
    },
    async chekCanLaunch() {
      if (this.list && this.list.length > 0) {
        let allowLaunchData = await getAllGoodsLaunchStatus();
        if (allowLaunchData.res_code > 0) {
          this.allowLaunch = parseInt(allowLaunchData.data);
          if (this.allowLaunch != 0 && this.allowLaunch != 1) {
            this.allowLaunch = 0;
          }
        }

        let launchHourData = await getGoodsLaunchTime();
        if (launchHourData.res_code > 0) {
          this.launchHour = parseInt(launchHourData.data);
          if (!(this.launchHour >= 0)) {
            this.launchHour = 2;
          }
        }
        this.list.forEach((item) => {
          if (this.allowLaunch == 0) {
            item.enable = 0;
          } else {
            let appTime = new Date().getTime();
            let nextTime = new Date(
              Date.parse(item.next_time.replace(/-/g, "/"))
            ).getTime();
            if (appTime > nextTime + this.launchHour * 3600000) {
              item.enable = 1;
            } else {
              item.enable = 0;
            }
          }
        });
      }
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
};
</script>

<style scoped>
.page {
  position: relative;
}
.nav-back {
  z-index: 999;
}
.page-content {
  padding-top: 80px;
}

.tab-bar-panel {
  height: 55px;
  position: fixed;
  top: 40px;
  width: 100%;
  overflow-x: auto;
  background: #eee;
}
.tab-bar {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  color: #999;
}
.tab-bar > .tab-item {
  display: inline-block;
  text-align: center;
  padding: 8px 10px;
  font-size: 0.9rem;
}
.tab-bar > .tab-item .tab-line {
  display: inline-block;
  width: 25px;
  height: 2px;
}
.tab-bar > .tab-item p {
  white-space: nowrap;
}
.div-select {
  color: #222;
}
.line-select {
  background: #222;
}

.order-item {
  margin: 10px;
  background: #fff;
  border-radius: 3px;
  padding: 10px;
}
.order-item > .title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 0.8rem;
}
.order-item > .line {
  border: none;
  border-top: solid 1px #ccc;
  margin: 5px 0;
}
.goods {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
.goods > .img {
  width: 80px;
  height: 80px;
}
.goods > .goods-info {
  flex: 1;
  color: #222;
  font-size: 0.9rem;
}
.goods > .goods-info > p {
  margin: 5px;
}
.price {
  color: #666;
}

.belong {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin: 5px 0 10px 0;
}
.belong > img {
  width: 30px;
  height: 30px;
  margin: 0 10px;
  object-fit: cover;
}
.belong > p {
  font-size: 0.9rem;
}

.btn-bar {
  margin-top: 8px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.btn-bar .btn {
  display: inline-block;
}
.title > .state {
  color: #222;
}

.popup {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}
.popup > .img {
  width: 70vw;
  object-fit: cover;
}
.pop-btn-panel {
  width: 70vw;
  text-align: center;
}
.pop-btn-panel > .pop-btn {
  width: 100px;
}
.pop-inner > .item {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 20px 0;
}
.pop-inner > .item > .name {
  width: 60px;
}
.pop-inner > .item > p {
  padding: 0 5px;
  flex: 1;
}
.pop-inner > .item > .btn-copy {
  text-align: center;
  width: 50px;
  line-height: 25px;
  color: #222;
  border: solid 1px #222;
}
.pop-inner > .item > a {
  text-decoration: underline;
  padding: 0px 10px;
}
.pop-inner > .goods-name {
  font-weight: bold;
  margin: 10px;
}

.newprice {
  display: inline-block;
}
.newprice-input {
  width: 60px;
}
.pop-btn-panel {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;
}
.pop-btn-panel > .pop-btn {
  width: 80px;
}
.pop-onsale-item {
  margin: 20px;
}

#fileSelector {
  display: none;
}

.no-data {
  padding: 50px;
  text-align: center;
  color: #c0c0c0;
  font-size: 1.2em;
}
.no-data .icon {
  width: 80px;
  height: 80px;
  font-size: 5em;
}
.trans-img {
  border-radius: 50%;
}

.bottomline {
  margin: 20px;
  height: 60px;
  text-align: center;
  color: #999;
}
</style>