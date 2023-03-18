<template>
    <div class="page">
        <BarNavigate class="nav-back"
            :title="schedule.name"
            righttitle="刷新"
            v-on:onBack="onBack"
            v-on:onRightClick="onRefresh" />
        <PageBar class="page-bar"
            :totalPage="Math.ceil(total_count/page_size)"
            :defaultPage="page_index"
            v-on:onPage="selectPage"
            v-on:onOpenAll="onOpenAll" />
        <div class="page-content">
            <!-- 商品列表 -->
            <div class="goods-list">
                <div class="goods-item"
                    v-for="(item,index) in goodsList"
                    :key="index">
                    <div class="goods-panel"
                        @click="goodClick(item)">
                        <div class="img-header">
                            <img class="goods-img"
                                :src="_getFirstImage(item.img)">
                        </div>
                        <div>
                            <p class="goods-item-name">{{item.name}}</p>
                            <p class="goods-item-price">￥<span>{{(item.price/100).toFixed(2)}}</span></p>
                        </div>
                        <!-- <div class="saleout-img"
                            v-if="item.state!=1 && startOffset < 0">已售罄</div> -->
                        <div class="saleout-img"
                            v-if="item.state!=1">已售罄</div>
                    </div>
                </div>

                <div class="no-data"
                    v-show="!goodsList || goodsList.length==0">
                    <i class="icon mintui mintui-meiyoushuju"></i>
                    <p>没有数据...</p>
                </div>
            </div>
        </div>

        <!-- 全部 -->
        <mt-popup class="popup"
            v-model="popupVisible">
            <div>
                <div class="number"
                    v-for="(item,index) in pageList"
                    @click="popSelectPage(item)">
                    <span> {{item+1}}</span>
                </div>
            </div>
        </mt-popup>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import PageBar from "@/components/PageBar";
import { Toast } from "mint-ui";
import { getRushGoods } from "@/api/rush";
import {setData} from "@/api/user";

export default {
    data() {
        return {
            page_index: 0,
            page_size: 10,
            total_count: 0,
            goodsList: [],
            pageList: [],
            popupVisible: false,
            schedule: null,
            timer: null,
            startOffset: 0,
            endOffset: 0,
        };
    },
    components: { BarNavigate, PageBar },
    created() {
        let i = sessionStorage.getItem("onsale-list-pageindex");
        if (i == null) {
            this.page_index = 0;
        } else {
            this.page_index = parseInt(i);
        }
        this.schedule = JSON.parse(this.$route.query.schedule);
        this.getList();

        this.chekRush();
        this.timer = setInterval(this.chekRush, 1000);
        setData({
            type:"进入场次",
            sid:this.schedule.id,
        })
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        onRefresh() {
            this.getList();
            Toast({
                message: "刷新成功",
                position: "center",
            });
        },
        async getList() {
            let data = await getRushGoods({
                page_index: this.page_index,
                page_size: this.page_size,
                sid: this.schedule.id,
            });

            if (data.res_code > 0) {
                this.goodsList = data.data.list;
                this.total_count = data.data.total_count;
                let totalPage = Math.ceil(this.total_count / this.page_size);
                this.pageList = [];
                for (let i = 0; i < totalPage; i++) {
                    this.pageList.push(i);
                }
            }
        },
        async goodClick(item) {
            if (item.state == 1) {
                this.$router.push({
                    path: "/onsaledetail",
                    query: {
                        goods: JSON.stringify(item),
                        schedule: JSON.stringify(this.schedule),
                    },
                });
            } else {
                Toast({
                    message: "已售罄",
                    position: "center",
                    duration:500
                });
            }
        },
        selectPage(index) {
            this.page_index = index;
            this.getList();
        },
        onOpenAll(total) {
            this.popupVisible = true;
        },
        popSelectPage(index) {
            this.popupVisible = false;
            this.page_index = index;
            this.getList();
        },
        _getFirstImage(imgStr) {
            if (imgStr) {
                imgStr = JSON.parse(imgStr);
                if (imgStr.length > 0) {
                    return imgStr[0]+'?x-oss-process=image/resize,m_pad,h_150,w_150';
                }
            }
            return require("../../assets/img/none.png");
        },
        chekRush() {
            if (this.schedule) {
                let timeCur = new Date().getTime();
                this.startOffset =
                    this.schedule.starttime - timeCur - this.schedule.gtime;
                // this.startOffset = this.schedule.starttime - timeCur;
                this.endOffset = this.schedule.endtime - timeCur;
                // 非抢购时间不限制用户查看列表，不返回上一页
                // if (this.endOffset < 0) {
                //     clearInterval(this.timer);
                //     this.timer = null;
                //     this.$router.go(-1);
                // }
            }
        },
    },
    beforeDestroy() {
        clearInterval(this.timer);
        this.timer = null;
    },
    watch: {
        page_index(n, o) {
            sessionStorage.setItem("onsale-list-pageindex", this.page_index);
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
.page-bar {
    position: fixed;
    top: 40px;
    width: 100%;
    z-index: 999;
}
.page-content {
    padding-top: 90px;
}

.goods-list {
    box-sizing: border-box;
    position: relative;
    padding: 5px;
}

.goods-item {
    box-sizing: border-box;
    display: inline-block;
    background: #fff;
    border-radius: 0px;
    margin: 5px;
    width: calc(100vw / 2 - 15px);
}

.img-header {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 100%;
}
.img-header > .goods-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.img-header > .saleout-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    background: #000;
    opacity: 0.5;
}

.goods-item-name {
    margin: 5px 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.goods-item-price {
    font-size: 0.9em;
    color: #eb3614;
    margin: 3px;
}
.goods-item-price > span {
    font-size: 1.3em;
}
.rush-btn {
    margin: 5px;
}

.schedule-list {
    overflow-x: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    /* align-items: flex-end; */
}
.schedule-container {
    white-space: nowrap;
    margin: 10px 5px;
}

.schedule-item {
    display: inline-block;
    margin: 5px;
    padding: 3px;
    text-align: center;
    border-radius: 3px;
    background: #e9e9e9;
}
.schedule-item-ready {
    color: #eee;
    background: #222;
}
.schedule-item-open {
    color: #eee;
    background: #eb3614;
}

.schedule-item p {
    line-height: 20px;
    width: 75px;
}
.schedule-item .rush-time {
    margin-top: 2px;
    font-size: 1.1em;
}
.schedule-item .rush-state {
    font-size: 0.8em;
}

.popup {
    width: 80%;
    min-height: 40%;
    max-height: 80%;
    padding: 10px;
}
.number {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin: 5px;
    text-align: center;
    line-height: 40px;
    background: #555;
    color: #fff;
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

.goods-panel {
    position: relative;
}
.saleout-img {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    opacity: 0.5;
    color: #fff;
    text-align: center;
    font-size: 2rem;
    padding-top: 4rem;
}
</style>
