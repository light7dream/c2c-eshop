
<template>
    <div class="notice-bar">
        <i class="mintui mintui-system_notice_fill"></i>
        <div class="notice-list">
            <ul>
                <li @click="onClick(item)"
                    v-for="(item,index) in list"
                    :key="index">{{item.name}}</li>
            </ul>
        </div>
    </div>
</template>

<script>
import $ from "jquery";
export default {
    props: ["list"],
    data() {
        return {
            timer: null,
        };
    },
    components: {},
    mounted() {
        this.timer = setInterval(this.scrollOne, 4000);
    },
    methods: {
        onClick(item) {
            this.$emit("onClick", item);
        },
        scrollOne() {
            $(".notice-list")
                .find("ul")
                .animate(
                    {
                        marginTop: "-30px",
                    },
                    500,
                    function () {
                        $(this)
                            .css({
                                marginTop: "0px",
                            })
                            .find("li:first")
                            .appendTo(this);
                    }
                );
        },
    },
    beforeDestroy() {
        clearInterval(this.timer);
        this.timer = null;
    },
};
</script>

<style scoped>
.notice-bar {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background: #fff;
    margin: 3px 0;
}

.notice-bar i {
    font-size: 1.2rem;
    margin: 5px;
}

/*公告栏-新闻滚动*/
.notice-list {
    width: 100%;
    height: 30px;
    overflow: hidden;
}
.notice-list ul li {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
}
</style>
