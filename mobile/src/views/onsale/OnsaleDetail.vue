<template>
    <div class="page">
        <ButtonFixed class="nav-back"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="panel">
                <!-- Banner -->
                <mt-swipe class="banner"
                    :auto="5000">
                    <mt-swipe-item v-for="(item,index) in JSON.parse(goods.img)"
                        :key="index">
                        <div class="banner-container">
                            <img class="banner-img"
                                :src="_getDefaultImage(item)"
                                alt="">
                        </div>
                    </mt-swipe-item>
                </mt-swipe>

                <p class="detail-item goods-name">{{goods.name}}</p>
                <p class="detail-item"><span class="price">￥<span>{{(goods.price/100).toFixed(2)}}</span></span><span class="belong">所属人: {{goods.belong_nickname}}</span></p>
                <p class="detail-item">编号: <span class="time">{{goods.code}}{{goods.gid}}</span></p>
                <p class="detail-item"
                    v-if="false">上架日期: <span class="time">{{goods.update_time}}</span></p>
                <p class="detail-item">商品详情</p>
                <p class="detail-item goods-detail">{{goods.description}}</p>
            </div>

        </div>
        <div class="bottom">
            <RushButton class="rush-btn"
                :content="btnStr"
                :enable="enable"
                v-on:onClick="onBuy" />
        </div>
    </div>
</template>

<script>
import ButtonFixed from "@/components/ButtonFixed";
import RushButton from "@/components/RushButton";
import { getUserGTime } from "@/api/rush";

export default {
    data() {
        return {
            goods: {},
            schedule: null,
            enable: false,
            btnStr: "等待抢购",
            timer: null,
            mode: 2,
        };
    },
    components: { ButtonFixed, RushButton },
    async created() {
        this.goods = JSON.parse(this.$route.query.goods);
        this.schedule = JSON.parse(this.$route.query.schedule);
        this.timer = setInterval(this.chekRush, 1000);
        let ckData = await getUserGTime({ sid: this.schedule.id });
        if(ckData && ckData.res_code>0){
            this.schedule.gtime=ckData.data.gtime;
        }
        this.chekRush();
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        async onBuy() {
            this.$router.replace({
                path: "/onsaleorder",
                query: {
                    goods: JSON.stringify(this.goods),
                    schedule: JSON.stringify(this.schedule),
                    mode: this.mode,
                },
            });
            return;
        },
        _getDefaultImage(imgStr) {
            if (imgStr) {
                return imgStr;
            }
            return require("../../assets/img/none.png");
        },
        chekRush() {
            if (this.schedule) {
                let timeCur = new Date().getTime();
                let startOffset = this.schedule.starttime - timeCur;
                let endOffset = this.schedule.endtime - timeCur;
                if (startOffset > 0) {
                    let remianTime = this.schedule.starttime - timeCur;
                    remianTime = parseInt(remianTime / 1000);
                    let h = Math.floor(remianTime / 3600);
                    let m = Math.floor((remianTime % 3600) / 60);
                    let s = Math.floor(remianTime % 60);

                    let timeStr = `${h < 10 ? 0 : ""}${h}:${
                        m < 10 ? 0 : ""
                    }${m}:${s < 10 ? 0 : ""}${s}`;
                    if (startOffset - this.schedule.gtime < 0) {
                        this.enable = true;
                    } else {
                        this.enable = false;
                    }
                    this.btnStr = `即将抢购 ${timeStr}`;
                } else if (startOffset <= 0 && endOffset > 0) {
                    this.mode = 1;
                    this.enable = true;
                    this.btnStr = "立即抢购";
                } else {
                    this.enable = false;
                    this.btnStr = "抢购结束";
                    // 非抢购时间不限制用户查看商品详情，不返回上两页
                    // clearInterval(this.timer);
                    // this.timer = null;
                    // this.$router.go(-2);
                }
            }
        },
    },
    beforeDestroy() {
        clearInterval(this.timer);
        this.timer = null;
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
    padding-bottom: 50px;
}

.banner {
    height: 80vw;
    margin: 0;
}
.banner-container {
    position: relative;
    background: #fff;
}

.banner-container > .banner-img {
    width: 100%;
    height: 80vw;
    object-fit: contain;
}

.detail-item {
    margin: 10px;
}
.goods-name {
    font-size: 1.5em;
    color: #454545;
}
.time {
    font: 1em;
    color: #454545;
}
.price {
    color: #eb3614;
}
.price > span {
    font-size: 1.2em;
}
.belong {
    float: right;
}
.goods-detail {
    color: #454545;
}

.bottom {
    box-sizing: border-box;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 10px;
    background: #fff;
}
</style>
