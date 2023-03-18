<template>
    <div :class="{'button-panel':true,'disable':!enable}"
        @click="onClick">
        <span>{{content}}</span>
    </div>
</template>
<script>
export default {
    props: ["content", "keyword", "enable"],
    data() {
        return {};
    },
    components: {},
    methods: {
        onClick() {
            if (this.enable) {
                this.$emit("onClick", this.keyword);
            }
        },
    },
};
</script>

<style scoped>
.button-panel {
    line-height: 32px;
    color: #eee;
    /* border-radius: 5px; */
    text-align: center;
    background: #222;
}

.button-panel > span {
    color: #eee;
    line-height: 32px;
}

.disable {
    color: #999;
    background: #e5e5e5;
}
.disable > span {
    color: #999;
    background: #e5e5e5;
}
</style>