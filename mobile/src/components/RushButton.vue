<template>
    <div :class="{'button-panel':true,'disable':!enable,'enable':enable}"
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
    color: #eee;
    line-height: 35px;
    border-radius: 3px;
    text-align: center;
    background: #eb3614;
}

.disable {
    color: #222;
    background: #ccc;
}
.enable {
    color: #eee;
    background: #eb3614;
}

.button-panel > span {
    line-height: 35px;
}
</style>