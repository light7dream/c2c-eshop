<template>
    <div class="app-container">
        <el-form inline
            label-width="110px"
            label-position="left">
            <el-form-item label="提现状态">
                <el-select v-model="selectState"
                    placeholder="请选择" @change="getList">
                    <el-option v-for="item in stateOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>

        <el-table v-loading="listLoading"
            highlight-current-row
            :data="withdrawalList"
            row-key="withdrawal_id"
            style="width: 100%; margin-top: 30px"
            border>
            <el-table-column align="center"
                label="申请金额">
                <template slot-scope="scope">
                    {{ scope.row.amount / 100 }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="提现前总收入">
                <template slot-scope="scope">
                    {{ scope.row.before_total_income / 100 }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="提现前剩余可提现收益">
                <template slot-scope="scope">
                    {{ scope.row.before_availble_income / 100 }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="总销">
                <template slot-scope="scope">
                    {{ scope.row.总销.nickname }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="申请时间">
                <template slot-scope="scope">
                    {{ scope.row.create_time }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="确认时间">
                <template slot-scope="scope">
                    {{ scope.row.verify_time }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="审核结果">
                <template slot-scope="{ row }">
                    {{ row.msg }}
                </template>
            </el-table-column>
            <el-table-column label="状态"
                align="center"
                class-name="status-col"
                width="80">
                <template slot-scope="{ row }">
                    <el-tag :type="row.state | stateFilter">
                        {{ _getStateStr(row.state) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center"
                width="200"
                label="操作">
                <template slot-scope="scope">
                    <el-button type="primary"
                        size="small"
                        @click="ackUserWithdrawal(scope.row)">审核</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :visible.sync="dialogVisible"
            title="提现审核">
            <div class="user-info">
                <img :src="_getDefaultImg(userWithdrawal.avatar)" />
                <div>
                    <p><span>卡号：</span>{{ userWithdrawal.payee_bankno }}</p>
                    <p><span>开户行：</span>{{ userWithdrawal.payee_bankname }}</p>
                    <p><span>收款人：</span>{{ userWithdrawal.payee_name }}</p>
                    <p><span>手机号：</span>{{ userWithdrawal.phone }}</p>
                    <p><span>申请金额：</span>{{ userWithdrawal.amount / 100 }}</p>
                    <p><span>提现前总收入：</span>{{ userWithdrawal.before_total_income / 100 }}</p>
                    <p><span>提现前剩余可提现收益：</span>{{ userWithdrawal.before_availble_income / 100 }}</p>
                </div>
            </div>
            <el-form label-width="120px"
                :model="userWithdrawal"
                label-position="left">
                <el-form-item label="审核备注">
                    <el-input v-model="userWithdrawal.ack_reason"
                        placeholder="审核备注" />
                </el-form-item>

            </el-form>
            <div style="text-align: right">
                <el-button type="danger"
                    @click="updateUserWithdrawal(-1)">拒绝</el-button>
                <el-button type="primary"
                    @click="updateUserWithdrawal(1)">同意</el-button>
            </div>
        </el-dialog>

        <!-- 分页 -->
        <el-pagination class="pagination"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :page-size="page.page_size"
            :pager-count="11"
            :total="page.total_count">
        </el-pagination>
    </div>
</template>

<script>
import _ from "lodash";
import {
    getUserWithdrawalList,
    ackUserWithdrawal,
    getWithdrawalList,
} from "@/api/user";

export default {
    filters: {
        stateFilter(state) {
            if (state == 0) {
                return "danger";
            } else if (state == 1) {
                return "success";
            }
            return "warning";
        },
    },
    name: "withdrawal",
    props: {
        uid: {
            type: Number,
        },
    },
    data() {
        return {
            listLoading: true,
            withdrawalList: [],
            userWithdrawal: [],
            dialogVisible: false,
            page: {
                page_index: 0,
                page_size: 10,
                total_count: 0,
            },
            selectState: 0,
            stateOptions: [
                { label: "申请中", value: 0 },
                { label: "拒绝", value: -1 },
                { label: "通过", value: 1 },
            ],
        };
    },
    computed: {},
    created() {
        this.getList();
    },
    methods: {
        _getDefaultImg(img) {
            if (img) {
                return img;
            }
            return require("../../assets/local/nothing.png");
        },
        _getStateStr(state) {
            if (state == 0) {
                return "申请中";
            } else if (state == 1) {
                return "通过";
            }
            return "拒绝";
        },
        async getList() {
            let data = {
                ...this.page,
                uid: this.uid,
                state: this.selectState,
            };
            let res = await (this.uid
                ? getUserWithdrawalList(data)
                : getWithdrawalList(data));
            this.withdrawalList = res.data.list;
            this.page.page_index = res.data.page_index;
            this.page.page_size = res.data.page_size;
            this.page.total_count = res.data.total_count;
            this.listLoading = false;
        },
        ackUserWithdrawal(row) {
            this.userWithdrawal = row;
            this.dialogVisible = true;
        },
        async updateUserWithdrawal(ack) {
            this.userWithdrawal.ack = ack;
            let data = {
                uid: this.userWithdrawal.uid,
                withdrawal_id: this.userWithdrawal.id,
                ack,
                ack_reason: this.userWithdrawal.ack_reason,
            };
            let { res_code, msg } = await ackUserWithdrawal(data);
            this.$message({
                message: msg,
                type: res_code > 0 ? "success" : "error",
            });
            if (res_code > 0) {
                this.getList();
                this.dialogVisible = false;
            }
        },
        async handleSizeChange(val) {
            this.page.page_size = val;
            await this.getList();
        },
        async handleCurrentChange(val) {
            this.page.page_index = val - 1;
            await this.getList();
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
.user-info {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 20px;
}
.user-info > img {
    width: 150px;
    height: 150px;
    margin-right: 30px;
}
.user-info > div span {
    margin-right: 15px;
    opacity: 0.6;
}
</style>
