<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="积分中心"
            righticon="mintui mintui-zongshouyi"
            righttitle="积分兑换"
            v-on:onRightClick="onOpenWithDarwal"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="distribution-panel">
                <div class="head">
                    <div class="top">
                        <span>可用积分:</span>
                        <div @click="showInfo">
                            <span>积分说明</span>
                            <i class="mintui mintui-wenhaoxiao"></i>
                        </div>
                    </div>
                    <p class="center"><span>{{incomeinfo.income.toFixed(0)}}</span></p>
                    <div class="bottom">
                        <div>
                            <p>{{incomeinfo.income_total.toFixed(0)}}</p>
                            <p class="name">累计总获得</p>
                        </div>
                        <div>
                            <p>{{incomeinfo.today.toFixed(0)}}</p>
                            <p class="name">今日获得</p>
                        </div>
                        <div>
                            <p>{{incomeinfo.days7.toFixed(0)}}</p>
                            <p class="name">近7日获得</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="cellmenu-panel">
                <CellMenu icon="mintui mintui-zongshouyi em1-5 color"
                    keyword="incomelist"
                    v-on:onClick="handle"
                    title="我的积分" />
                <CellMenu icon="mintui mintui-dingdan em1-5 color"
                    keyword="withdwawrecord"
                    v-on:onClick="handle"
                    title="兑换记录" />
                <CellMenu icon="mintui mintui-jifen em1-5 color"
                    keyword="fanslist"
                    v-on:onClick="handle"
                    title="我的粉丝" />
                <CellMenu icon="mintui mintui-shoukuan em1-5 color"
                    keyword="fansorders"
                    v-on:onClick="handle"
                    title="粉丝订单" />
            </div>
        </div>

        <mt-popup class="popup"
            v-model="popupVisible">
            <iframe class="protocol-viewer"
                :src="protocolUrl"
                frameborder="0"></iframe>
        </mt-popup>

        <mt-popup class="popup-2"
            v-model="popupWithDrawVisible">
            <div class="pop-inner">
                <p class="goods-name">申请兑换</p>
                <p class="pop-onsale-item">可用积分: <span class="color">🥇{{withDrawalInfo.income.toFixed(0)}}</span></p>
                <!-- <p class="pop-onsale-item">兑换至: <span class="color">{{userinfo.payee_bankname}} {{userinfo.payee_bankno}}</span></p> -->
                <div class="pop-onsale-item"
                    style="display:flex;flex-direction:row;align-items:center;">
                    <p>申请兑换:</p>
                    <input type="number"
                        v-model="withDrawalInfo.amount">
                </div>
                <!-- <p class="pop-onsale-item"
                    style="margin:5px 15px;color:#cecece">默认兑换至用户设置的银行卡</p> -->
                <p class="pop-onsale-item"
                    style="margin:5px 15px;color:#cecece">兑换条件需要满10000积分</p>
                <p class="pop-onsale-item"
                    style="margin:5px 15px 20px 15px;color:#cecece">提交申请后请耐心等待管理员审核</p>

                <div class="pop-btn-panel">
                    <ButtonMini class="pop-btn"
                        fill="block"
                        content="取消"
                        v-on:onClick="popupWithDrawVisible=false" />
                    <ButtonMini class="pop-btn"
                        fill="fill"
                        type="primary"
                        content="申请"
                        :enable="!lockBtn"
                        v-on:onClick="onWithDrawal" />
                </div>
            </div>
        </mt-popup>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import CellMenu from "@/components/CellMenu";
import ButtonMini from "@/components/ButtonMini";
import { Toast } from "mint-ui";
import { getIncomeInfo, withDrawal } from "@/api/income";
import { getProtocolBaseUrl } from "@/api/protocol";
import { getCacheUserInfo } from "@/utils/token";

export default {
    data() {
        return {
            incomeinfo: {
                uid: 1,
                income_total: 0,
                income: 0,
                today: 0,
                days7: 0,
            },
            popupVisible: false,
            popupWithDrawVisible: false,
            withDrawalInfo: {
                income: 0,
                amount: 0,
            },
            protocolUrl: "",
            userinfo: {},
            lockBtn: false
        };
    },
    components: { BarNavigate, CellMenu, ButtonMini },
    async created() {
        let data = await getIncomeInfo();
        if (data.res_code > 0) {
            this.incomeinfo = data.data;
        }
        this.userinfo = getCacheUserInfo().userinfo;
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        onRightClick() {
            Toast({
                message: "onRightClick",
                position: "center",
            });
        },
        handle(key) {
            this.$router.push({ path: `/${key}` });
        },
        async showInfo() {
            let data = await getProtocolBaseUrl();
            if (data.res_code > 0) {
                this.protocolUrl = `${data.data}?protocol=用户推荐协议`;
            }
            this.popupVisible = true;
        },
        onOpenWithDarwal() {
            this.withDrawalInfo.income = this.incomeinfo.income;
            this.withDrawalInfo.amount = this.incomeinfo.income;
            this.popupWithDrawVisible = true;
        },
        async onWithDrawal() {
            let value = parseInt(this.withDrawalInfo.amount);
            if (value < 10000) {
                alert("最低兑换10000积分");
                return;
            }
            this.lockBtn = true
            if (value > 0 && value <= this.withDrawalInfo.income) {
                let data = await withDrawal({
                    amount: value,
                });
                this.lockBtn = false
                if (data.res_code > 0) {
                    this.popupWithDrawVisible = false;
                    Toast({
                        message: data.msg,
                    });
                    let data2 = await getIncomeInfo();
                    if (data2.res_code > 0) {
                        this.incomeinfo = data2.data;
                    }
                } else {
                    alert(data.msg);
                }
            } else {
                this.lockBtn = false
                alert("兑换金额不合法");
            }
            this.lockBtn = false
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

/* .distribution-panel {
    padding: 100px 35px 30px 35px;
    background: #fff;
} */

.head {
    margin: 10px;
    padding: 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    color: #eee;
    /* background-image: linear-gradient(#555, #222); */
    background-image: linear-gradient(#11b9ac, #13d6c6);
}
.head > .top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.head > .top > div {
    opacity: 0.8;
}
.head > .center {
    margin: 20px;
    text-align: center;
}
.head > .center > span {
    font-size: 2em;
}
.head > .bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.head > .bottom > div {
    text-align: center;
}
.head > .bottom > div > p {
    margin: 2px;
    text-align: center;
}
.head > .bottom > div > .name {
    opacity: 0.6;
    font-size: 0.8em;
    color: #222;
}

.cellmenu-panel {
    padding: 0 10px;
}

.popup {
    padding: 20px;
    font-size: 0.9rem;
    width: 90vw;
    height: 80vh;
    overflow-y: auto;
}
.protocol-viewer {
    box-sizing: border-box;
    padding: 10px;
    width: 82vw;
    height: 80vh;
}

.popup > p {
    line-height: 1.5rem;
}
.popup > .title {
    font-size: 1rem;
    font-weight: bold;
    margin: 10px 0;
}

.popup-2 {
    padding: 20px;
    font-size: 0.9rem;
    width: 80vw;
    max-height: 80vh;
}

.pop-btn-panel {
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}
.pop-btn-panel > .pop-btn {
    width: 80px;
}

.pop-inner > .item {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin: 20px 0;
}
.pop-inner > .goods-name {
    font-weight: bold;
    font-size: 1rem;
    text-align: center;
}
.pop-onsale-item {
    margin: 15px;
    font-size: 14px;
}
.pop-onsale-item > input {
    display: inline-block;
    border: solid 1px #ccc;
    margin: 5px;
    padding: 1px;
    font-size: 14px;
    width: 50%;
}

.color {
    color: #11b9ac;
}
</style>
