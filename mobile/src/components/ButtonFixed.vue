<template>
    <div class="fixed-back"
        @click="onBack">
        <div class="bg"/>
        <i class="mintui mintui-angle-left"></i>
    </div>
</template>

<script>
export default {
    props: [],
    data() {
        return {};
    },
    mounted() {},
    methods: {
        onBack() {
            this.$emit("onBack");
        },
    },
};
</script>

<style scoped>
.fixed-back {
    position: relative;
    height: 30px;
    width: 30px;
    text-align: center;
    position: fixed;
    top: 10px;
    left: 10px;
    color: #fff;
}
.fixed-back>i{
    line-height: 30px;
}

.bg {
    height: 30px;
    width: 30px;
    border-radius: 50%;
    background: #000;
    position: absolute;
    opacity: 0.5;
    left: 0;
    top: 0;
    z-index: -1;
}
</style>