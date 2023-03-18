<template>
    <div class="yellowcard">
        <div class="left"
            @click="onClick('Left')">
            <p>{{leftunit}}<span>{{leftvalue}}</span></p>
            <p>{{lefttitle}}</p>
        </div>
        <div class="verticalLine"
            :style="{height:lineHeight?lineHeight+'px':'60px'}" />
        <div class="right"
            @click="onClick('Right')">
            <p>{{rightunit}}<span>{{rightvalue}}</span></p>
            <p>{{righttitle}}</p>
        </div>
    </div>
</template>
<script>
export default {
    props: [
        "lineHeight",
        "lefttitle",
        "leftunit",
        "leftvalue",
        "righttitle",
        "rightunit",
        "rightvalue",
    ],
    data() {
        return {};
    },
    components: {},
    methods: {
        onClick(key) {
            this.$emit(`on${key}Click`, key);
        },
    },
};
</script>

<style scoped>
.yellowcard {
    border-radius: 10px;
    padding: 20px 0;
    /* background-image: linear-gradient(#555, #222); */
    background-image: linear-gradient(#11B9AC, #13d6c6);
    color: #eee;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
.yellowcard > .left,
.right {
    text-align: center;
    flex: 1;
}
.yellowcard > .left > p > span {
    font-size: 2em;
}
.yellowcard > .right > p > span {
    font-size: 2em;
}

.verticalLine {
    border: solid #ccc;
    margin: 10px;
    border-width: 0 0 0 1px;
}
</style>