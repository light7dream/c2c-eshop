<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="订单详情"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="goods-item">
                <div class="info">
                    <div class="address"
                        @click="popupVisible = true">
                        <p class="p1">
                            {{ _hiddenStr(defaultAddress.name, 1, 1) }}
                            {{ _hiddenStr(defaultAddress.phone) }}
                        </p>
                        <p class="p2 pcc">
                            {{ defaultAddress.province }} {{ defaultAddress.city }}
                            {{ defaultAddress.county }}
                            <span><i class="mintui mintui-right"></i></span>
                        </p>
                        <p class="p3">{{ defaultAddress.detail }}</p>
                    </div>
                    <hr class="line" />
                    <p>订单编号: {{ this.info.order_no }}</p>
                    <hr class="line" />
                    <div class="list-item"
                        v-for="(item, index) in list"
                        :key="index">
                        <div class="goods">
                            <img class="img"
                                :src="_getFirstImage(item.img)" />
                            <div class="goods-info">
                                <p class="goods-name">{{ item.name }}</p>
                                <p class="goods-name">库存:{{ item.goods_count }}</p>
                                <p class="goods-price">
                                    ￥{{ (item.price / 100).toFixed(2) }}
                                    <span>×{{ item.count }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom">
            <p class="total-price">
                合计 <span>￥{{ (this.info.price / 100).toFixed(2) }}</span>
            </p>
            <ButtonMini class="btn0"
                content="取消订单"
                :enable="true"
                v-on:onClick="onBack" />
            <RushButton class="btn"
                content="支付"
                :enable="!lockBtn"
                v-on:onClick="onPay" />
        </div>

        <mt-popup class="popup"
            v-model="popupVisible">
            <div class="pop-list">
                <div class="detaillist-item-wrapper"
                    v-for="(item, index) in addressList"
                    :key="index">
                    <div class="address-item"
                        @click="onSelectAddress(item)">
                        <p class="color">{{ item.name }}&nbsp&nbsp{{ item.phone }}</p>
                        <p>
                            {{ item.province }}&nbsp&nbsp{{ item.city }}&nbsp&nbsp{{
                item.county
              }}
                        </p>
                        <p class="address-item-detail">{{ item.detail }}</p>
                    </div>
                </div>
            </div>
            <div class="pop-btn-panel">
                <ButtonBlock :enable="true"
                    keyword="item"
                    content="新增地址"
                    v-on:onClick="addNewAddress" />
            </div>
        </mt-popup>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import RushButton from "@/components/RushButton";
import ButtonBlock from "@/components/ButtonBlock";
import ButtonMini from "@/components/ButtonMini";
import { getAddressList } from "@/api/address";
import { Toast ,MessageBox} from "mint-ui";
import { viewOrder, cancelShelvesOrder, purchasePrepare } from "@/api/order";

export default {
    data() {
        return {
            addressList: [],
            defaultAddress: {
                name: "无收货人",
                province: "无收货地址",
                detail: "无收货地址",
            },
            order_id: {},
            popupVisible: false,
            list: [],
            info: {},
            lockBtn: false,
        };
    },
    components: { BarNavigate, RushButton, ButtonBlock, ButtonMini },
    async created() {
        let refresh = sessionStorage.getItem("refresh2");
        if (!refresh) {
            this.$router.go(0);
            sessionStorage.setItem("refresh2", "2");
        }
        this.order_id = this.$route.query.order_id;
        let data = await viewOrder({ order_id: this.order_id });
        if (data.res_code > 0) {
            this.info = data.data;
            console.log(this.info);
            this.list = JSON.parse(this.info.goods_info);
        } else {
            alert("没有查到相关订单信息");
            return;
        }

        data = await getAddressList();
        if (data.res_code > 0 && data.data.length > 0) {
            this.defaultAddress = data.data[0];
            this.addressList = data.data;
        }
    },
    methods: {
        async onBack() {
            await cancelShelvesOrder({
                order_id: this.order_id,
            });
            this.$router.go(-1);
        },
        _hiddenStr(str, start, count) {
            return str;
        },
        async onPay() {
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
                let data = await purchasePrepare({
                    order_id: this.order_id,
                    order_no: this.info.order_no,
                    address_info: this.defaultAddress,
                });
                if (data.res_code > 0) {
                    if (typeof WeixinJSBridge == "undefined") {
                        if (document.addEventListener) {
                            document.addEventListener(
                                "WeixinJSBridgeReady",
                                onBridgeReady,
                                false
                            );
                        } else if (document.attachEvent) {
                            document.attachEvent(
                                "WeixinJSBridgeReady",
                                onBridgeReady
                            );
                            document.attachEvent(
                                "onWeixinJSBridgeReady",
                                onBridgeReady
                            );
                        }
                    } else {
                        WeixinJSBridge.invoke(
                            "getBrandWCPayRequest",
                            data.data,
                            function (res) {
                                if (
                                    res.err_msg == "get_brand_wcpay_request:ok"
                                ) {
                                    Toast({
                                        message: "支付成功",
                                        position: "center",
                                    });
                                } else {
                                    Toast({
                                        message: "支付失败",
                                        position: "center",
                                    });
                                }
                                this.lockBtn = false;
                            }
                        );
                    }
                } else {
                    Toast({
                        message: "支付失败",
                        position: "center",
                    });
                    this.lockBtn = false;
                }
                sessionStorage.removeItem("refresh2");
            }
            this.lockBtn = false;
        },
        onSelectAddress(item) {
            this.defaultAddress = item;
            this.popupVisible = false;
        },
        _getFirstImage(imgStr) {
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
    margin: 10px;
    object-fit: fill;
}
.goods > .goods-info {
    flex: 1;
}
.goods > .goods-info p {
    line-height: 1.2rem;
    margin: 10px;
}
.goods-price {
    color: red;
}
.goods-price span {
    float: right;
    color: #222;
}

.list-item {
    box-sizing: border-box;
    margin: 10px;
    background: #fff;
    padding-right: 10px;
}

.btn-panel {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 10px;
}
.btn-panel > .num {
    width: 35px;
    border: none;
    text-align: center;
}
.btn-panel > .btn {
    width: 2rem;
}

.popup {
    position: relative;
    width: 80%;
    height: 55vh;
    background: #efefef;
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
    background: #fff;
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
    padding: 10px;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    text-align: center;
    background: #efefef;
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
.bottom > .btn0 {
    border: none;
}
.color {
    color: #11b9ac;
}
</style>