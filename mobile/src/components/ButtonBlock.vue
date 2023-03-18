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
    line-height: 30px;
    color: #222;
    text-align: center;
    border: solid 1px #222;
}

.button-panel > span {
    color: #222;
    line-height: 30px;
}

.disable {
    color: #999;
    border: solid 1px #999;
    background: #e5e5e5;
}
</style>