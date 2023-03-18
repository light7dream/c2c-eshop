<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="确认抢购订单"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="info">
                <div class="address"
                    @click="popupVisible =true">
                    <p class="p1">{{_hiddenStr(defaultAddress.name,1,1)}} {{_hiddenStr(defaultAddress.phone)}}</p>
                    <p class="p2 pcc">{{defaultAddress.province}} {{defaultAddress.city}} {{defaultAddress.county}} <span><i class="mintui mintui-right"></i></span></p>
                    <p class="p3">{{defaultAddress.detail}}</p>
                </div>
                <hr class="line">
                <div class="goods">
                    <img class="img"
                        :src="_getDefaultImage(goods.img)">
                    <div class="goods-info">
                        <p class="goods-name">{{goods.name}}</p>
                        <p class="goods-price">￥{{(goods.price/100).toFixed(2)}} <span>×1</span></p>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom">
            <p class="total-price">合计 <span>￥{{(goods.price/100).toFixed(2)}}</span></p>
            <RushButton class="btn"
                content="提交订单"
                :enable="!lockBtn"
                v-on:onClick="onSubmit" />
        </div>

        <mt-popup class="popup"
            v-model="popupVisible">
            <div class="pop-list">
                <div class="detaillist-item-wrapper"
                    v-for="(item,index) in addressList"
                    :key="index">
                    <div class="address-item"
                        @click="onSelectAddress(item)">
                        <p>{{item.name}}&nbsp&nbsp{{item.phone}}</p>
                        <p>{{item.province}}&nbsp&nbsp{{item.city}}&nbsp&nbsp{{item.county}}</p>
                        <p class="address-item-detail">{{item.detail}}</p>
                    </div>
                </div>
            </div>
            <div class="pop-btn-panel">
                <mt-button class="pop-btn"
                    type="primary"
                    @click="addNewAddress">新增地址</mt-button>
            </div>

        </mt-popup>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import RushButton from "@/components/RushButton";
import { shoot } from "@/api/rush";
import { MessageBox } from "mint-ui";

export default {
    data() {
        return {
            addressList: [],
            defaultAddress: {
                name: "无收货人",
                province: "无收货地址",
                detail: "无收货地址",
            },
            goods: {},
            popupVisible: false,
            schedule: null,
            mode: 2,
            lockBtn: false,
        };
    },
    components: { BarNavigate, RushButton },
    async created() {
        this.goods = JSON.parse(this.$route.query.goods);
        this.mode = this.$route.query.mode;

        let userinfo = localStorage.getItem("userinfo");
        try {
            userinfo = userinfo ? JSON.parse(userinfo) : { address_list: [] };
            this.addressList = userinfo.address_list;
            if (this.addressList.length > 0) {
                this.defaultAddress = this.addressList[0];
            }
            console.log(userinfo.address_list);
        } catch (err) {}

        this.schedule = JSON.parse(this.$route.query.schedule);
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        _hiddenStr(str, start, count) {
            return str;
        },
        async onSubmit() {
            this.lockBtn = true;
            if (!(this.defaultAddress.id > 0)) {
                if (localStorage.getItem("os") == "Android") {
                    MessageBox.confirm("没有设置收货地址，请先设置选择").then(
                        async (action) => {
                            if (action == "confirm") {
                                this.$router.push({
                                    path: "/addresssetting",
                                    query: {
                                        mode: "add",
                                    },
                                });
                            }
                        }
                    );
                } else {
                    let cresult = confirm("没有设置收货地址，请先设置选择");
                    if (cresult) {
                        this.$router.push({
                            path: "/addresssetting",
                            query: {
                                mode: "add",
                            },
                        });
                    }
                }
                this.lockBtn = false;
            } else {
                let data = await shoot({
                    gid: this.goods.gid,
                    cid: this.goods.cid,
                    sid: this.schedule.id,
                    address_info: this.defaultAddress,
                    mode: this.mode,
                });

                if (data && data.msg) {
                    alert(data.msg);
                }
                
                this.$router.go(-1);
                this.lockBtn = false;
            }
        },
        onSelectAddress(item) {
            this.defaultAddress = item;
            this.popupVisible = false;
        },
        _getDefaultImage(imgStr) {
            if (imgStr) {
                let img = JSON.parse(imgStr);
                if (img.length > 0) {
                    return img[0];
                }
            }
            return require("../../assets/img/none.png");
        },
        addNewAddress() {
            this.$router.push({
                path: "/addresssetting",
                query: {
                    mode: "add",
                },
            });
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

.info {
    margin: 10px;
    padding: 10px;
    background: #fff;
    color: #222;
    border-radius: 3px;
}
.info > .test {
    box-sizing: border-box;
    line-height: 300px;
    text-align: center;
    background: #cecece;
    margin: 10px;
}
.address p {
    line-height: 2rem;
}
.address > .p1 {
    font-weight: bold;
}

.pcc span {
    float: right;
}
.line {
    margin: 10px 0;
    border: none;
    border-top: 1px solid #ccc;
}

.goods {
    display: flex;
    flex-direction: row;
    justify-items: flex-start;
}
.goods > .img {
    width: 80px;
    height: 80px;
    margin-right: 5px;
}
.goods > .goods-info {
    flex: 1;
}
.goods > .goods-info p {
    line-height: 1.2rem;
    margin: 5px;
}
.goods-price {
    color: red;
}
.goods-price span {
    float: right;
    color: #222;
}

.popup {
    position: relative;
    width: 80%;
    height: 55vh;
}
.popup .pop-list {
    height: calc(55vh - 50px);
    padding-bottom: 50px;
    overflow-y: auto;
}

.detaillist-item-wrapper {
    margin: 10px;
    padding: 10px 20px;
    border-radius: 3px;
    color: #222;
    background: #eee;
}
.address-item > p {
    margin: 5px 0;
    font-size: 0.9rem;
}
.address-item > .address-detail {
    font-size: 0.8rem;
}
.pop-btn-panel {
    position: absolute;
    padding: 5px 0;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    text-align: center;
    background: #fff;
}
.pop-btn-panel > .pop-btn {
    width: 100px;
}

.bottom {
    box-sizing: border-box;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 5px;
    background: #fff;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.bottom > .total-price > span {
    font-size: 1.2rem;
    color: red;
}
.bottom > .btn {
    width: 100px;
}
</style>