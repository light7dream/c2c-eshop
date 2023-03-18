<template>
    <div class="detaillist-item"
        @click="onClick"
        v-if="data">
        <img class="img"
            :src="data.img">
        <div class="middle">
            <p class="nickname">{{data.nickname}}</p>
            <p class="time">{{data.time}}</p>
        </div>
        <p class="money">+￥<span>{{(data.amount/100).toFixed(2)}}</span></p>
    </div>
</template>
<script>
export default {
    props: ["data"],
    data() {
        return {};
    },
    components: {},
    methods: {
        onClick() {
            this.$emit("onClick", this.data);
        },
    },
};
</script>

<style scoped>
.detaillist-item {
    color: #c8a160;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.detaillist-item > .img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin: 0 10px 0 0;
}
.detaillist-item > .middle {
    flex: 1;
}
.detaillist-item > .middle > .time {
    font-size: 0.8em;
    color: #999;
}
.detaillist-item > .money {
    margin-right: 5px;
}
.detaillist-item > .money > span {
    font-size: 1.3em;
}
</style>