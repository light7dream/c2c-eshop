<template>
  <div class="page">
    <BarNavigate class="nav-back" title="收款管理" v-on:onBack="onBack" />
    <div class="page-content">
      <mt-navbar v-model="selected">
        <mt-tab-item id="1">银行卡</mt-tab-item>
        <!-- <mt-tab-item id="2">微信收款码</mt-tab-item>
        <mt-tab-item id="3">支付宝收款码</mt-tab-item> -->
      </mt-navbar>
      <template v-if="selected=='1'">
        <div class="bankcard">
          <div class="row">
            <p>姓名: </p>
            <p>{{info.payee_name}}</p>
          </div>
          <div class="row">
            <p>卡号: </p>
            <p>{{info.payee_bankno}}</p>
          </div>
          <div class="row">
            <p>开户行: </p>
            <p>{{info.payee_bankname}}</p>
          </div>
        </div>
        <p class="tip">银行卡的信息对您来说十分重要</p>
        <p class="tip">请确保银行卡信息真实有效，确保您能正常收款</p>
        <p class="tip">银行卡信息一旦填写不可更改</p>
        <p class="tip">有问题请联系管理员</p>

        <ButtonFill :enable="true" v-if="info.edit_bank_access" class="btn-setting" keyword="item" content="设置" v-on:onClick="openSettingWindow" />
      </template>
      <template v-if="selected=='2'">
        <div class="img-header">
          <div class="wrap" v-if="info.wxpay_img!=null">
            <img class="img" :src="_getPayImg(info.wxpay_img)">
          </div>
          <ButtonFill :enable="true" class="btn-setting" fill="fill" content="上传收款码" v-on:onClick="onSelectImg()" />
        </div>
      </template>

      <template v-if="selected=='3'">
        <div class="img-header">
          <div class="wrap" v-if="info.alipay_img!=null">
            <img class="img" :src="_getPayImg(info.alipay_img)">
          </div>
          <ButtonFill :enable="true" class="btn-setting" fill="fill" content="上传收款码" v-on:onClick="onSelectImg()" />
        </div>
      </template>
    </div>

    <mt-popup class="popup" v-model="popupVisible">
      <div class="pop-inner">
        <div class="item">
          <div class="name">姓名: </div>
          <input type="text" v-model="editData.payee_name">
        </div>
        <div class="item">
          <div class="name">卡号: </div>
          <input type="text" v-model="editData.payee_bankno">

        </div>
        <div class="item">
          <div class="name">开户行: </div>
          <input type="text" v-model="editData.payee_bankname">
        </div>
        <div class="pop-btn-panel">
          <mt-button class="pop-btn" type="primary" @click="onSettingInfo">确定</mt-button>
        </div>
      </div>
    </mt-popup>
    <input type="file" v-if="emptyFile" id="avatarSelector" name="image" accept="image/*" class="getImgUrl_file" @change="preview($event)">
  </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import ButtonFill from "@/components/ButtonFill";
import { getInfo, updateUserInfo, editReceiptCode } from "@/api/user";
import { getUploadAuth } from "@/api/oss";
import { uplaodImage } from "@/utils/oss";
import { Toast } from "mint-ui";
import _ from "lodash";

export default {
  data() {
    return {
      popupVisible: false,
      selected: "1",
      emptyFile: true,
      info: {
        uid: 0,
        payee_name: "-",
        payee_bankno: "-",
        payee_bankname: "-",
        alipay_img: '',
        wxpay_img: '',
        edit_bank_access: false,
      },
      editData: {
        payee_name: "-",
        payee_bankno: "-",
        payee_bankname: "-",
        edit_bank_access: 0,
      },
    };
  },
  components: { BarNavigate, ButtonFill },
  async created() {
    let data = await getInfo();
    if (data.res_code > 0) {
      this.info = data.data;
    }
  },
  methods: {
    onBack() {
      this.$router.go(-1);
    },
    openSettingWindow() {
      this.editData.payee_name = this.info.payee_name;
      this.editData.payee_bankno = this.info.payee_bankno;
      this.editData.payee_bankname = this.info.payee_bankname;
      this.popupVisible = true;
    },
    async onSettingInfo() {
      if (
        this.editData.payee_bankno &&
        this.editData.payee_name &&
        this.editData.payee_bankname
      ) {
        let data = await updateUserInfo({ ...this.editData });
        if (data.res_code > 0) {
          alert("更新成功");
          this.popupVisible = false;
          data = await getInfo();
          if (data.res_code > 0) {
            this.info = data.data;
          }
        } else {
          alert(`更新失败:${data.msg}`);
        }
      } else {
        alert("信息不能为空");
      }
    },
    _getPayImg(img) {
      if (img) {
        return img;
      }
    },
    onSelectImg() {
      document.getElementById("avatarSelector").click();
    },
    async preview(event) {
      let files = document.getElementById("avatarSelector").files[0];
      this.emptyFile = false;
      let isJPG =
        files.type === "image/jpeg" || files.type === "image/png";
      const isLt20M = files.size / 1024 / 1024 < 20;

      if (!isJPG) {
        Toast({
          message: "上传图片只能是 JPG 或 PNG 格式!",
        });
        return;
      }
      if (!isLt20M) {
        Toast({
          message: "上传图片大小不能超过 20MB!",
        });
        return;
      }
      const payType = this.selected == '2' ? "wxpay" : 'alipay'
      let res = await getUploadAuth({
        authType: payType + "-receipt-code",
      });
      console.log(res);
      if (res.success) {
        let sts = res.data;

        let result = await uplaodImage(files, sts);
        if (result && result.res.status == 200) {
          let data = await editReceiptCode({
            imgUrl: result.url,
            type: payType + "_img",
          });
          Toast({
            message: data.msg,
          });
          if (data.res_code > 0) {
            this.refreshInfo();
          }
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
      this.emptyFile = true;

    },
    async refreshInfo() {
      let data = await getInfo();
      if (data.res_code > 0) {
        this.info = data.data;
        if (this.info.wxpay_img) {
          this.info.wxpay_img += `?${new Date().getTime()}`;
        }
        if (this.info.alipay_img) {
          this.info.alipay_img += `?${new Date().getTime()}`;
        }
      }
    },
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
  padding-top: 40px;
}

.bankcard {
  margin: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  padding: 10px;
  /* background-image: linear-gradient(#c59d5f, #a1793c); */
  background-image: linear-gradient(#555, #222);
  color: #eee;
}
.bankcard > .row {
  margin: 20px;
}
.bankcard > .row > p {
  display: inline-block;
  min-width: 60px;
  text-align: left;
}

.tip {
  font-size: 0.9em;
  margin: 10px;
  color: #9a9a9a;
}

.btn-setting {
  margin: 30px 10px;
}

.popup {
  padding: 20px;
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
.pop-inner > .item > input {
  font-size: 1em;
  padding: 2px;
}

#avatarSelector {
  display: none;
}

.img-header {
  box-sizing: border-box;
  margin-bottom: 20px;
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 100%;
  text-align: center;
}
.img-header > .wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.img-header > .wrap > .img {
  position: absolute;
  top: 5%;
  left: 5%;
  width: 90%;
  height: 90%;
  object-fit: cover;
}
</style>