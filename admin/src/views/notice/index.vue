<template>
    <div class="app-container">
        <div class="div-btn">
            <el-button type="primary"
                @click="handleAddNotice">添加公告</el-button>
            <el-button :type="needUpdateOrder?'primary':'info'"
                :disabled="!needUpdateOrder"
                @click="handleUpdateNoticeOrder">更新顺序</el-button>
        </div>
        <!-- Note that row-key(nid) is necessary to get a correct row order. -->
        <el-table ref="dragTable"
            v-loading="listLoading"
            highlight-current-row
            :data="notices"
            row-key="nid"
            style="width: 100%;margin-top:30px;"
            border>
            <el-table-column align="center"
                label="公告ID"
                width="100">
                <template slot-scope="scope">
                    {{ scope.row.nid }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                :show-overflow-tooltip="true"
                width="450"
                label="公告短标题">
                <template slot-scope="scope">
                    {{ scope.row.summary }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                :show-overflow-tooltip="true"
                label="公告详情">
                <template slot-scope="scope">
                    {{ scope.row.notice }}
                </template>
            </el-table-column>
            <el-table-column label="公告状态"
                align="center"
                class-name="status-col"
                width="100">
                <template slot-scope="{row}">
                    <el-tag :type="row.state | stateFilter">
                        {{ row.state==1?'可见':row.state==0?'隐藏':'未知' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center"
                width="300"
                label="操作">
                <template slot-scope="scope">
                    <el-button type="primary"
                        size="small"
                        @click="handleEdit(scope)">修改</el-button>
                    <el-button v-if="scope.row.state!=0"
                        size="small"
                        @click="handleModifyState(scope.row,'hidden')">
                        隐藏
                    </el-button>
                    <el-button v-if="scope.row.state!=1"
                        size="small"
                        type="success"
                        @click="handleModifyState(scope.row,'show')">
                        显示
                    </el-button>
                    <el-button type="danger"
                        size="small"
                        @click="handleDelete(scope)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :visible.sync="dialogVisible"
            :title="dialogType==='edit'?'修改公告':'新增公告'">
            <el-form :model="notice"
                label-width="120px"
                label-position="left">
                <el-form-item label="公告短标题">
                    <el-input v-model="notice.summary"
                        placeholder="公告短标题" />
                </el-form-item>
                <el-form-item label="公告详情">
                    <el-input v-model="notice.notice"
                        :autosize="{ minRows: 6, maxRows: 10}"
                        type="textarea"
                        placeholder="请输入公告详情" />
                </el-form-item>
            </el-form>
            <div style="text-align:right;">
                <el-button type="danger"
                    @click="dialogVisible=false">取消</el-button>
                <el-button type="primary"
                    @click="confirmNotice">确认</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
import Sortable from "sortablejs";
import _ from "lodash";
import {
    getNotices,
    addNotice,
    updateNotice,
    updateNoticeOrder,
    deleteNotice,
} from "@/api/notice";

const defaultNotice = {
    nid: 0,
    summary: "",
    img: "",
    state: 1,
};

export default {
    filters: {
        stateFilter(state) {
            if (state == 1) {
                return "success";
            } else if (state == 0) {
                return "danger";
            } else {
                return "info";
            }
        },
    },
    data() {
        return {
            listLoading: true,
            notices: [],
            notice: Object.assign({}, defaultNotice),
            dialogVisible: false,
            dialogType: "new",
            sortable: null,
            oldList: [],
            newList: [],
            needUpdateOrder: false,
        };
    },
    computed: {},
    created() {
        this.getNotices();
    },
    methods: {
        async getNotices() {
            this.listLoading = true;
            const res = await getNotices();
            this.notices = res.data;
            this.listLoading = false;
            this.needUpdateOrder = false;
            this.initListMap();
            this.$nextTick(() => {
                this.setSort();
            });
        },
        initListMap() {
            this.oldList = [];
            this.newList = [];
            if (this.notices.length > 0) {
                this.oldList = this.notices.map((v) => v.nid);
                this.newList = this.oldList.slice();
            }
            this.needUpdateOrder = false;
        },
        setSort() {
            const el = this.$refs.dragTable.$el.querySelectorAll(
                ".el-table__body-wrapper > table > tbody"
            )[0];

            this.sortable = Sortable.create(el, {
                ghostClass: "sortable-ghost", // Class name for the drop placeholder,
                setData: function (dataTransfer) {
                    // to avoid Firefox bug
                    // Detail see : https://github.com/RubaXa/Sortable/issues/1012
                    dataTransfer.setData("Text", "");
                },
                onEnd: (evt) => {
                    const targetRow = this.notices.splice(evt.oldIndex, 1)[0];
                    this.notices.splice(evt.newIndex, 0, targetRow);

                    // for show the changes, you can delete in you code
                    const tempIndex = this.newList.splice(evt.oldIndex, 1)[0];
                    this.newList.splice(evt.newIndex, 0, tempIndex);
                    this.needUpdateOrder = true;
                },
            });
        },
        handleAddNotice() {
            this.notice = Object.assign({}, defaultNotice);
            this.dialogType = "new";
            this.dialogVisible = true;
        },
        handleEdit(scope) {
            this.dialogType = "edit";
            this.dialogVisible = true;
            this.notice = _.cloneDeep(scope.row);
        },
        async handleModifyState(row, strState) {
            let copyRow = _.cloneDeep(row);

            if (strState == "hidden") {
                copyRow.state = 0;
            } else if (strState == "show") {
                copyRow.state = 1;
            }

            await updateNotice(copyRow);
            for (let index = 0; index < this.notices.length; index++) {
                if (this.notices[index].nid === copyRow.nid) {
                    this.notices.splice(index, 1, Object.assign({}, copyRow));
                    break;
                }
            }

            this.$message({
                message: "操作成功",
                type: "success",
            });
            row.state = copyRow.state;
        },
        handleDelete({ $index, row }) {
            this.$confirm(
                "确定删除当前公告?不可恢复！！！如仍需使用建议使用 “不显示” 功能",
                "警告",
                {
                    confirmButtonText: "删除",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(async () => {
                    await deleteNotice({ nid: row.nid });
                    this.notices.splice($index, 1);
                    this.$message({
                        type: "success",
                        message: "删除成功!",
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        },
        async confirmNotice() {
            const isEdit = this.dialogType === "edit";

            if (isEdit) {
                await updateNotice(this.notice);
                for (let index = 0; index < this.notices.length; index++) {
                    if (this.notices[index].nid === this.notice.nid) {
                        this.notices.splice(
                            index,
                            1,
                            Object.assign({}, this.notice)
                        );
                        break;
                    }
                }
            } else {
                const { data } = await addNotice(this.notice);
                this.notice.nid = data;
                this.notices.push(this.notice);
            }

            this.dialogVisible = false;
            this.$notify({
                title: "成功",
                dangerouslyUseHTMLString: true,
                message: `
                    <div>公告id: ${this.notice.nid}</div>
                    <div>公告短标题: ${this.notice.summary}</div>
                `,
                type: "success",
            });
        },
        async handleUpdateNoticeOrder() {
            let resData = await updateNoticeOrder({
                oldList: this.oldList,
                newList: this.newList,
            });

            this.notices = resData.data;
            this.initListMap();

            this.$message({
                type: "success",
                message: resData.msg,
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.app-container {
    .roles-table {
        margin-top: 30px;
    }
    .permission-tree {
        margin-bottom: 30px;
    }
}

.sortable-ghost {
    opacity: 0.8;
    color: #fff !important;
    background: #42b983 !important;
}

.icon-star {
    margin-right: 2px;
}
.drag-handler {
    width: 20px;
    height: 20px;
    cursor: pointer;
}
.show-d {
    margin-top: 15px;
}
</style>
