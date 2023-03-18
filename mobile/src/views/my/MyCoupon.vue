<template>
    <div class="page">
        <div class="fixed">
            <BackNavigate title="我的优惠券"
                v-on:onBack="onBack" />
        </div>

        <div class="detaillist">
            <div class=" coupon-item"
                v-for="(item,index) in list"
                :key="index">
                <p class="coupon-value">
                    ￥<span>{{(item.value/100).toFixed(2)}}</span>
                </p>
                <div class="coupon-line"></div>
                <div>
                    <p class="coupon-name">{{item.name}}</p>
                    <p class="coupon-day"
                        style="margin-bottom:5px">使用说明: {{item.description}}</p>
                    <p class="coupon-day">有效期: {{item.time_valid}}</p>
                </div>
            </div>
        </div>

        <div class="no-data"
            v-show="!list || list.length==0">
            <i class="icon mintui mintui-meiyoushuju"></i>
            <p>没有数据...</p>
        </div>
    </div>
</template>

<script>
import BackNavigate from "@/components/BackNavigate";
import ButtonBlock from "@/components/ButtonBlock";
import { getCouponList } from "@/api/coupon";
export default {
    data() {
        return {
            list: [],
        };
    },
    components: {
        BackNavigate,
        ButtonBlock,
    },
    async mounted() {
        let data = await getCouponList();
        if (data.res_code > 0) {
            this.list = data.data;
        }
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        _getDate(item) {
            if (!item) {
                return "-";
            }
            console.log(item);
            let ctime = new Date(item.create_time.replace(/-/g, "/"));
            let extime = new Date(
                ctime.getTime() + item.valid_day * 3600 * 12 * 1000
            );
            console.log(ctime, extime);
            let y = extime.getFullYear();
            let m = extime.getMonth();
            let d = extime.getDate();
            return `${y}-${m}-${d}`;
        },
        _getState(item) {
            if (!item) {
                return "-";
            }
            if (item.state == 1) {
                return "未使用";
            }
            if (item.state == -1) {
                return "已使用";
            }
            if (item.state == -2) {
                return "已失效";
            }
        },
    },
};
</script>

<style scoped>
.page {
    position: relative;
}
.fixed {
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;
}
.detaillist {
    padding-top: 40px;
}
.detaillist > .detaillist-item-wrapper {
    margin: 6px 10px;
    padding: 10px;
    border-radius: 3px;
    color: #c0c0c0;
    background: #222;
}
.coupon-item {
    margin: 5px;
    border-radius: 3px;
    background: #fff;
    color: #222;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 15px;
}
.coupon-item > .coupon-value {
    font-size: 0.9rem;
}
.coupon-item > .coupon-value > span {
    font-size: 1.6rem;
}
.coupon-name {
    font-size: 1.2rem;
    margin-bottom: 10px;
}
.coupon-line {
    border-left: dashed 1px #cecece;
    margin: 0 20px;
    height: 60px;
}
.coupon-day {
    font-size: 0.9rem;
    color: #ababab;
}

.btn-add {
    position: fixed;
    width: calc(100% - 30px);
    bottom: 15px;
    left: 15px;
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