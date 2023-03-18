<template>
    <div class="bar">
        <div class="bar-number">
            <div :class="{number:true,active:selected==item}"
                v-for="(item,index) in list"
                @click="selectPage(item)">
                {{item+1}}页
            </div>
        </div>
        <span class="all"
            @click="openAll()">全部</span>
    </div>
</template>
<script>
export default {
    props: ["totalPage", "defaultPage"],
    data() {
        return {
            selected: 0,
            list: [],
        };
    },
    components: {},
    mounted() {
        if (this.totalPage > 0) {
            this.list = [];
            this.selected = this.defaultPage;
            for (let i = 0; i < this.totalPage; i++) {
                this.list.push(i);
            }
        }
    },
    methods: {
        selectPage(item) {
            this.selected = item;
            this.$emit("onPage", item);
        },
        openAll() {
            this.$emit("onOpenAll", this.totalPage);
        },
    },
    watch: {
        totalPage(n, o) {
            this.list = [];
            this.selected = this.defaultPage;
            for (let i = 0; i < this.totalPage; i++) {
                this.list.push(i);
            }
        },
        defaultPage(n, o) {
            this.selected = this.defaultPage;
        },
    },
};
</script>

<style scoped>
.bar {
    display: flex;
    flex-direction: row;
    line-height: 40px;
    background: #353535;
    font-size: 0.8rem;
    color: #fff;
}

.bar > .bar-number {
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
}

.bar .number,
.all {
    display: inline-block;
    width: 40px;
    text-align: center;
}

.active {
    background: #555;
}
</style>