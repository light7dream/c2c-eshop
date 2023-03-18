<template>
    <div class="panel" @click="onClick">
        <div class="menulist-item">
            <div class="menulist-item-title">
                <i :class="icon"></i>
                <span>{{title}}</span>
            </div>
            <i class="mintui mintui-right"></i>
        </div>
        <hr v-if="!hiddenLine">
    </div>
</template>

<script>
import { Toast } from "mint-ui";
import BackNavigate from "@/components/BackNavigate";
export default {
    props: ["icon", "title", "keyword", "hiddenLine"],
    data() {
        return {};
    },
    components: {
        BackNavigate,
    },
    mounted() {
    },
    methods: {
        loadTop(id) {
            this.$refs.loadmore.onTopLoaded();
        },
        loadBottom(id) {
            this.$refs.loadmore.onBottomLoaded();
        },
        onClick(){
            this.$emit("onClick",this.keyword);
        }
    },
};
</script>

<style scoped>
.panel {
    margin: 10px 10px 0 10px;
}
.menulist-item {
    line-height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.menulist-item > .menulist-item-title {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.menulist-item > .menulist-item-title > i {
    /* font-size:1.5em; */
    width: 40px;
    height: 40px;
    margin-right: 0px;
}
.menulist-item > .menulist-item-title>span {
    font-size: 14px;
}
hr {
    height: 1px;
    border: none;
    margin: 5px 0;
    border-top: 1px solid #c0c0c0;
}

.em0-5 {
    font-size: 0.5em;
}
.em0-6 {
    font-size: 0.6em;
}
.em0-7 {
    font-size: 0.7em;
}
.em0-8 {
    font-size: 0.8em;
}
.em0-9 {
    font-size: 0.9em;
}
.em1 {
    font-size: 1em;
}
.em1-1 {
    font-size: 1.1em;
}
.em1-2 {
    font-size: 1.2em;
}
.em1-3 {
    font-size: 1.3em;
}
.em1-4 {
    font-size: 1.4em;
}
.em1-5 {
    font-size: 1.5em;
}
.em1-6 {
    font-size: 1.6em;
}
.em1-7 {
    font-size: 1.7em;
}
.em1-8 {
    font-size: 1.8em;
}
.em1-9 {
    font-size: 1.9em;
}
.em2 {
    font-size: 2em;
}


.color{
    color: #11B9AC !important;
}
</style>