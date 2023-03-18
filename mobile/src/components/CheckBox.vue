<template>
    <div class="ck-panel"
        @click="onClick">
        <i v-if="ischeck"
            :style="{'font-size':size?size+'em':'1.2em'}"
            class="mintui mintui-checkbox-checked"></i>
        <i v-if="!ischeck"
            :style="{'font-size':size?size+'em':'1.2em'}"
            class="mintui mintui-checkbox-weixuan"></i>
    </div>
</template>
<script>
export default {
    props: ["ischeck", "size"],
    data() {
        return {};
    },
    components: {},
    methods: {
        onClick() {
            this.$emit("onCheckChange", !this.ischeck);
            if (this.ischeck) {
                this.$emit("onChecked", !this.ischeck);
            } else {
                this.$emit("onUnchecked", !this.ischeck);
            }
        },
    },
};
</script>

<style scoped>
.ck-panel {
    position: relative;
    display: inline-block;
    text-align: center;
}
.ck-panel > i {
 transform: rotate(0.5turn);
}
</style>