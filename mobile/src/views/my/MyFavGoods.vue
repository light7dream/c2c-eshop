<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="我的商品"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="list-item-panel"
                v-for="(item, index) in list"
                :key="index">
                <div class="list-item">
                    <img :src="_getFirstImage(item.img)"
                        alt="" />
                    <div class="item-info">
                        <p class="goods-name">{{ item.name }}</p>
                        <p>编号: {{ item.code }}{{ item.gid }}</p>
                        <div class="combine-row">
                            <p class="p1">价格: ￥{{ (item.price / 100).toFixed(2) }}</p>
                            <p class="p2">×{{ item.count }}</p>
                        </div>
                        <div class="combine-row">
                            <p class="p1">来源: {{ item.origin }}</p>
                            <p class="p2">{{ item.create_time }}</p>
                        </div>
                    </div>
                </div>
                <div class="parcel">
                    <p>订单: {{ item.order_no }}</p>
                </div>
                <hr class="line" />
                <div class="parcel">
                    <p>快递 {{ item.parcel }}</p>
                    <ButtonMini class="btn-copy"
                        fill="fill"
                        :enable="item.parcel != null && item.parcel != ''"
                        content="复制"
                        v-on:onClick="onCopy(item.parcel)" />
                </div>
            </div>
            <div v-show="!list || list.length == 0"
                class="no-data">
                <i class="icon mintui mintui-meiyoushuju"></i>
                <p>没有数据...</p>
            </div>
        </div>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import { Toast } from "mint-ui";
import ButtonMini from "@/components/ButtonMini.vue";
import { myGoodsList } from "@/api/user";
import _ from "lodash";

export default {
    data() {
        return {
            list: [],
        };
    },
    components: { BarNavigate, ButtonMini },
    async mounted() {
        this.getList();
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        async getList() {
            let data = await myGoodsList();
            if (data && data.res_code > 0) {
                this.list = data.data;
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

        onCopy(cpText) {
            this.$copyText(cpText)
                .then((e) => {
                    Toast({
                        message: "复制成功",
                    });
                })
                .catch((e) => {
                    Toast({
                        message: "复制失败",
                    });
                });
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
.list-item-panel {
    box-sizing: border-box;
    margin: 10px;
    background: #fff;
    padding: 5px;
    color: #555;
}

.list-item {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.list-item img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    margin: 0 15px 10px 0;
}
.item-info {
    flex: 1;
}
.item-info p {
    flex: 1;
    margin: 3px;
    font-size: 0.8rem;
}
.combine-row p {
    display: inline-block;
}
.combine-row .p2 {
    float: right;
}
.item-info > .goods-name {
    font-weight: bold;
    color: #222;
}

.line {
    border: none;
    border-top: solid 1px #ccc;
}

.parcel {
    font-size: 0.8rem;
    color: #999;
    padding: 5px 0;
}
.parcel > p {
    display: inline-block;
}
.parcel > .btn-copy {
    width: 50px;
    float: right;
    margin-right: 10px;
    font-size: 0.8rem;
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