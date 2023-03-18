<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="我的收益"
            v-on:onBack="onBack" />
        <div class="total">
            <YellowCard lineHeight="80"
                leftunit="￥"
                :leftvalue="(total/100).toFixed(2)"
                lefttitle="累计收益"
                rightunit=""
                :rightvalue="(today/100).toFixed(2)"
                righttitle="今日收益" />
            <p class="list-title">收益明细</p>
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
                                <img :src="_getDefaultImg(item.img)"
                                    class="avatar">
                                <p class="nickname">{{item.name}}</p>
                            </div>
                            <p class="time">订单号: {{item.order_no}}</p>
                            <p class="time">{{item.update_time}} </p>
                        </div>
                        <div class="money">
                            <p>
                                ￥<span>{{((item.newprice-item.oldprice-item.payprice)/100).toFixed(2)}}</span>
                            </p>
                            <!-- <p style="float:right;font-size:12px;color:#999;">收益率: {{((item.newprice-item.oldprice-item.payprice)/item.oldprice*100).toFixed(2)}}％</p > -->
                        </div>
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
import { getOrderSaleIncome, getOrderSaleIncomeInfo } from "@/api/income";

export default {
    data() {
        return {
            total: 0,
            today: 0,
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
            let data = await getOrderSaleIncomeInfo();
            if (data.res_code > 0) {
                this.total = data.data.total;
                this.today = data.data.today;
            }
        },
        async getList() {
            let data = await getOrderSaleIncome({
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
                img = JSON.parse(img);
                if (img.length > 0) {
                    return img[0];
                }
            }
            return require("../../assets/img/user.png");
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
    padding-top: 240px;
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
.detaillist-item-wrapper > .money span {
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
.more {
    text-align: center;
    margin: 10px 0 40px 0;
    color: #11b9ac;
}
</style>