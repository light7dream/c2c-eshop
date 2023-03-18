<template>
    <div class="page">
        <!-- 标题/导航 -->
        <BarText class="main-title"
            text="购物车" />
        <span class="delete"
            @click="switchMode">{{deleteMode==0?"删除":"取消"}}</span>
        <div class="page-content">
            <div :class="{'list-item':true,'list-item-out':item.count>item.goods_count,'list-item-selected':item.selected==1}"
                v-for="(item,index) in list"
                :key="index">
                <div class="goods"
                    @click="onSelected(item)">
                    <i :class="{'mintui':true,'mintui-checkboxweixuanzhongxiao':true,'mintui-check-circle':item.selected==1,'item-active':item.selected==1,'item-delete-mode':deleteMode==1}"></i>
                    <img class="img"
                        :src="_getFirstImage(item.img)">
                    <div class="goods-info">
                        <p class="goods-name">{{item.name}}</p>
                        <p class="goods-name">库存:{{item.goods_count}}</p>
                        <p class="goods-price">￥{{(item.price/100).toFixed(2)}} <span>×{{item.count}}</span></p>
                    </div>
                </div>
                <div class="btn-panel">
                    <div class="delete-btn"
                        v-if="deleteMode==1">
                        <i class="mintui mintui-delete"
                            @click="onRemoveCart(item)"></i>
                    </div>
                    <ButtonMini class="btn"
                        :keyword="item"
                        content="-"
                        :enable="item.count>0 && deleteMode==0"
                        v-on:onClick="onSubCount" />
                    <input class="num"
                        type="number"
                        @change="numChage(item)"
                        v-model="item.count">
                    <ButtonMini class="btn"
                        :keyword="item"
                        content="+"
                        :enable="item.goods_count>item.count && deleteMode==0"
                        v-on:onClick="onAddCount" />
                </div>
            </div>
            <div v-show="!list || list.length==0"
                class="no-data">
                <i class="icon mintui mintui-meiyoushuju"></i>
                <p>没有数据...</p>
            </div>
        </div>

        <div class="bottom">
            <p class="total-price">合计 <span>￥{{(total_price/100).toFixed(2)}}</span></p>
            <RushButton class="btn"
                content="提交订单"
                :enable="total_price>0 && deleteMode==0"
                v-on:onClick="onSubmit" />
        </div>
    </div>
</template>

<script>
import BarText from "@/components/BarText";
import ButtonMini from "@/components/ButtonMini";
import RushButton from "@/components/RushButton";
import {
    myCartList,
    removeCart,
    removeCartBatch,
    updateCart,
} from "@/api/goods";
import { submitOrder } from "@/api/order";
import { Toast, MessageBox } from "mint-ui";
export default {
    data() {
        return {
            list: [],
            total_price: 0,
            remain: {},
            deleteMode: 0,
        };
    },
    components: { BarText, ButtonMini, RushButton },
    async mounted() {
        this.getList();
    },
    methods: {
        async showPage() {
            // 显示Page，相当于Load
            this.getList();
        },
        async getList() {
            let data = await myCartList();
            if (data && data.res_code > 0) {
                this.list = data.data;
                this.list.forEach((item) => {
                    if (item.count > item.goods_count) {
                        item.selected = 0;
                    }
                });
            }
            this._calculateTotalPrice();
        },
        async onSelected(item) {
            if (this.deleteMode == 1) {
                return;
            }
            if (item.count > item.goods_count) {
                Toast({
                    message: "超过库存",
                });
                return;
            }
            if (item.selected == 0) {
                item.selected = 1;
            } else {
                item.selected = 0;
            }
            this._calculateTotalPrice();
            await updateCart({
                gid: item.gid,
                count: item.count,
                selected: item.selected,
            });
        },
        _getFirstImage(imgStr) {
            if (imgStr) {
                imgStr = JSON.parse(imgStr);
                if (imgStr.length > 0) {
                    return imgStr[0];
                }
            }
            return require("../assets/img/none.png");
        },
        async onSubCount(item) {
            if (item.count > 1) {
                if (item.count > item.goods_count) {
                    item.selected = 0;
                } else {
                    item.selected = 1;
                }
                item.count--;
                this._calculateTotalPrice();
                await updateCart({
                    gid: item.gid,
                    count: item.count,
                    selected: item.selected,
                });
            } else if (item.count == 1) {
                this.onRemoveCart(item);
            } else {
                await removeCart({
                    gid: item.gid,
                });
                this.getList();
            }
        },
        async onAddCount(item) {
            if (item.goods_count > item.count) {
                item.selected = 1;
                item.count++;
                this._calculateTotalPrice();
                await updateCart({
                    gid: item.gid,
                    count: item.count,
                    selected: item.selected,
                });
            }
        },
        async onRemoveCart(item) {
            let this_ = this;
            if (localStorage.getItem("os") == "Android") {
                MessageBox.confirm("是否将该商品从购物车中移除").then(
                    async (action) => {
                        if (action == "confirm") {
                            await removeCart({
                                gid: item.gid,
                            });
                            this_.getList();
                        }
                    }
                );
            } else {
                let cresult = confirm("是否将该商品从购物车中移除");
                if (cresult) {
                    await removeCart({
                        gid: item.gid,
                    });
                    this_.getList();
                }
            }
        },
        numChage(item) {
            if (item.count > item.goods_count) {
                item.selected = 0;
            } else {
                item.selected = 1;
            }
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
                    message: "请选择要支付的商品",
                });
                return;
            }
            let orderGoods = this.list.filter((item) => {
                return item.selected == 1;
            });
            let data = await submitOrder({
                total_price: this.total_price,
                list: orderGoods,
            });
            if (data.res_code > 0) {
                let ordergids = orderGoods.map((item) => {
                    return item.gid;
                });
                await removeCartBatch({
                    ids: ordergids,
                });
                this.$router.push({
                    path: "/goodsorder",
                    query: {
                        order_id: data.data,
                    },
                });
            } else {
                Toast({
                    message: data.msg,
                });
            }
        },
        _calculateTotalPrice() {
            this.total_price = 0;
            if (this.list) {
                this.list.forEach((item) => {
                    if (item.selected) {
                        this.total_price += item.count * item.price;
                    }
                });
            }
        },
        switchMode() {
            if (this.deleteMode == 0) {
                this.deleteMode = 1;
            } else {
                this.deleteMode = 0;
            }
        },
    },
};
</script>

<style scoped>
.delete {
    position: fixed;
    right: 10px;
    top: 10px;
    z-index: 9999;
}
.page {
    position: relative;
}
.main-title {
    z-index: 999;
}
.page-content {
    padding-top: 40px;
    padding-bottom: 60px;
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
    position: relative;
    box-sizing: border-box;
    margin: 10px;
    background: #fff;
    padding-right: 10px;
}
.list-item-selected {
    border: solid 1px #eb3614;
}
.list-item-out {
    background: #cecece;
}
.list-item i {
    margin: 10px 0 0 5px;
}
.item-active {
    color: #eb3614;
    fill: #eb3614;
}
.item-delete-mode {
    color: #ccc;
    fill: #ccc;
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
    background: transparent;
}
.btn-panel > .btn {
    width: 2rem;
}
.btn-panel > .delete-btn {
    flex: 1;
    text-align: left;
    color: #eee;
}
.btn-panel > .delete-btn > i {
    flex: 1;
    text-align: left;
    background: #eb3614;
    padding: 5px;
    font-size: 1.2rem;
}

.bottom {
    box-sizing: border-box;
    position: fixed;
    bottom: 60px;
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
    color: #eb3614;
}
.bottom > .btn {
    width: 100px;
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