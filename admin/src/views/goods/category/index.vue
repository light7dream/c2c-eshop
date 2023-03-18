<template>
    <div class="app-container">
        <el-button type="primary"
            @click="handleAddCategory">添加分类</el-button>

      <el-button
        type="primary"
        @click="onSyncCommon('category')"
        icon="el-icon-refresh"
        >推送分类</el-button
      >
        <el-table :data="categoris"
            style="width: 100%;margin-top:30px;"
            border>
            <el-table-column align="center"
                label="分类ID"
                width="100">
                <template slot-scope="scope">
                    {{ scope.row.cid }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="分类">
                <template slot-scope="scope">
                    {{ scope.row.name }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                width="200"
                label="分类图片">
                <template slot-scope="scope">
                    <img class="category-img"
                        :src="scope.row.img"
                        alt="">
                </template>
            </el-table-column>
            <el-table-column label="状态"
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
            :title="dialogType==='edit'?'修改分类':'新增分类'">
            <el-form :model="category"
                label-width="80px"
                label-position="left">
                <el-form-item label="分类名称">
                    <el-input v-model="category.name"
                        placeholder="分类名称" />
                </el-form-item>
                <el-form-item label="分类图片">
                    <div class="div-upload">
                        <el-upload class="avatar-uploader"
                            action="web/oss/getAuth"
                            :show-file-list="false"
                            :http-request="handleAvatarSuccess"
                            :before-upload="beforeAvatarUpload">
                            <img v-if="category.img"
                                :src="category.img"
                                class="avatar">
                            <i v-else
                                class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                        <p>点击图片更换</p>
                    </div>

                </el-form-item>
            </el-form>
            <div style="text-align:right;">
                <el-button type="danger"
                    @click="dialogVisible=false">取消</el-button>
                <el-button type="primary"
                    @click="confirmCategory">确认</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
import _ from "lodash";
import {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getUploadAuth,
} from "@/api/category";
import { uplaodImage } from "@/utils/oss";
import { syncCommon } from "@/api/syncdb";

const defaultCategory = {
    cid: 0,
    name: "",
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
            categoris: [],
            category: Object.assign({}, defaultCategory),
            dialogVisible: false,
            dialogType: "new",
            ossAuth: { authType: "admin" },
        };
    },
    components: {},
    computed: {},
    created() {
        this.getCategories();
    },
    methods: {
        async getCategories() {
            const res = await getCategories();
            this.categoris = res.data;
        },
    async onSyncCommon(key) {
      let data = await syncCommon({ key });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
        handleAddCategory() {
            this.category = Object.assign({}, defaultCategory);
            this.dialogType = "new";
            this.dialogVisible = true;
        },
        handleEdit(scope) {
            this.dialogType = "edit";
            this.dialogVisible = true;
            this.category = _.cloneDeep(scope.row);
        },
        async handleModifyState(row, strState) {
            let copyRow = _.cloneDeep(row);

            if (strState == "hidden") {
                copyRow.state = 0;
            } else if (strState == "show") {
                copyRow.state = 1;
            }

            await updateCategory(copyRow);
            for (let index = 0; index < this.categoris.length; index++) {
                if (this.categoris[index].cid === copyRow.cid) {
                    this.categoris.splice(index, 1, Object.assign({}, copyRow));
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
                "确定删除当前分类?不可恢复！！！如仍需使用建议使用 “不显示” 功能",
                "警告",
                {
                    confirmButtonText: "删除",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(async () => {
                    await deleteCategory({ cid: row.cid });
                    this.categoris.splice($index, 1);
                    this.$message({
                        type: "success",
                        message: "删除成功!",
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        },
        async confirmCategory() {
            const isEdit = this.dialogType === "edit";

            if (isEdit) {
                await updateCategory(this.category);
                for (let index = 0; index < this.categoris.length; index++) {
                    if (this.categoris[index].cid === this.category.cid) {
                        this.categoris.splice(
                            index,
                            1,
                            Object.assign({}, this.category)
                        );
                        break;
                    }
                }
            } else {
                const { data } = await addCategory(this.category);
                this.category.cid = data;
                this.categoris.push(this.category);
            }

            this.dialogVisible = false;
            this.category.updateInfo = undefined;

            this.$notify({
                title: "成功",
                dangerouslyUseHTMLString: true,
                message: `
                    <div>分类id: ${this.category.cid}</div>
                    <div>分类名称: ${this.category.name}</div>
                `,
                type: "success",
            });
        },
        async handleAvatarSuccess(fileData) {
            let res = await getUploadAuth({ authType: "goods-category",cid:(this.category.cid==0?-1:this.category.cid) });
            let sts = res.data;
            let result = await uplaodImage(fileData.file, sts);

            if (result.res && result.res.status == 200) {
                this.$notify({
                    title: "上传完成",
                    type: "success",
                });
                this.category.img = result.url;
                console.log("--- upload ok ---");
                console.log(result);
            } else {
                this.$notify({
                    title: "上传失败",
                    type: "error",
                });
                console.log("--- upload err ---");
                console.log(result);
            }
        },
        beforeAvatarUpload(file) {
            const isJPG =
                file.type === "image/jpeg" || file.type === "image/png";
            const isLt20M = file.size / 1024 / 1024 < 20;

            if (!isJPG) {
                this.$message.error("上传头像图片只能是 JPG 或 PNG 格式!");
            }
            if (!isLt20M) {
                this.$message.error("上传头像图片大小不能超过 20MB!");
            }
            return isJPG && isLt20M;
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

.category-img {
    width: 45px;
    height: 45px;
    border-radius: 5px;
    caret-color: transparent;
}

.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
}
.avatar {
    width: 178px;
    height: 178px;
    display: block;
}

.div-upload {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.div-upload > p {
    margin-left: 20px;
    caret-color: transparent;
}
</style>
