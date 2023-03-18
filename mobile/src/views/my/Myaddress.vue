<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="我的地址"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="detaillist-item-wrapper"
                v-for="(item,index) in list"
                :key="index">
                <div class="address-item"
                    @click="onEditAddress(item)">
                    <p>收件人: {{item.name}}&nbsp&nbsp{{item.phone}}</p>
                    <p>地址: {{item.province}}&nbsp&nbsp{{item.city}}&nbsp&nbsp{{item.county}}
                        <i class="mintui mintui-right"></i>
                    </p>
                    <p class="address-item-detail">详细地址: {{item.detail}}</p>
                    <p class="address-item-detail default-address"
                        v-if="item.isdefault">默认</p>
                </div>
            </div>

            <div class="no-data"
                v-show="!list || list.length==0">
                <i class="icon mintui mintui-meiyoushuju"></i>
                <p>没有数据...</p>
            </div>
        </div>

        <div class="bottom">
            <ButtonFill class="btn-add"
                :enable="true"
                content="新增地址"
                v-on:onClick="onClick" />
        </div>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import ButtonFill from "@/components/ButtonFill";
import { getAddressList } from "@/api/address";

export default {
    data() {
        return {
            list: [],
        };
    },
    components: { BarNavigate, ButtonFill },
    async mounted() {
        let data = await getAddressList();
        if (data.res_code > 0) {
            this.list = data.data;
        }
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        onClick(data) {
            this.$router.push({
                path: `/addresssetting`,
                query: {
                    mode: "add",
                },
            });
        },
        onEditAddress(item) {
            this.$router.push({
                path: `/addresssetting`,
                query: {
                    mode: "edit",
                    id: item.id,
                },
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
    padding-bottom: 50px;
}

.detaillist-item-wrapper {
    margin: 10px;
    padding: 10px 20px;
    border-radius: 3px;
    color: #222;
    /* background-image: linear-gradient(#555, #222); */
    background: #FFF;
    font-size: 12px;
}

.address-item > p {
    margin: 10px 0;
}
.address-item > p > i {
    float: right;
}

.default-address {
    color: #11B9AC;
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

.bottom {
    box-sizing: border-box;
    position: fixed;
    width: 100%;
    bottom: 0px;
    left: 0px;
    padding: 10px;
    background: #fff;
}
</style>