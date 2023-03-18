<template>
    <div class="dndList">
        <div :style="{width:width2}"
            class="dndList-list">
            <h3>{{ list2Title }}</h3>
            <draggable :list="list2"
                group="article"
                class="dragArea">
                <div v-for="element in list2"
                    :key="element.gid"
                    class="list-complete-item">
                    <div class="list-complete-item-handle2"
                        @click="pushEle(element)">
                        <div class="blacklist-element">
                            <img :src="_getFirstImg(element.img)"
                                alt="">
                            <div>
                                <p>商品id：{{element.gid}}</p>
                                <p>{{element.name}}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </draggable>
        </div>
        <div :style="{width:width1}"
            class="dndList-list">
            <h3>{{ list1Title }}</h3>
            <draggable :set-data="setData"
                :list="list1"
                group="article"
                class="dragArea">
                <div v-for="element in list1"
                    :key="element.gid"
                    class="list-complete-item">
                    <div class="list-complete-item-handle">
                        <div class="blacklist-element">
                            <img :src="_getFirstImg(element.img)"
                                alt="">
                            <div>
                                <p>商品id：{{element.gid}}</p>
                                <p>{{element.name}}</p>
                            </div>
                        </div>
                    </div>
                    <div style="position:absolute;right:0px;">
                        <span style="float: right ;margin-top: -20px;margin-right:5px;"
                            @click="deleteEle(element)">
                            <i style="color:#ff4949"
                                class="el-icon-delete" />
                        </span>
                    </div>
                </div>
            </draggable>
        </div>
    </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
    name: "DndList",
    components: { draggable },
    props: {
        list1: {
            type: Array,
            default() {
                return [];
            },
        },
        list2: {
            type: Array,
            default() {
                return [];
            },
        },
        list1Title: {
            type: String,
            default: "list1",
        },
        list2Title: {
            type: String,
            default: "list2",
        },
        width1: {
            type: String,
            default: "48%",
        },
        width2: {
            type: String,
            default: "48%",
        },
    },
    methods: {
        isNotInList1(v) {
            return this.list1.every((k) => v.gid !== k.gid);
        },
        isNotInList2(v) {
            return this.list2.every((k) => v.gid !== k.gid);
        },
        deleteEle(ele) {
            for (const item of this.list1) {
                if (item.gid === ele.gid) {
                    const index = this.list1.indexOf(item);
                    this.list1.splice(index, 1);
                    break;
                }
            }
            if (this.isNotInList2(ele)) {
                this.list2.unshift(ele);
            }
        },
        pushEle(ele) {
            for (const item of this.list2) {
                if (item.gid === ele.gid) {
                    const index = this.list2.indexOf(item);
                    this.list2.splice(index, 1);
                    break;
                }
            }
            if (this.isNotInList1(ele)) {
                this.list1.push(ele);
            }
        },
        setData(dataTransfer) {
            // to avoid Firefox bug
            // Detail see : https://github.com/RubaXa/Sortable/issues/1012
            dataTransfer.setData("Text", "");
        },
        _getFirstImg(img) {
            if (img) {
                img = JSON.parse(img);
                return img[0]
                    ? img[0]
                    : require("../../../../assets/local/nothing.png");
            }
            return require("../../../../assets/local/nothing.png");
        },
    },
};
</script>

<style lang="scss" scoped>
.dndList {
    background: #fff;
    padding-bottom: 40px;
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    .dndList-list {
        float: left;
        padding-bottom: 30px;
        &:first-of-type {
            margin-right: 2%;
        }
        .dragArea {
            margin-top: 15px;
            min-height: 50px;
            padding-bottom: 30px;
        }
    }
}

.list-complete-item {
    cursor: pointer;
    position: relative;
    font-size: 14px;
    padding: 5px 12px;
    margin-top: 4px;
    border: 1px solid #bfcbd9;
    transition: all 1s;
}

.list-complete-item-handle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 50px;
}

.list-complete-item-handle2 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 20px;
}

.list-complete-item.sortable-chosen {
    background: #4ab7bd;
}

.list-complete-item.sortable-ghost {
    background: #30b08f;
}

.list-complete-enter,
.list-complete-leave-active {
    opacity: 0;
}

.blacklist-element {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.blacklist-element > img {
    width: 80px;
    height: 80px;
    margin-right: 30px;
}
</style>
