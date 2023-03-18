<template>
    <div :class="{'button-panel':true,'fill':fill=='fill','block':fill=='block','disable':disable==true}"
        @click="onClick">
        <span>{{content}}</span>
    </div>
</template>
<script>
export default {
    props: ["content", "keyword", "enable", "fill"],
    data() {
        return {
            disable: false,
        };
    },
    components: {},
    created() {
        if (this.enable == null || this.enable == undefined) {
            this.disable = false;
        } else {
            this.disable = !this.enable;
        }
    },
    methods: {
        onClick() {
            if (!this.disable) {
                this.$emit("onClick", this.keyword);
            }
        },
    },
    watch: {
        enable(n, o) {
            this.disable = !this.enable;
        },
    },
};
</script>

<style scoped>
.button-panel {
    padding: 2px;
    text-align: center;
    border: solid 1px #222;
    border-radius: 2px;
    font-size: 0.9rem;
}

.fill {
    background: #222;
    color: #fff;
}

.block {
    background: transparent;
    color: #222;
}

.disable {
    color: #999;
    background: #e5e5e5;
    border-color: #e5e5e5;
}
</style>