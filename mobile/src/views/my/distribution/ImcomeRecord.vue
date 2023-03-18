<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="我的积分"
            v-on:onBack="onBack" />
        <div class="menu">
            <RadioButton class="radio"
                :ischeck="currentRbCheck == 'level1'"
                v-on:onCheck="rbCheck"
                keyword="level1"
                content="已结算" />
            <RadioButton class="radio"
                :ischeck="currentRbCheck == 'level2'"
                v-on:onCheck="rbCheck"
                keyword="level2"
                content="未结算" />
        </div>

        <div class="yellowcard">
            <div class="left">
                <p><span>{{income_total.toFixed(0)}}</span></p>
                <p>总积分</p>
            </div>
            <div class="verticalLine" />
            <div class="right">
                <p><span>{{income_order_count}}</span></p>
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
                            <div class="user-info">
                                <img :src="_getDefaultImg(item.fans_avatar)"
                                    class="avatar">
                                <p class="nickname">{{item.fans_nickname}}</p>
                            </div>
                            <p class="time">订单号: {{item.order_no}}</p>
                            <p class="time">{{item.create_time}}</p>
                        </div>
                        <p class="money">+<span>{{item.income.toFixed(0)}}</span></p>
                        <!-- <hr> -->
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
import {
    getIncomeRecord,
    getIncomeInfo,
    getIncomeRecordNotSure,
} from "@/api/income";

export default {
    data() {
        return {
            currentRbCheck: "level1", // level1=已到账  level2=未到账
            income_total: 0,
            income_order_count: 0,
            withdrawal: 0,
            income: 0,
            page_index: 0,
            page_size: 10,
            list: [],
            level1: {
                page_index: 0,
                page_size: 10,
                list: [],
                allDataLoaded: false,
                level: 1,
            },
            level2: {
                page_index: 0,
                page_size: 10,
                list: [],
                allDataLoaded: false,
                level: 2,
            },
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
            if (this.currentRbCheck == "level1") {
                let data = await getIncomeInfo();
                if (data.res_code > 0) {
                    this.income_total = data.data.income_total;
                    this.income = data.data.income;
                    this.withdrawal = data.data.withdrawal;
                    this.income_order_count = data.data.income_order_count;
                }
            }
        },
        async getList() {
            if (this.currentRbCheck == "level1") {
                let data = await getIncomeRecord({
                    page_index: this.level1.page_index,
                    page_size: this.level1.page_size,
                });
                if (data.res_code > 0) {
                    this.level1.list = this.level1.list.concat(data.data.list);
                    this.level1.page_index++;
                    if (
                        this.level1.page_index * this.level1.page_size >=
                        data.data.total_count
                    ) {
                        this.level1.allDataLoaded = true;
                        this.allDataLoaded = true;
                    }
                    this.list = this.level1.list;
                    this.income_order_count = data.data.total_count;
                } else {
                    Toast({
                        message: data.msg,
                        position: "center",
                    });
                }
            } else {
                let data = await getIncomeRecordNotSure({
                    page_index: this.level2.page_index,
                    page_size: this.level2.page_size,
                });
                if (data.res_code > 0) {
                    this.level2.list = this.level2.list.concat(data.data.list);
                    this.level2.page_index++;
                    if (
                        this.level2.page_index * this.level2.page_size >=
                        data.data.total_count
                    ) {
                        this.level2.allDataLoaded = true;
                        this.allDataLoaded = true;
                    }
                    this.list = this.level2.list;

                    this.income_total = data.data.total_income;
                    this.income_order_count = data.data.total_count;
                } else {
                    Toast({
                        message: data.msg,
                        position: "center",
                    });
                }
            }

            if (this.currentRbCheck == "level1") {
                this.list = this.level1.list;
                this.allDataLoaded = this.level1.allDataLoaded;
            } else {
                this.list = this.level2.list;
                this.allDataLoaded = this.level2.allDataLoaded;
            }
        },
        async loadTop(id) {
            if (this.currentRbCheck == "level1") {
                this.level1 = {
                    page_index: 0,
                    page_size: 10,
                    list: [],
                    allDataLoaded: false,
                    level: 1,
                };
            } else {
                this.level2 = {
                    page_index: 0,
                    page_size: 10,
                    list: [],
                    allDataLoaded: false,
                    level: 2,
                };
            }
            this.allDataLoaded = false;
            await this.getData();
            await this.getList();
            this.$refs.loadmore.onTopLoaded();
        },
        async loadBottom(id) {
            await this.getList();
            this.$refs.loadmore.onBottomLoaded();
        },
        rbCheck(key) {
            this.currentRbCheck = key;
            if (this.currentRbCheck == "level1") {
                this.list = this.level1.list;
                this.allDataLoaded = this.level1.allDataLoaded;
            } else {
                this.list = this.level2.list;
                this.allDataLoaded = this.level2.allDataLoaded;
            }
            this.loadTop();
        },
        _getDefaultImg(img) {
            if (img) {
                return img;
            }
            return require("../../../assets/img/user.png");
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
    padding-top: 120px;
}

.total {
    position: fixed;
    width: 100%;
    top: 40px;
    padding: 10px 10px 0 10px;
    background: #fff;
    z-index: 100;
}

.list-title {
    color: #222;
    margin: 10px 0;
}

.detaillist-item-wrapper {
    color: #ccc;
    margin: 10px;
    border-radius: 3px;
    padding: 10px 5px;
    background: #fff;
    display: flex;
    flex-direction: row;
    align-items: center;
}
.detaillist-item-wrapper > .middle {
    flex: 1;
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
.detaillist-item-wrapper > .middle > .time {
    font-size: 0.8em;
    color: #222;
    margin: 8px 0;
}
.detaillist-item-wrapper > .money {
    margin-right: 5px;
    color: #11b9ac;
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

.menu {
    padding: 3px;
    border-radius: 5px;
    background: #efefef;
    display: flex;
    flex-direction: row;
    position: fixed;
    width: 100%;
    top: 40px;
    z-index: 100;
}
.menu > .radio {
    flex: 1;
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
    top: 75px;
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