<template>
    <div class="page">
        <img style="position:absolute;width:100%;left:0;z-index:0;"
            :src="require('../assets/img/my-header.png')">
        <div class="page-content">

            <div class="setting">
                <img class="img"
                    :src="_getUserImg(userinfo.avatar)"
                    alt="">
                <span class="nickname"
                    @click="onJunpLogin">{{userinfo.nickname?userinfo.nickname:'登录/注册 >'}}</span>
                <div style="flex:1;">
                    <i class="icon mintui mintui-setting"
                        @click="onEditUserInfo"></i>
                </div>
            </div>

            <div class="buyer">
                <div class="buyer-title color">
                    买方
                </div>
                <hr>
                <div class="buyer-menu">
                    <div @click="onBuyerClick('all')">
                        <i class="mintui mintui-package"></i>
                        <span>我的仓库</span>
                    </div>
                    <div @click="onBuyerClick('pay')">
                        <i class="mintui mintui-fukuan"></i>
                        <span>确认付款</span>
                    </div>
                    <div @click="onBuyerClick('money')">
                        <i class="mintui mintui-querenshouhuo-"></i>
                        <span>确认收款</span>
                    </div>
                    <div @click="onBuyerClick('package')">
                        <i class="mintui mintui-chengjiao"></i>
                        <span>已完成</span>
                    </div>
                </div>
            </div>

            <div class="buyer"
                style="margin-top:10px">
                <div class="buyer-title color">
                    卖方
                </div>
                <hr>
                <div class="buyer-menu">
                    <div @click="onSalerClick('all')">
                        <i class="mintui mintui-package"></i>
                        <span>我的仓库</span>
                    </div>
                    <div @click="onSalerClick('pay')">
                        <i class="mintui mintui-fukuan"></i>
                        <span>确认付款</span>
                    </div>
                    <div @click="onSalerClick('money')">
                        <i class="mintui mintui-querenshouhuo-"></i>
                        <span>确认收款</span>
                    </div>
                    <div @click="onSalerClick('package')">
                        <i class="mintui mintui-chengjiao"></i>
                        <span>已完成</span>
                    </div>
                </div>
            </div>

            <div class="menulist">
                <CellMenu icon="mintui mintui-jifen em1-5 color"
                    keyword="mygoodslist"
                    v-on:onClick="handle"
                    title="我的商品" />
                <CellMenu icon="mintui mintui-dizhi em1-7 color"
                    title="我的地址"
                    keyword="addresslist"
                    v-on:onClick="handle" />
                <CellMenu icon="mintui mintui-youhuiquan em1-5 color"
                    keyword="mycoupon"
                    v-on:onClick="handle"
                    title="我的优惠券" />
                <CellMenu icon="mintui mintui-qr_code_light em1-4 color"
                    keyword="myqrcode"
                    v-on:onClick="handle"
                    title="我的邀请二维码"
                    :hiddenLine="true" />
                <!-- <CellMenu icon="mintui mintui-fenxiaoguanli"
                title="我的积分"
                v-on:onClick="handle"
                keyword="404"  /> -->
            </div>

            <div class="menulist">
                <CellMenu icon="mintui mintui-renqianf em1-5 color"
                    title="积分中心"
                    keyword="dis"
                    v-on:onClick="handle" />
                <CellMenu icon="mintui mintui-shoukuan em1-3 color"
                    title="收款管理"
                    keyword="mybankcard"
                    v-on:onClick="handle" />
                <CellMenu icon="mintui mintui-zongshouyi em1-3 color"
                    title="我的收益"
                    keyword="myorderincome"
                    v-on:onClick="handle"
                    :hiddenLine="true" />
            </div>
            <RushButton v-show="userinfo && userinfo.phone"
                class="btn-logout"
                :enable="true"
                content="退出登录"
                v-on:onClick="logout" />

            <div class="bottomline">
                <!-- <span>------------ 我也是有底线的 ------------</span> -->
            </div>
        </div>

    </div>
</template>

<script>
import CellMenu from "@/components/CellMenu";
import RushButton from "@/components/RushButton";
import { Toast, MessageBox } from "mint-ui";
import { logout } from "@/api/user";
import { getCacheUserInfo, clearCacheUserInfo } from "@/utils/token";

export default {
    components: { CellMenu, RushButton },
    data() {
        return {
            userinfo: {},
        };
    },
    mounted() {},
    methods: {
        async showPage() {
            this.userinfo = getCacheUserInfo().userinfo;
            if (!this.userinfo.avatar) {
                this.userinfo.avatar = require("../assets/img/user.png");
            }
        },
        handle(key) {
            if (key == "none") {
                Toast({
                    message: "待实现",
                });
                return;
            }
            if (!this.userinfo.token) {
                Toast({
                    message: "请登录",
                    position: "center",
                });
                return;
            }
            this.$router.push({ path: `/${key}` });
        },
        onJunpLogin() {
            if (!(this.userinfo && this.userinfo.token)) {
                this.$router.push({ path: "/login" });
            }
        },
        logout() {
            let this_ = this;
            if (localStorage.getItem("os") == "Android") {
                MessageBox.confirm("确定退出登录").then(async (action) => {
                    if (action == "confirm") {
                        logout();
                        clearCacheUserInfo();
                        this_.userinfo = {};
                    }
                });
            } else {
                let cresult = confirm("确定退出登录");
                if (cresult) {
                    logout();
                    clearCacheUserInfo();
                    this_.userinfo = {};
                }
            }
        },
        onBuyerClick(tab) {
            sessionStorage.setItem("buyer-tab", tab);
            this.$router.push({ path: `/imbuyer` });
        },
        onSalerClick(tab) {
            sessionStorage.setItem("saler-tab", tab);
            this.$router.push({ path: `/imsaler` });
        },
        _getUserImg(img) {
            if (img) {
                return img;
            }
            return require("../assets/img/user.png");
        },
        onEditUserInfo() {
            if (this.userinfo && this.userinfo.token) {
                this.$router.push({ path: "/edituserinfo" });
            } else {
                Toast({
                    message: "请登录",
                });
            }
        },
    },
};
</script>

<style scoped>
.setting {
    width: 100%;
    align-items: center;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: row;
}
.setting > .img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    margin: 20px;
}
.setting > span {
    font-size: 18px;
    font-weight: bold;
    color: #313364;
}
.setting > div,
i {
    flex: 1;
    float: right;
    margin-right: 10px;
    font-size: 1.3em;
}

.page {
    position: relative;
}

.page-content {
    position: relative;
}

.background {
    width: 100%;
    background-color: #efefef;
    padding-top: 60px;
    padding-bottom: 20px;
}

/* .userinfo {
} */
.userinfo > .img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    margin: 20px;
}
.userinfo > span {
    font-size: 1.2em;
    position: absolute;
    line-height: 70px;
}

.goods {
    margin: 0 10px;
    padding: 10px;
    border-radius: 10px;
    background-image: linear-gradient(#cecece00, #c0c0c000);
    color: #222;
}
.goods > .goods-title {
    font-size: 1.1em;
}
.goods > .goods-title > .goods-title-left {
    display: inline-block;
    line-height: 1.5em;
}
.goods > .goods-title > .goods-title-right {
    display: inline-block;
    float: right;
    line-height: 1.5em;
}
.goods > hr {
    height: 1px;
    border: none;
    margin: 5px 0;
    border-top: 1px solid #666;
}
.goods > .goods-menu {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
.goods > .goods-menu > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 5px 0;
}
.goods > .goods-menu > div > i {
    font-size: 2em;
}
.goods > .goods-menu > div > span {
    font-size: 0.9em;
}

.buyer {
    margin: 0 10px 0 10px;
    padding: 10px;
    border-radius: 10px;
    background: #fff;
    z-index: 99;
}
.buyer > .buyer-title {
    font-size: 1.2em;
    font-weight: bold;
    color: #000;
}

.buyer > hr {
    height: 1px;
    border: none;
    margin: 5px 0;
    border-top: 1px solid #ccc;
}
.buyer > .buyer-menu {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    color: #222;
}
.buyer > .buyer-menu > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 5px 0;
}
.buyer > .buyer-menu > div > i {
    font-size: 2em;
}
.buyer > .buyer-menu > div > span {
    font-size: 0.9em;
}

.menulist {
    margin: 10px 10px 0 10px;
    padding: 5px 0;
    border-radius: 10px;
    background: #fff;
    color: #222;
}

/* .bottomline {
    display: none;
    margin: 20px;
    text-align: center;
    color: #e9dfac55;
} */

.bottomline {
    margin: 10px;
    text-align: center;
    color: #999;
}

.btn-logout {
    margin: 30px 10px 0 10px;
}
.color {
    color: #11b9ac !important;
}
</style>