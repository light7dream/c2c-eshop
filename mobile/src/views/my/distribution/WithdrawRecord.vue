<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="兑换记录"
            v-on:onBack="onBack" />
        <div class="page-content">
            <mt-loadmore ref="loadmore"
                :auto-fill="false"
                :top-method="loadTop"
                :bottom-method="loadBottom"
                :bottom-all-loaded="allDataLoaded">
                <div class="detaillist">
                    <div v-for="(item,index) in list"
                        :key="index">
                        <div class="detaillist-item">
                            <i class="mintui mintui-zongshouyi em2 color"></i>
                            <img class="img"
                                :src="item.avatar">
                            <div class="middle">
                                <p class="nickname">兑换</p>
                                <p class="followtime">{{item.create_time}}</p>
                            </div>
                            <div class="right">
                                <p class="money">-<span>{{item.amount.toFixed(0)}}</span></p>
                                <p :class="{'info':true,'s0':item.state==0,'s1':item.state==1,'s-1':item.state==-1}">{{_getStateStr(item.state)}}-{{item.msg}}</p>
                            </div>
                        </div>
                        <hr>
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
import { getWithdrawalRecord } from "@/api/income";

export default {
    data() {
        return {
            allDataLoaded: false,
            page_index: 0,
            page_size: 10,
            total_count: 0,
            list: [],
        };
    },
    components: { BarNavigate },
    mounted() {
        this.getList();
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        async getList() {
            let data = await getWithdrawalRecord({
                page_index: this.page_index,
                page_size: this.page_size,
            });
            if (data.res_code > 0) {
                this.list = this.list.concat(data.data.list);
                this.page_index++;
                if (this.page_size * this.page_index >= data.data.total_count) {
                    this.allDataLoaded = true;
                }
            }
        },
        async loadTop(id) {
            this.allDataLoaded = false;
            this.list = [];
            this.page_index = 0;
            this.getList();
            this.$refs.loadmore.onTopLoaded();
        },
        async loadBottom(id) {
            await this.getList();
            this.$refs.loadmore.onBottomLoaded();
        },
        _getStateStr(state) {
            if (state == 0) {
                return "审核中";
            } else if (state == 1) {
                return "申请成功";
            }
            if (state == -1) {
                return "申请失败";
            }
            if (state == -1) {
                return "疑问";
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

.detaillist .detaillist-item {
    margin: 10px;
    border-radius: 5px 10px;
    color: #222;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background: #fff;
}
.detaillist .detaillist-item > i {
    width: 30px;
    height: 30px;
    margin: 20px 10px;
    color: #222;
}
.detaillist .detaillist-item > .middle {
    flex: 1;
}
.detaillist .detaillist-item > .middle > .followtime {
    font-size: 0.8em;
    margin-top: 10px;
    color: #999;
}
.detaillist .detaillist-item > .right {
    text-align: right;
    margin-right: 5px;
}
.detaillist .detaillist-item > .right > .money > span {
    font-size: 1.3em;
}
.detaillist .detaillist-item > .right > .info {
    font-size: 0.8em;
    margin-top: 3px;
}

.s0 {
    color: #999;
}
.s1 {
    color: #52b63e;
}
.s-1 {
    color: #f13303;
}

.detaillist hr {
    height: 1px;
    border: none;
    margin: 0 10px;

    border-top: 1px solid #ccc;
}
.em2 {
    font-size: 2em;
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
.color {
    color: #11b9ac !important;
}
.more {
    text-align: center;
    margin: 10px 0 40px 0;
    color: #11b9ac;
}
</style>