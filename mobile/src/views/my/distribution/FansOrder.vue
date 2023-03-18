<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="粉丝订单"
            v-on:onBack="onBack" />
        <div class="yellowcard">
            <div class="left">
                <p>￥<span>{{(orders_total_price/100).toFixed(2)}}</span></p>
                <p>订单总金额</p>
            </div>
            <div class="verticalLine" />
            <div class="right">
                <p><span>{{orders_total_count}}</span></p>
                <p>订单数</p>
            </div>
        </div>
        <div class="page-content">
            <mt-loadmore ref="loadmore"
                :auto-fill="false"
                :top-method="loadTop"
                :bottom-method="loadBottom"
                :bottom-all-loaded="allDataLoaded">
                <div class="detaillist">
                    <div class="detaillist-item-wrapper"
                        v-for="(item,index) in list"
                        :key="index">
                        <div class="middle">
                            <p class="time">订单号: {{item.order_no}}<span class="level"
                                    style="float:right;">{{item.stateStr}}</span></p>
                            <div class="goods-info">
                                <img :src="_getDefaultGoodImg(item.goods_img)"
                                    class="avatar">
                                <div>
                                    <p class="nickname">{{item.goods_name}}</p>
                                    <p class="nickname">{{item.code}}{{item.gid}}</p>
                                    <p class="time"
                                        style="color:#bcbcbc">￥{{(item.g_price/100).toFixed(2)}}<span class="level"
                                            style="float:right;">积分:{{item.income.toFixed(0)}}</span></p>
                                </div>
                            </div>
                            <div class="line" />
                            <p class="time">归属人:{{item.saler_nickname}}<span style="float:right;">购买人:{{item.fans_nickname}}</span></p>
                        </div>
                    </div>
                    <p class="more"
                        v-if="!allDataLoaded"
                        @click="loadBottom">
                        点击加载更多...
                    </p>
                    <div class="no-data"
                        v-show="!list || list.length==0">
                        <i class="icon mintui mintui-meiyoushuju"></i>
                        <p>没有数据...</p>
                    </div>
                    <div v-show="allDataLoaded"
                        class="bottomline">
                        <span>------------ 我也是有底线的 ------------</span>
                    </div>
                </div>
            </mt-loadmore>
        </div>
    </div>
</template>

<script>
import { Toast } from "mint-ui";
import BarNavigate from "@/components/BarNavigate";
import RadioButton from "@/components/RadioButton";
import UserMoneyItem from "@/components/UserMoneyItem";
import YellowCard from "@/components/YellowCard";
import { getFansOrderInfo, getFansOrder } from "@/api/user";

export default {
    data() {
        return {
            orders_total_price: 0,
            orders_total_count: 0,
            withdrawal: 0,
            page_index: 0,
            page_size: 10,
            list: [],
            allDataLoaded: false,
        };
    },
    components: {
        BarNavigate,
        RadioButton,
        UserMoneyItem,
        YellowCard,
    },
    mounted() {
        this.getData();
        this.getList();
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        async getData() {
            let data = await getFansOrderInfo();
            if (data.res_code > 0) {
                this.orders_total_price = data.data.orders_total_price;
                this.orders_total_count = data.data.orders_total_count;
            }
        },
        async getList() {
            let data = await getFansOrder({
                page_index: this.page_index,
                page_size: this.page_size,
            });
            if (data.res_code > 0) {
                this.list = this.list.concat(data.data.list);
                this.page_index++;
                if (this.page_index * this.page_size >= data.data.total_count) {
                    this.allDataLoaded = true;
                }
            } else {
                Toast({
                    message: data.msg,
                    position: "center",
                });
            }
        },
        async loadTop(id) {
            this.allDataLoaded = false;
            this.page_index = 0;
            this.list = [];
            await this.getData();
            await this.getList();
            this.$refs.loadmore.onTopLoaded();
        },
        async loadBottom(id) {
            await this.getList();
            this.$refs.loadmore.onBottomLoaded();
        },
        _getDefaultImg(img) {
            if (img) {
                return img;
            }
            return require("../../../assets/img/user.png");
        },
        _getDefaultGoodImg(img) {
            if (img) {
                img = JSON.parse(img);
                if (img.length > 0) {
                    return img[0];
                }
            }
            return require("../../../assets/img/none.png");
        },
        _getLevelStr(level) {
            if (level == 1) {
                return "一级粉丝";
            } else if (level == 2) {
                return "二级粉丝";
            }
            return "";
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
    padding-top: 85px;
}

.list-title {
    color: #222;
    margin: 10px 0;
}

.detaillist-item-wrapper {
    color: #222;
    margin: 10px;
    border-radius: 3px;
    padding: 5px;
    background: #fff;
    display: flex;
    flex-direction: row;
    align-items: center;
}
.detaillist-item-wrapper > .middle {
    flex: 1;
    padding: 5px;
}
.user-info {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    color: #11b9ac;
}
.user-info > .avatar {
    width: 30px;
    height: 30px;
    margin: 3px;
    object-fit: cover;
}
.goods-info {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}
.goods-info > img {
    width: 80px;
    height: 80px;
}
.goods-info > div {
    flex: 1;
    font-size: 14px;
    display: flex;
    flex-direction: column;
}
.goods-info > div > p {
    flex: 1;
    margin: 5px;
}

.line {
    margin: 8px 0;
    border: none;
    border-bottom: solid 1px #ececec;
}

.detaillist-item-wrapper > .middle > .time {
    font-size: 0.8em;
    color: #222;
    margin: 8px 0;
}
.detaillist-item-wrapper > .money {
    margin-right: 5px;
}
.detaillist-item-wrapper > .money > span {
    font-size: 1.3em;
}
.detaillist-item-wrapper hr {
    height: 1px;
    border: none;
    margin: 10px 0;
    border-top: 1px solid #999;
}

.bottomline {
    margin: 20px;
    height: 60px;
    text-align: center;
    color: #999;
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

.level {
    margin-left: 20px;
    color: #11b9ac;
}

.yellowcard {
    padding: 10px 0;
    background-image: linear-gradient(#11b9ac, #13d6c6);
    color: #eee;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    width: 100%;
    top: 40px;
    z-index: 100;
}
.yellowcard > .left,
.right {
    text-align: center;
    flex: 1;
}
.yellowcard > .left > p {
    font-size: 12px;
}
.yellowcard > .right > p {
    font-size: 12px;
}

.verticalLine {
    border: solid #ccc;
    height: 24px;
    border-width: 0 0 0 1px;
}
.more {
    text-align: center;
    margin: 10px 0 40px 0;
    color: #11b9ac;
}
</style>