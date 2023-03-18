<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="卖方仓库"
            v-on:onBack="onBack" />
        <div class="tab-bar-panel">
            <div class="tab-bar">
                <div :class="{'tab-item':true,'div-select':selectedTab=='all'}"
                    @click="onChangeTab('all')">
                    <p>我的仓库</p>
                    <div :class="{'tab-line':true,'line-select':selectedTab=='all'}"></div>
                </div>
                <div :class="{'tab-item':true,'div-select':selectedTab=='pay'}"
                    @click="onChangeTab('pay')">
                    <p>付款确认</p>
                    <div :class="{'tab-line':true,'line-select':selectedTab=='pay'}"></div>
                </div>
                <div :class="{'tab-item':true,'div-select':selectedTab=='money'}"
                    @click="onChangeTab('money')">
                    <p>收款确认</p>
                    <div :class="{'tab-line':true,'line-select':selectedTab=='money'}"></div>
                </div>
                <div :class="{'tab-item':true,'div-select':selectedTab=='question'}"
                    @click="onChangeTab('question')">
                    <p>投诉订单</p>
                    <div :class="{'tab-line':true,'line-select':selectedTab=='question'}"></div>
                </div>
                <div :class="{'tab-item':true,'div-select':selectedTab=='package'}"
                    @click="onChangeTab('package')">
                    <p>发货状态</p>
                    <div :class="{'tab-line':true,'line-select':selectedTab=='package'}"></div>
                </div>
            </div>
        </div>
        <div class="page-content">
            <div class="order-item"
                v-for="(item,index) in list"
                :key="index">
                <div class="title">
                    <p><i></i>订单:{{item.order_no}}</p>
                    <p class="state">{{_getStateStr(item.state)}}</p>
                </div>
                <hr class="line">
                <p style="font-size:14px;margin:5px 0;color:#11b9ac;">所属仓库: {{item.schedule_name}}</p>
                <div class="goods">
                    <img class="img"
                        :src="_getFirstImage(item.img)">
                    <div class="goods-info">
                        <p class="name">{{item.name}}</p>
                        <p class="name">商品编号: {{item.code}}{{item.gid}}</p>
                        <p class="price">￥{{(item.price/100).toFixed(2)}}</p>
                    </div>
                </div>
                <div class="btn-bar">
                    <div>
                        <ButtonMini class="btn"
                            fill='block'
                            content="投诉订单"
                            v-if="item.state == 2 || item.state == 3"
                            v-on:onClick="openDispute(item)" />
                        <ButtonMini class="btn"
                            fill='block'
                            content="支付截图"
                            v-if="item.state == 3 || item.state == 5|| item.state == 6"
                            v-on:onClick="onViewPayImg(item)" />
                    </div>
                    <div>
                        <ButtonMini class="btn"
                            fill="fill"
                            content="上传凭证"
                            v-if=" item.state==9" />
                        <ButtonMini class="btn"
                            fill="fill"
                            content="去支付"
                            v-if=" item.state==9" />
                        <ButtonMini class="btn"
                            fill="fill"
                            content="收款确认"
                            v-if="item.state==3"
                            v-on:onClick="onPayAct(item)" />

                    </div>
                </div>
            </div>

            <div v-show="list && list.length>0"
                class="bottomline">
                <span>------------ 我也是有底线的 ------------</span>
            </div>

            <div class="no-data"
                v-show="!list || list.length==0">
                <i class="icon mintui mintui-meiyoushuju"></i>
                <p>没有数据...</p>
            </div>
        </div>

        <mt-popup class="popup"
            v-model="popupPayImgVisible">
            <img class="img"
                v-for="(item,index) in itemPayList"
                :src="item.img"
                :key="index">
        </mt-popup>

        <mt-popup class="popup"
            v-model="popupDisputeVisible">
            <div class="diss">
                <p class="diss-title">投诉内容</p>
                <div class="diss-border">
                    <mt-field placeholder="请详细描述你遇到的问题"
                        type="textarea"
                        rows="4"
                        v-model="dispute"></mt-field>
                </div>

                <div class="btn-panel">
                    <ButtonBlock class="btn"
                        :enable="true"
                        content="取消"
                        v-on:onClick="popupDisputeVisible=false" />
                    <ButtonFill class="btn"
                        :enable="true"
                        content="投诉"
                        v-on:onClick="onDispute" />
                </div>

            </div>
        </mt-popup>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import ButtonMini from "@/components/ButtonMini";
import ButtonFill from "@/components/ButtonFill";
import ButtonBlock from "@/components/ButtonBlock";
import { imSalerList, viewPayImg } from "@/api/goods";
import { payAck, disputeOrder } from "@/api/rush";
import { Toast } from "mint-ui";

export default {
    data() {
        return {
            selectedTab: "all",
            allHiddenList: [],
            list: [],
            popupPayImgVisible: false,
            itemPayList: [],
            disputeItem: {},
            dispute: "",
            popupDisputeVisible: false,
        };
    },
    components: { BarNavigate, ButtonMini, ButtonFill, ButtonBlock },
    async created() {
        let data = await imSalerList();
        if (data.res_code > 0) {
            this.list = data.data;
            this.allHiddenList = this.list;
        } else {
            Toast({
                message: res_code.msg,
            });
        }
        let tab = sessionStorage.getItem("saler-tab");
        if (tab) {
            this.onChangeTab(tab);
        } else {
            tab = "all";
        }
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        onChangeTab(tab) {
            this.selectedTab = tab;
            sessionStorage.setItem("saler-tab", tab);
            if (tab == "all") {
                this.list = this.allHiddenList;
            } else if (tab == "pay") {
                this.list = this.allHiddenList.filter((item) => {
                    return item.state == 2;
                });
            } else if (tab == "money") {
                this.list = this.allHiddenList.filter((item) => {
                    return item.state == 3;
                });
            } else if (tab == "question") {
                this.list = this.allHiddenList.filter((item) => {
                    return item.state == 5;
                });
            } else if (tab == "package") {
                this.list = this.allHiddenList.filter((item) => {
                    return item.state == 6;
                });
            }
        },
        _getFirstImage(imgStr) {
            if (imgStr) {
                imgStr = JSON.parse(imgStr);
                if (imgStr.length > 0) {
                    return imgStr[0];
                }
            }
            return require("../../assets/img/none.png");
        },
        _getStateStr(state) {
            if (state == 0) {
                return "待委托";
            } else if (state == 1) {
                return "已上架";
            } else if (state == 2) {
                return "待付款确认";
            } else if (state == 3) {
                return "待收款确认";
            } else if (state == 5) {
                return "待解决";
            } else if (state == 6) {
                return "已提货";
            }
        },
        async onPayAct(item) {
            let data = await payAck({
                gid: item.gid,
                order_id: item.order_id,
                order_no: item.order_no,
                price: item.price,
            });
            if (data.res_code > 0) {
                data = await imSalerList();
                if (data.res_code > 0) {
                    this.allHiddenList = data.data;
                    this.onChangeTab(this.selectedTab);
                    Toast({
                        message: "确认收款成功",
                    });
                }
            } else {
                Toast({
                    message: data.msg,
                });
            }
        },
        async onViewPayImg(item) {
            let data = await viewPayImg({
                uid: item.rusher_id,
                order_id: item.current_order_id,
            });
            if (data.res_code > 0) {
                if (data.data.length == 0) {
                    Toast({
                        message: "没有找到支付截图",
                    });
                } else {
                    this.itemPayList = data.data;
                    this.onChangeTab(this.selectedTab);
                    this.popupPayImgVisible = true;
                }
            } else {
                Toast({
                    message: data.msg,
                });
            }
        },
        openDispute(item) {
            this.disputeItem = item;
            this.dispute = "";
            this.popupDisputeVisible = true;
        },
        async onDispute() {
            let data = await disputeOrder({
                gid: this.disputeItem.gid,
                dispute: this.dispute,
            });
            if (data.res_code > 0) {
                this.popupDisputeVisible = false;
                data = await imSalerList();
                if (data.res_code > 0) {
                    this.allHiddenList = data.data;
                    this.onChangeTab(this.selectedTab);
                    Toast({
                        message: "投诉成功",
                    });
                }
            } else {
                alert(data.msg);
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
    padding-top: 80px;
}

.tab-bar-panel {
    height: 55px;
    position: fixed;
    top: 40px;
    width: 100%;
    overflow-x: auto;
    background: #eee;
}
.tab-bar {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    color: #999;
}
.tab-bar > .tab-item {
    display: inline-block;
    text-align: center;
    padding: 8px 10px;
    font-size: 0.9rem;
}
.tab-bar > .tab-item .tab-line {
    display: inline-block;
    width: 25px;
    height: 2px;
}
.tab-bar > .tab-item p {
    white-space: nowrap;
}
.div-select {
    color: #222;
}
.line-select {
    background: #222;
}

.order-item {
    margin: 10px;
    background: #fff;
    border-radius: 3px;
    padding: 10px;
}
.order-item > .title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    color: #999;
    font-size: 0.8rem;
}
.order-item > .line {
    border: none;
    border-top: solid 1px #ccc;
    margin: 5px 0;
}
.goods {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}
.goods > .img {
    width: 80px;
    height: 80px;
}
.goods > .goods-info {
    flex: 1;
    color: #222;
    font-size: 0.9rem;
}
.goods > .goods-info > p {
    margin: 5px;
}
.price {
    color: #666;
}

.btn-bar {
    margin-top: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.btn-bar .btn {
    display: inline-block;
}
.title > .state {
    color: #222;
}

.popup {
    width: 80vw;
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px;
}
.popup > .img {
    width: 70vw;
    object-fit: cover;
}

.diss {
    font-size: 00.9rem;
}
.diss-title {
    font-size: 1rem;
    font-weight: bold;
    margin: 0 0 5px 0;
}
.diss-border {
    border: solid 1px #ccc;
}

.btn-panel {
    text-align: center;
    padding: 10px;
}
.btn-panel .btn {
    display: inline-block;
    width: 80px;
    margin: 10px;
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

.bottomline {
    margin: 20px;
    height: 60px;
    text-align: center;
    color: #999;
}
</style>