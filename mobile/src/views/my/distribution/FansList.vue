<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="我的粉丝"
            v-on:onBack="onBack" />
        <div class="total">
            <YellowCard lineHeight="60"
                leftunit="￥"
                :leftvalue="fans_count_today"
                lefttitle="今日邀请"
                rightunit="￥"
                :rightvalue="fans_count_total"
                righttitle="历史邀请"/>
            <div class="menu">
                <RadioButton class="radio"
                    :ischeck="currentRbCheck == 'level1'"
                    v-on:onCheck="rbCheck"
                    keyword="level1"
                    content="一级粉丝" />
                <RadioButton class="radio"
                    :ischeck="currentRbCheck == 'level2'"
                    v-on:onCheck="rbCheck"
                    keyword="level2"
                    content="二级粉丝" />
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
                        <div class="detaillist-item"
                            @click="onClick(item)"
                            v-if="item">
                            <img class="img"
                                :src="_getImg(item.img)">
                            <div class="middle">
                                <p class="nickname">{{item.nickname}}</p>
                                <p class="time">{{item.create_time}}</p>
                            </div>
                            <p v-if="false"
                                class="money">+￥<span>{{(item.amount/100).toFixed(2)}}</span></p>
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
import BarNavigate from "@/components/BarNavigate";
import { Toast } from "mint-ui";
import RadioButton from "@/components/RadioButton";
import UserMoneyItem from "@/components/UserMoneyItem";
import YellowCard from "@/components/YellowCard";
import { getFansList, getFansDataInfo } from "@/api/fans";

export default {
    data() {
        return {
            currentRbCheck: "level1",
            allDataLoaded: false,
            fans_count_today: 0,
            fans_count_total: 0,
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
            let data = await getFansDataInfo();
            if (data.res_code > 0) {
                this.fans_count_today = data.data.today_count;
                this.fans_count_total = data.data.total_count;
            }
        },
        async getList() {
            if (this.currentRbCheck == "level1") {
                let data = await getFansList({
                    page_index: this.level1.page_index,
                    page_size: this.level1.page_size,
                    level: this.level1.level,
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
                } else {
                    Toast({
                        message: data.msg,
                        position: "center",
                    });
                }
            } else {
                let data = await getFansList({
                    page_index: this.level2.page_index,
                    page_size: this.level2.page_size,
                    level: this.level2.level,
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
        _getImg(img) {
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

.menu {
    margin: 10px 0;
    padding: 3px;
    border-radius: 5px;
    background: #efefef;
    display: flex;
    flex-direction: row;
}
.menu > .radio {
    flex: 1;
}

.detaillist-item-wrapper {
    margin: 6px 10px;
    padding: 10px;
    border-radius: 3px;
    background: #fff;
}

.detaillist-item {
    color: #222;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.detaillist-item > .img {
    width: 40px;
    height: 40px;
    border-radius: 20%;
    margin: 0 10px 0 0;
}
.detaillist-item > .middle {
    flex: 1;
}
.detaillist-item > .middle > .time {
    font-size: 0.8em;
    margin-top: 10px;
    color: #999;
}
.detaillist-item > .money {
    margin-right: 5px;
}
.detaillist-item > .money > span {
    font-size: 1.3em;
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
.nickname {
    color: #11b9ac;
}
.more {
    text-align: center;
    margin: 10px 0 40px 0;
    color: #11b9ac;
}
</style>