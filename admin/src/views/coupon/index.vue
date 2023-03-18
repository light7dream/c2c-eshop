<template>
    <div class="app-container">
        <div class="div-btn">
            <el-button type="primary"
                @click="handleAddNotice">添加优惠券</el-button>
        </div>

        <el-table v-loading="listLoading"
            highlight-current-row
            :data="coupons"
            row-key="id"
            style="width: 100%;margin-top:30px;"
            border>
            <el-table-column align="center"
                label="优惠券ID"
                width="80">
                <template slot-scope="scope">
                    {{ scope.row.id }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                :show-overflow-tooltip="true"
                width="240"
                label="优惠券">
                <template slot-scope="scope">
                    {{ scope.row.name }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="使用说明">
                <template slot-scope="scope">
                    {{ scope.row.description }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="优惠券价值(元)"
                width="100">
                <template slot-scope="scope">
                    {{ (scope.row.value/100).toFixed(2) }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="使用门槛(元)"
                width="100">
                <template slot-scope="scope">
                    {{ (scope.row.threshold/100).toFixed(2) }}
                </template>
            </el-table-column>

            <el-table-column align="center"
                label="有效时长(天)"
                :render-header="renderHeader"
                width="200">
                <template slot-scope="scope">
                    {{ scope.row.valid_day }}
                </template>
            </el-table-column>
            <el-table-column label="优惠券状态"
                align="center"
                class-name="status-col"
                width="100">
                <template slot-scope="{row}">
                    <el-tag :type="row | expireFilter">
                        {{_hasExpire(row)}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center"
                width="200"
                label="操作">
                <template slot-scope="scope">
                    <el-button type="primary"
                        size="small"
                        @click="handleEdit(scope)">修改</el-button>
                    <el-button type="danger"
                        size="small"
                        @click="handleDelete(scope)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :visible.sync="dialogVisible"
            :title="dialogType==='edit'?'修改优惠券':'新增优惠券'">
            <el-form :model="coupon"
                label-width="120px"
                label-position="left">
                <el-form-item label="优惠券">
                    <el-input v-model="coupon.name"
                        placeholder="优惠券" />
                </el-form-item>
                <el-form-item label="使用条件">
                    <el-input v-model="coupon.description"
                        :autosize="{ minRows: 6, maxRows: 10}"
                        type="textarea"
                        placeholder="请输入优惠券使用条件" />
                </el-form-item>
                <el-form-item label="优惠券价值(元)">
                    <el-input-number v-model="coupon.value"
                        placeholder="单位:(元)" />
                </el-form-item>
                <el-form-item label="使用门槛(元)">
                    <el-input-number v-model="coupon.threshold"
                        placeholder="单位:(元)" />
                </el-form-item>
                </el-form-item>

                <el-form-item label="有效期">
                    <el-input v-model="coupon.valid_day"
                        placeholder="有效期" />
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
import _ from "lodash";
import {
    getCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
} from "@/api/coupon";

const defaultCoupon = {
    id: 0,
    name: "",
    description: "",
    value: 0,
    threshold: 0,
    valid_day: 0,
};

export default {
    filters: {
        expireFilter(row) {
            if (row.valid_day <= 0) {
                return "success";
            }
            let dateTime = new Date();
            let exDate = new Date(row.create_time);
            exDate.setDate(exDate.getDate() + row.valid_day);
            if (exDate.getTime() > dateTime.getTime()) {
                return "success";
            }
            return "danger";
        },
    },
    data() {
        return {
            listLoading: true,
            coupons: [],
            coupon: Object.assign({}, defaultCoupon),
            dialogVisible: false,
            dialogType: "new",
        };
    },
    computed: {},
    created() {
        this.getCoupons();
    },
    methods: {
        async getCoupons() {
            this.listLoading = true;
            const res = await getCoupons();
            this.coupons = res.data;
            this.listLoading = false;
        },
        handleAddNotice() {
            this.coupon = Object.assign({}, defaultCoupon);
            this.dialogType = "new";
            this.dialogVisible = true;
        },
        handleEdit(scope) {
            this.dialogType = "edit";
            this.dialogVisible = true;
            this.coupon = _.cloneDeep(scope.row);
            this.coupon.value /= 100;
            this.coupon.threshold /= 100;
        },
        handleDelete({ $index, row }) {
            this.$confirm(
                "确定删除当前优惠券?不可恢复！！！如仍需使用建议使用 “不显示” 功能",
                "警告",
                {
                    confirmButtonText: "删除",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(async () => {
                    await deleteCoupon({ id: row.id });
                    this.coupons.splice($index, 1);
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
            let copyCoupon = _.cloneDeep(this.coupon);
            copyCoupon.value = parseInt(copyCoupon.value * 100);
            copyCoupon.threshold = parseInt(copyCoupon.threshold * 100);
            copyCoupon.valid_day = parseInt(copyCoupon.valid_day);
            if (isEdit) {
                await updateCoupon(copyCoupon);
                for (let index = 0; index < this.coupons.length; index++) {
                    if (this.coupons[index].id === copyCoupon.id) {
                        this.coupons.splice(
                            index,
                            1,
                            Object.assign({}, copyCoupon)
                        );
                        break;
                    }
                }
            } else {
                const { data } = await addCoupon(copyCoupon);
                copyCoupon.id = data;
                this.coupons.push(copyCoupon);
            }

            this.dialogVisible = false;
            this.$notify({
                title: "成功",
                dangerouslyUseHTMLString: true,
                message: `
                    <div>优惠券id: ${this.coupon.id}</div>
                    <div>优惠券: ${this.coupon.name}</div>
                `,
                type: "success",
            });
        },
        _hasExpire(row) {
            if (row.valid_day <= 0) {
                return "长期有效";
            }
            let dateTime = new Date();
            let exDate = new Date(row.create_time);
            exDate.setDate(exDate.getDate() + row.valid_day);
            if (exDate.getTime() > dateTime.getTime()) {
                return "有效";
            }
            return "过期";
        },
        renderHeader(h, { column, $index }) {
            // 这里在最外层插入一个div标签
            return h("div", [
                // h即为cerateElement的简写
                // 在div里面插入span
                h("span", {
                    // 表示内容
                    domProps: {
                        innerHTML: column.label,
                    },
                    on: {
                        click: () => {
                            console.log(`${column.label}   ${$index}`);
                        },
                    },
                }),
                h(
                    "el-tooltip",
                    {
                        // 表示属性
                        attrs: {
                            effect: "dark",
                            content: "设置小于等于0时,为永久有效",
                            placement: "top",
                        },
                    },
                    [
                        h("i", {
                            class: "el-icon-warning table-msg",
                        }),
                    ]
                ),
            ]);
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
</style>
