<template>
    <div class="page">
        <!-- 标题/导航 -->
        <BarText class="main-title"
            text="抢购" />
        <div class="page-content">
            <NoticeBar :list="noticeList"
                v-on:onClick="onNoticeClick" />
            <div class="schedule-item-bg"
                :style="item.state==0?'filter:alpha(Opacity=50);-moz-opacity:0.5;opacity: 0.5;':''"
                v-for="(item, index) in list"
                :key="index"
                @click="enterRush(item)">
                <img :src="require('../assets/img/schedule-item.jpg')">
                <p class="title">{{ item.name }}</p>
                <p class="time">{{ item.startStr }} - {{ item.endStr }}</p>
                <!-- <p class="state">{{ item.stateStr }}</p> -->
            </div>
            <div class="no-data"
                v-show="!list || list.length == 0">
                <i class="icon mintui mintui-meiyoushuju"></i>
                <p>没有数据...</p>
            </div>
        </div>
    </div>
</template>

<script>
import BarText from "@/components/BarText";
import NoticeBar from "@/components/NoticeBar";
import { getProtocolBaseUrl } from "@/api/protocol";
import { getRushSchedule } from "@/api/rush";
import { getInfo } from "@/api/user";
import { setCacheUserInfo, getCacheUserInfo } from "@/utils/token";
import { MessageBox } from "mint-ui";

export default {
    data() {
        return {
            userinfo: {},
            list: [],
            rushCheckTimer: null,
            noticeList: [
                {
                    name: "请仔细阅读 《用户促销活动协议》",
                    key: "促销活动协议",
                },
                {
                    name: "请仔细阅读 《商城支付扣款协议》",
                    key: "扣款协议",
                },
            ],
        };
    },
    components: { BarText, NoticeBar },
    methods: {
        async showPage() {
            if (this.rushCheckTimer) {
                clearInterval(this.rushCheckTimer);
                this.rushCheckTimer = null;
            }

            this.userinfo = getCacheUserInfo().userinfo;
            // 检查是否登录
            if (this.userinfo.token) {
                let data = await getInfo();
                if (data.res_code > 0) {
                    this.userinfo = data.data;
                    setCacheUserInfo(data.data);
                }

                // 不重新获取token，以防刷新次数太多
                // 检查是否查看协议
                if (!this.userinfo.has_read_protocol) {
                    await this.tipReadProtocol();
                } // 检查是否签名
                else if (!this.userinfo.has_sign) {
                    await this.tipSgin();
                } else {
                    // 检查是否设置银行卡
                    if (
                        !this.userinfo.payee_name ||
                        !this.userinfo.payee_bankno
                    ) {
                        await this.tipBankInfo();
                    } else {
                        // 检查是否设置地址
                        if (
                            !(
                                this.userinfo.address_list &&
                                this.userinfo.address_list.length > 0
                            )
                        ) {
                            await this.tipAddressInfo();
                        } else {
                            data = await getRushSchedule();
                            if (data.res_code > 0) {
                                this.list = this.checkData(
                                    data.data.list,
                                    data.data.time,
                                    data.data.gtime
                                );
                                this.chekRush();
                                this.rushCheckTimer = setInterval(
                                    this.chekRush,
                                    1000
                                );
                            }
                        }
                    }
                }
            } else {
                await this.tipLogin();
            }
        },
        async enterRush(item) {
            if (
                !(this.userinfo.level1_recommender > 0) &&
                this.userinfo.roles.indexOf(1) == -1
            ) {
                alert("待开放");
                return;
            }
            if (item.schedule_state == 1) {
                // 默认列表跳转第一页
                sessionStorage.setItem("onsale-list-pageindex", 0);
                this.$router.push({
                    path: "/onsalelist",
                    query: { schedule: JSON.stringify(item) },
                });
            } else {
                let msg = item.tip;
                if (!msg) {
                    msg = "场次暂停中...";
                }
                alert(msg);
                return;
            }
        },
        async tipLogin() {
            if (localStorage.getItem("os") == "Android") {
                MessageBox.confirm("本页面需要登录查看").then(async (action) => {
                    if (action == "confirm") {
                        this.$router.push({ path: "/login" });
                    } else {
                        // 跳转商品页签
                        this.$emit("onPage", "home");
                    }
                });
            } else {
                let cresult = confirm("本页面需要登录查看");
                if (cresult) {
                    this.$router.push({ path: "/login" });
                } else {
                    // 跳转商品页签
                    this.$emit("onPage", "home");
                }
            }
        },
        async tipSgin() {
            if (localStorage.getItem("os") == "Android") {
                MessageBox.confirm("本页面需要签字查看").then(
                    async (action) => {
                        if (action == "confirm") {
                            this.$router.push({ path: "/sign" });
                        } else {
                            // 跳转商品页签
                            this.$emit("onPage", "home");
                        }
                    }
                );
            } else {
                let cresult = confirm("本页面需要签字查看");
                if (cresult) {
                    this.$router.push({ path: "/sign" });
                } else {
                    // 跳转商品页签
                    this.$emit("onPage", "home");
                }
            }
        },
        async tipReadProtocol() {
            if (localStorage.getItem("os") == "Android") {
                MessageBox.confirm("本页面需要阅读协议").then(
                    async (action) => {
                        if (action == "confirm") {
                            this.$router.push({ path: "/protocolonsale" });
                        } else {
                            // 跳转商品页签
                            this.$emit("onPage", "home");
                        }
                    }
                );
            } else {
                let cresult = confirm("本页面需要阅读协议");
                if (cresult) {
                    this.$router.push({ path: "/protocolonsale" });
                } else {
                    // 跳转商品页签
                    this.$emit("onPage", "home");
                }
            }
        },
        async tipBankInfo() {
            if (localStorage.getItem("os") == "Android") {
                MessageBox.confirm("本页面需要设置银行卡信息").then(
                    async (action) => {
                        if (action == "confirm") {
                            this.$router.push({ path: "/mybankcard" });
                        } else {
                            // 跳转商品页签
                            this.$emit("onPage", "home");
                        }
                    }
                );
            } else {
                let cresult = confirm("本页面需要设置银行卡信息");
                if (cresult) {
                    this.$router.push({ path: "/mybankcard" });
                } else {
                    // 跳转商品页签
                    this.$emit("onPage", "home");
                }
            }
        },
        async tipAddressInfo() {
            if (localStorage.getItem("os") == "Android") {
                MessageBox.confirm("本页面需要设置收货地址").then(
                    async (action) => {
                        if (action == "confirm") {
                            this.$router.push({ path: "/addresslist" });
                        } else {
                            // 跳转商品页签
                            this.$emit("onPage", "home");
                        }
                    }
                );
            } else {
                let cresult = confirm("本页面需要设置收货地址");
                if (cresult) {
                    this.$router.push({ path: "/addresslist" });
                } else {
                    // 跳转商品页签
                    this.$emit("onPage", "home");
                }
            }
        },
        checkData(list, time, gtime) {
            let appTime = new Date();
            let y = appTime.getFullYear();
            let M = appTime.getMonth();
            let d = appTime.getDate();
            let servTime = new Date(Date.parse(time.replace(/-/g, "/"))); // 解决 Safari 不能正常生成时间的Bug
            this.timeOffset = appTime.getTime() - servTime.getTime();
            let data = list.map((item) => {
                let startArr = item.starttime.split(":");
                let endArr = item.endtime.split(":");
                return {
                    id: item.id,
                    name: item.name,
                    startStr: `${startArr[0]}:${startArr[1]}`,
                    starttime:
                        new Date(
                            y,
                            M,
                            d,
                            parseInt(startArr[0]),
                            parseInt(startArr[1]),
                            0
                        ).getTime() + this.timeOffset,
                    endStr: `${endArr[0]}:${endArr[1]}`,
                    endtime:
                        new Date(
                            y,
                            M,
                            d,
                            parseInt(endArr[0]),
                            parseInt(endArr[1]),
                            0
                        ).getTime() + this.timeOffset,
                    state: 0,
                    stateStr: "数据准备中...",
                    gtime: gtime,
                    schedule_state: item.schedule_state,
                    tip: item.tip,
                };
            });
            return data;
        },

        chekRush() {
            if (this.list) {
                this.timeCur = new Date().getTime();

                this.list.forEach((item) => {
                    let startOffset = item.starttime - this.timeCur;
                    let endOffset = item.endtime - this.timeCur;
                    if (startOffset > 3600000) {
                        item.state = 0;
                        item.stateStr = "等待抢购";
                    } else if (startOffset > 0) {
                        let remianTime = item.starttime - this.timeCur;
                        remianTime = parseInt(remianTime / 1000);
                        let h = Math.floor(remianTime / 3600);
                        let m = Math.floor((remianTime % 3600) / 60);
                        let s = Math.floor(remianTime % 60);

                        let timeStr = `${h < 10 ? 0 : ""}${h}:${
                            m < 10 ? 0 : ""
                        }${m}:${s < 10 ? 0 : ""}${s}`;
                        item.state = 1;
                        item.stateStr = `即将抢购 倒计时${timeStr}`;
                    } else if (endOffset > 0) {
                        item.state = 1;
                        item.stateStr = `抢购中...`;
                    } else {
                        item.state = 0;
                        item.stateStr = "抢购结束";
                    }
                });
            }
        },
        async onNoticeClick(item) {
            let data = await getProtocolBaseUrl();
            if (data.res_code > 0) {
                this.$router.push({
                    path: "/protocol",
                    query: {
                        name: item.name,
                        protocol: item.key,
                        base_url: data.data,
                    },
                });
            }
        },
    },
    beforeDestroy() {
        clearInterval(this.rushCheckTimer);
        this.rushCheckTimer = null;
    },
};
</script>

<style scoped>
.page {
    position: relative;
}
.main-title {
    z-index: 999;
}
.page-content {
    padding-top: 40px;
}
.schedule-item-bg {
    box-sizing: border-box;
    margin: 10px;
    width: calc(100%-20px);
    height: calc(100vw * 5 / 14);
    color: #fff;
    /* background: url("/static/schedule-item.jpg") no-repeat; */
    text-align: center;
    border-radius: 3px;
    background-size: cover;
    position: relative;
}
.schedule-item-bg img {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    object-fit: cover;
    left: 0;
    top: 0;
}
.schedule-item-bg > .title {
    font-size: 12px;
    color: #ffffff;
    background: #313364;
    padding: 2px 5px;
    line-height: 16px;
    border-radius: 10px;
    position: absolute;
    right: 2%;
    top: 22%;
}
.schedule-item-bg > .time {
    font-size: 24px;
    color: #ffffff;
    font-weight: bold;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 22%;
}
.schedule-item {
    margin: 10px;
    padding: 30px 0 30px 0;
    color: #fff;
    /* background: #555; */
    background-image: linear-gradient(#555, #353535);
    text-align: center;
    border-radius: 3px;
}
.schedule-item > .title {
    font-size: 0.9rem;
    font-weight: bold;
    color: #ccc;
}
.schedule-item > .time {
    font-size: 1.2rem;
    margin-top: 20px;
}
.schedule-item > .state {
    font-size: 0.9rem;
    font-weight: bold;
    margin-top: 20px;
    color: #ccc;
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