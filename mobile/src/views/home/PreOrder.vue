<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="确认订单"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="goods-item">
                <div class="info">
                    <div class="address"
                        @click="popupVisible =true">
                        <p class="p1">{{_hiddenStr(defaultAddress.name,1,1)}} {{_hiddenStr(defaultAddress.phone)}}</p>
                        <p class="p2 pcc">{{defaultAddress.province}} {{defaultAddress.city}} {{defaultAddress.county}} <span><i class="mintui mintui-right"></i></span></p>
                        <p class="p3">{{defaultAddress.detail}}</p>
                    </div>
                    <hr class="line">
                    <div class="list-item">
                        <div class="goods">
                            <img class="img"
                                :src="_getFirstImage(info.img)">
                            <div class="goods-info">
                                <p class="goods-name">{{info.name}}</p>
                                <p class="goods-name">库存:{{info.goods_count}}
                                    <span class="goods-price">￥{{(info.price/100).toFixed(2)}}</span>
                                </p>
                                <p class="goods-name">编号:{{info.code}}{{info.gid}}</p>
                            </div>

                        </div>
                        <div class="btn-panel">
                            <span style="margin-right:15px">购买数量: </span>
                            <ButtonMini class="btn"
                                :keyword="info"
                                content="-"
                                :enable="info.count>1"
                                v-on:onClick="onSubCount" />
                            <input class="num"
                                type="number"
                                @change="numChage(info)"
                                v-model="info.count">
                            <ButtonMini class="btn"
                                :keyword="info"
                                content="+"
                                :enable="info.goods_count>info.count"
                                v-on:onClick="onAddCount" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom">
            <p class="total-price">合计 <span>￥{{(this.total_price/100).toFixed(2)}}</span></p>
            <RushButton class="btn"
                content="确认订单"
                :enable="true"
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
                <ButtonFill :enable="true"
                    keyword="item"
                    content="新增地址"
                    v-on:onClick="addNewAddress" />
            </div>

        </mt-popup>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import ButtonMini from "@/components/ButtonMini";
import ButtonFill from "@/components/ButtonFill";
import RushButton from "@/components/RushButton";
import { getAddressList } from "@/api/address";
import { Toast,MessageBox } from "mint-ui";
import { submitShelvesOrder } from "@/api/order";

export default {
    data() {
        return {
            addressList: [],
            defaultAddress: {
                name: "无收货人",
                province: "无收货地址",
                detail: "无收货地址",
            },
            popupVisible: false,
            info: {},
            total_price: 0,
        };
    },
    components: { BarNavigate, RushButton, ButtonMini, ButtonFill },
    async created() {
        this.info = JSON.parse(this.$route.query.goods);
        this.info.goods_count = this.info.count;
        this.info.count = 1;
        this._calculateTotalPrice();

        let data = await getAddressList();
        if (data.res_code > 0 && data.data.length > 0) {
            this.defaultAddress = data.data[0];
            this.addressList = data.data;
        }
    },
    methods: {
        async onBack() {
            this.$router.go(-1);
        },
        _hiddenStr(str, start, count) {
            return str;
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
        async onSubCount(item) {
            if (item.count > 1) {
                item.selected = 1;
                item.count--;
                this._calculateTotalPrice();
            }
        },
        onAddCount(item) {
            if (item.goods_count > item.count) {
                item.selected = 1;
                item.count++;
                this._calculateTotalPrice();
            }
        },
        numChage(item) {
            item.selected = 1;
            let value = parseInt(item.count);
            if (value <= 0) {
                item.count = 1;
            } else if (value > item.goods_count) {
                item.count = item.goods_count;
            } else {
                item.count = 1;
            }
            this._calculateTotalPrice();
        },
        async onSubmit() {
            if (this.total_price <= 0) {
                Toast({
                    message: "信息有误",
                });
                return;
            }
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
            } else {
                let data = await submitShelvesOrder({
                    total_price: this.total_price,
                    gid: this.info.gid,
                    count: this.info.count,
                    address_info: this.defaultAddress,
                });
                if (data.res_code > 0) {
                    this.$router.replace({
                        path: "/goodsorder",
                        query: {
                            order_id: data.data,
                        },
                    });
                } else {
                    Toast({
                        message: data.msg,
                    });
                    if (data.data && data.data.remain >= 0) {
                        this.info.goods_count = data.data.remain;
                    }
                }
            }
        },
        _calculateTotalPrice() {
            this.total_price = this.info.count * this.info.price;
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
    margin: 5px;
    object-fit: cover;
}
.goods > .goods-info {
    flex: 1;
}
.goods > .goods-info p {
    font-size: 0.8rem;
    margin: 5px;
}
.goods-price {
    float: right;
    color: red;
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
    padding-top: 10px;
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
</style>