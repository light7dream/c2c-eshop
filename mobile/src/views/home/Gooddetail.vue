<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="商品详情"
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
                                :src="_getDefaultImage(item)">
                        </div>
                    </mt-swipe-item>
                </mt-swipe>
                <div class="saleout-img"
                    v-if="goods.count<=0">已售罄</div>

                <p class="detail-item goods-name">{{goods.name}}</p>
                <p class="detail-item">编号: <span class="time">{{goods.code}}{{goods.gid}}</span></p>
                <p class="detail-item">价格: <span class="price">￥<span>{{(goods.price/100).toFixed(2)}}</span></span></p>
                <p class="detail-item">剩余数量: <span class="time">{{goods.count}}</span></p>
                <p class="detail-item">上架日期: <span class="time">{{goods.update_time}}</span></p>
                <p class="detail-item">商品详情</p>
                <p class="detail-item goods-detail">{{goods.description}}</p>
            </div>
        </div>
        <div class="bottom">
            <i @click="onGotoCert"
                class="mintui mintui-24gl-cartFull5"></i>
            <ButtonBlock class="btn"
                content="添加购物车"
                :enable="goods.count>0"
                v-on:onClick="onAddCart" />
            <RushButton class="btn"
                content="立即购买"
                :enable="goods.count>0"
                v-on:onClick="onBuy" />
        </div>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import { Toast } from "mint-ui";
import { getGoodsDetail, addCart } from "@/api/goods";
import RushButton from "@/components/RushButton";
import ButtonBlock from "@/components/ButtonBlock";

export default {
    data() {
        return {
            gid: 0,
            goods: {
                img: "[]",
                price: 0,
            },
        };
    },
    components: { BarNavigate, RushButton, ButtonBlock },
    async created() {
        this.gid = this.$route.query.gid;
        let data = await getGoodsDetail({ gid: this.gid });
        if (data && data.res_code > 0) {
            this.goods = data.data;
        }
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        async onBuy() {
            this.$router.push({
                path: "/preorder",
                query: {
                    goods: JSON.stringify(this.goods),
                },
            });
            return;
        },
        async onAddCart() {
            let data = await addCart({ gid: this.gid });
            Toast({
                message: data.msg,
            });
        },
        async onGotoCert() {
            sessionStorage.setItem("page", "cart");
            this.$router.go(-1);
        },
        _getDefaultImage(imgStr) {
            if (imgStr) {
                return imgStr;
            }
            return require("../../assets/img/none.png");
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
    padding-bottom: 40px;
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

.saleout-img {
    box-sizing: border-box;
    position: absolute;
    top: 40px;
    left: 0;
    width: 100%;
    height: 280px;
    line-height: 280px;
    background: #000;
    opacity: 0.5;
    color: #fff;
    text-align: center;
    font-size: 2rem;
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
.goods-detail {
    color: #454545;
}

.bottom {
    box-sizing: border-box;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 5px;
    background: #fff;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.bottom > i {
    font-size: 1.5rem;
    margin: 0 80px 0 20px;
}
.bottom > .btn {
    flex: 1;
    margin: 0 5px;
}
</style>