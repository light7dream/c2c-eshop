<template>
    <div class="radiobutton"
        @click="onCheck"
        :style="{background:ischeck?'#11b9ac':'transparent'}">
        <span>{{content}}</span>
    </div>
</template>
<script>

export default {
    props: ["ischeck", "content", "keyword"],
    data() {
        return {};
    },
    components: {
    },
    methods: {
        onCheck() {
            if (!this.ischeck) {
                this.$emit("onCheck", this.keyword);
            }
        },
    },
};
</script>

<style scoped>
.radiobutton {
    line-height: 30px;
    color: #222;
    border-radius: 5px;
    text-align: center;
}

.radiobutton > .span {
    line-height: 30px;
}
</style>