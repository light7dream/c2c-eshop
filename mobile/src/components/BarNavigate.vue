<template>
    <div class="nav"
        :style="{background:backColor?backColor:defaultBackground}">
        <div class="back"
            @click="onBack">
            <i class="mintui mintui-angle-left"></i>
        </div>
        <span class="title">{{title}}</span>
        <div class="right"
            v-if="righttitle || righticon"
            @click="onRightClick">
            <i :class="righticon"
                :style="{'font-size':iconem?iconem+'em':'1em'}"></i>
            <span>{{righttitle}}</span>
        </div>
    </div>
</template>

<script>
import { Toast } from "mint-ui";
export default {
    props: ["title", "backColor", "righttitle", "righticon", "iconem"],
    data() {
        return {
            defaultBackground: "#fff",
        };
    },
    mounted() {},
    methods: {
        onBack() {
            this.$emit("onBack");
        },
        onRightClick() {
            this.$emit("onRightClick");
        },
    },
};
</script>

<style scoped>
.nav {
    height: 40px;
    width: 100%;
    text-align: center;
    position: fixed;
    top: 0;
}
.nav > .back {
    line-height: 40px;
    text-align: center;
    position: absolute;
    left: 0;
    top: 0;
    width: 40px;
    height: 40px;
}
.nav > .right {
    line-height: 40px;
    text-align: center;
    position: absolute;
    right: 15px;
    top: 0;
    height: 40px;
}
.nav > .right > span {
    font-size: 0.8em;
}
.nav > .title {
    line-height: 40px;
}
</style>