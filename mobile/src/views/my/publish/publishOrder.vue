<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="委托上架"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="info">
                <p>订单编号: {{ this.info.order_no }}</p>
                <hr class="line" />
                <div class="list-item">
                    <div class="goods">
                        <img class="img"
                            :src="_getFirstImage(info.img)" />
                        <div class="goods-info">
                            <p class="goods-name">{{ info.name }}</p>
                            <p class="goods-price">
                                购买价格: ￥{{ (info.price / 100).toFixed(2) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="info">
                <p>委托价格</p>

                <p style="margin-top: 10px; color: red">
                    ￥{{ (publishPrice / 100).toFixed(2) }}
                </p>

                <mt-range v-model="publishPrice"
                    :min="100"
                    :max="max"
                    size="mini"
                    @change="priceChange">
                </mt-range>

                <div>
                    <span>￥{{ min.toFixed(2) }}</span>
                    <span style="float: right">￥{{ (max / 100).toFixed(2) }}</span>
                </div>
            </div>
            <div class="info">
                <div>
                    <span>优惠券</span><span @click="openSelectCoupon"
                        style="float: right; color: #555">￥{{ (useCoupon.value / 100).toFixed(2) }}
                        <i class="mintui mintui-right"></i></span>
                </div>
                <p></p>
                <hr class="line" />
                <div>
                    <span>手续费</span><span style="float: right; color: #555">￥{{ (this.fee / 100).toFixed(2) }}</span>
                </div>
            </div>
        </div>
        <div class="bottom">
            <p class="total-price">
                合计 <span>￥{{ (this.total_fee / 100).toFixed(2) }}</span>
            </p>
            <RushButton class="btn"
                content="确认上架"
                :enable="!lockBtn"
                v-on:onClick="onPay" />
        </div>

        <mt-popup class="popup"
            v-model="popvisible"
            position="center">
            <div class="coupon-item"
                v-for="(item, index) in coupons"
                :key="index"
                @click="selectCoupon(item)">
                <p class="coupon-value">
                    ￥<span>{{ (item.value / 100).toFixed(2) }}</span>
                </p>
                <div class="coupon-line"></div>
                <div>
                    <p class="coupon-name">{{ item.name }}</p>
                    <p class="coupon-day"
                        style="margin-bottom: 5px">
                        使用说明: {{ item.description }}
                    </p>
                    <p class="coupon-day">有效期: {{ item.time_valid }}</p>
                </div>
            </div>

            <div class="no-data"
                v-show="!coupons || coupons.length == 0">
                <i class="icon mintui mintui-meiyoushuju"></i>
                <p>没有数据...</p>
            </div>
        </mt-popup>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import RushButton from "@/components/RushButton";
import { getCouponList } from "@/api/coupon";
import { Toast } from "mint-ui";
import { payPrepare } from "@/api/rush";
import { getHandlingFeeRate, getGoodsLaunchGain } from "@/api/goods";

export default {
    data() {
        return {
            useCoupon: {
                name: "-",
                id: 0,
                value: 0,
                time_valid: "-",
            },
            coupons: [],
            order_id: {},
            list: [],
            info: {},
            publishPrice: 0,
            min: 1,
            max: 1,
            hRate: 6,
            fee: 0,
            popvisible: false,
            total_fee: 0,
            launch_gain: 6,
            lockBtn: false,
        };
    },
    components: { BarNavigate, RushButton },
    async created() {
        let cdata = await getCouponList();
        if (cdata.res_code > 0) {
            this.coupons = cdata.data;
        }

        let rateData = await getHandlingFeeRate();
        if (rateData.res_code > 0) {
            this.hRate = rateData.data;
        }
        let gain = await getGoodsLaunchGain();
        if (gain.res_code > 0) {
            this.launch_gain = gain.data;
            if (!(this.launch_gain > 0)) {
                this.launch_gain = 6;
            }
        }

        this.info = JSON.parse(this.$route.query.info);
        this.max = this.info.price + this.info.price * this.launch_gain * 0.01;
        this.publishPrice = this.max;
        this.calculateTotalFee();
    },
    mounted() {
        let refresh = sessionStorage.getItem("refresh1");
        if (!refresh) {
            this.$router.go(0);
            sessionStorage.setItem("refresh1", "1");
        }
    },
    methods: {
        async onBack() {
            this.$router.go(-1);
        },
        _hiddenStr(str, start, count) {
            return str;
        },
        async onPay() {
            this.lockBtn = true;
            let data = await payPrepare({
                gid: this.info.gid,
                newprice: this.publishPrice,
                oldprice: this.info.price,
                payprice: this.total_fee,
                rate: this.hRate,
                coupon_id: this.useCoupon.id,
                relate_order_id: this.info.order_id,
            });
            if (data.res_code < 1) {
                alert(data.msg);
                this.lockBtn = false;
                return;
            }
            if (typeof WeixinJSBridge == "undefined") {
                if (document.addEventListener) {
                    document.addEventListener(
                        "WeixinJSBridgeReady",
                        onBridgeReady,
                        false
                    );
                } else if (document.attachEvent) {
                    document.attachEvent("WeixinJSBridgeReady", onBridgeReady);
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
                        if (res.err_msg == "get_brand_wcpay_request:ok") {
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
            sessionStorage.removeItem("refresh1");
        },
        onSelectAddress(item) {
            this.defaultAddress = item;
        },
        _getFirstImage(imgStr) {
            if (imgStr) {
                let img = JSON.parse(imgStr);
                if (img.length > 0) {
                    return img[0];
                }
            }
            return require("../../../assets/img/none.png");
        },
        priceChange(value) {
            this.calculateTotalFee();
        },
        openSelectCoupon() {
            this.popvisible = true;
        },
        selectCoupon(item) {
            if (this.fee < item.threshold) {
                alert("不满足使用条件");
            } else {
                this.useCoupon = item;
                this.calculateTotalFee();
                this.popvisible = false;
            }
        },
        calculateTotalFee() {
            this.fee = this.info.price * this.hRate * 0.01;
            this.total_fee = this.fee - this.useCoupon.value;
            if (this.total_fee <= 0) {
                this.total_fee = 1;
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
    margin-right: 5px;
    background: #fff;
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
    width: 80%;
    height: 50vh;
    background: #eee;
    padding: 5px;
    overflow: auto;
}
.popup .coupon-item {
    margin: 5px;
    border-radius: 3px;
    background: #fff;
    color: #222;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 15px;
}
.coupon-item > .coupon-value {
    font-size: 0.9rem;
}
.coupon-item > .coupon-value > span {
    font-size: 1.6rem;
}
.coupon-name {
    font-size: 1.2rem;
    margin-bottom: 10px;
}
.coupon-line {
    border-left: dashed 1px #cecece;
    margin: 0 20px;
    height: 60px;
}
.coupon-day {
    font-size: 0.9rem;
    color: #ababab;
}

.detaillist-item-wrapper {
    margin: 10px;
    padding: 10px 20px;
    border-radius: 3px;
    color: #fff;
    background: #555;
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
    background: #fff;
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
.publish-input {
    width: 100%;
    line-height: 30px;
    border: solid 1px #ccc;
    border-radius: 3px;
    margin: 5px 0;
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
</style>