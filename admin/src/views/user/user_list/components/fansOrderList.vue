<template>
    <div class="app-container">
        <el-table :data="userList"
            style="width: 100%; margin-top: 30px"
            border>
            <el-table-column align="center"
                label="订单号">
                <template slot-scope="scope">
                    {{ scope.row.order_no }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="下单时间">
                <template slot-scope="scope">
                    {{ scope.row.create_time }}
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="商品价格">
                <template slot-scope="scope">
                    {{ scope.row.g_price / 100 }}元
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="商品信息">
                <template slot-scope="scope">
                    <el-popover placement="top"
                        width="420"
                        trigger="hover">
                        <el-form label-position="left"
                            class="demo-table-expand">
                            <el-form-item label="商品名称">
                                <span>{{ scope.row.goods_name }}</span>
                            </el-form-item>
                            <el-form-item label="商品单价">
                                <span>{{ scope.row.g_price / 100 }}元</span>
                            </el-form-item>
                            <el-form-item label="购买件数">
                                <span>{{ scope.row.g_count }}</span>
                            </el-form-item>
                            <el-form-item label="">
                                <el-carousel :interval="4000">
                                    <el-carousel-item v-for="(item, i) in JSON.parse(scope.row.goods_img)"
                                        :key="i">
                                        <img :src="item"
                                            width="400" />
                                    </el-carousel-item>
                                </el-carousel>
                            </el-form-item>
                        </el-form>
                        <el-button type="text"
                            slot="reference">{{
              scope.row.goods_name
            }}</el-button>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column align="center"
                :show-overflow-tooltip="true"
                label="买方信息">
                <template slot-scope="scope">
                    <el-popover placement="top"
                        width="320"
                        trigger="hover">
                        <el-form label-position="left"
                            class="demo-table-expand">
                            <el-form-item label="用户名">
                                <span>{{ scope.row.buyer_nickname }}</span>
                            </el-form-item>
                            <el-form-item label="开户行">
                                <span>{{ scope.row.buyer_bankname }}</span>
                            </el-form-item>
                            <el-form-item label="卡号">
                                <span>{{ scope.row.buyer_bankno }}</span>
                            </el-form-item>
                            <el-form-item label="收款人">
                                <span>{{ scope.row.buyer_payeename }}</span>
                            </el-form-item>
                            <el-form-item label="电话">
                                <span>{{ scope.row.buyer_phone }}</span>
                            </el-form-item>
                        </el-form>
                        <el-button type="text"
                            slot="reference">{{
              scope.row.buyer_nickname
            }}</el-button>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="卖方信息">
                <template slot-scope="scope">
                    <el-popover placement="top"
                        width="320"
                        trigger="hover">
                        <el-form label-position="left"
                            class="demo-table-expand">
                            <el-form-item label="用户名">
                                <span>{{ scope.row.saler_nickname }}</span>
                            </el-form-item>
                            <el-form-item label="开户行">
                                <span>{{ scope.row.saler_bankname }}</span>
                            </el-form-item>
                            <el-form-item label="卡号">
                                <span>{{ scope.row.saler_bankno }}</span>
                            </el-form-item>
                            <el-form-item label="收款人">
                                <span>{{ scope.row.saler_payeename }}</span>
                            </el-form-item>
                            <el-form-item label="电话">
                                <span>{{ scope.row.saler_phone }}</span>
                            </el-form-item>
                        </el-form>
                        <el-button type="text"
                            slot="reference">{{
              scope.row.saler_nickname
            }}</el-button>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column align="center"
                label="支付凭证">
                <template slot-scope="scope">
                    <el-button type="text"
                        @click="viewOrderPayImg(scope.row.uid, scope.row.order_id)">查看</el-button>
                </template>
            </el-table-column>
            <el-table-column label="状态"
                align="center"
                class-name="status-col"
                width="120">
                <template slot-scope="{ row }">
                    <el-tag :type="row.pay_state | stateFilter">
                        {{ _getStateStr(row.pay_state) }}
                    </el-tag>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :title="viewOrderPayImgTitle"
            :append-to-body='true'
            :visible.sync="viewOrderPayImgDialogVisible">
            <el-carousel width="100%"
                :interval="4000">
                <el-carousel-item v-for="(item, i) in orderPayImgList"
                    :key="i">
                    <img :src="item.img"
                        style="width: 380px; margin: 10px" />

                </el-carousel-item>
            </el-carousel>
            <div slot="footer"
                class="dialog-footer">
                <el-button @click="viewOrderPayImgDialogVisible = false">关闭</el-button>
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
    getUserFansOrder,
    getUserOrderList,
    viewOrderPayImg,
} from "@/api/user";

export default {
    name: "orderList",
    props: {
        uid: {
            type: Number,
        },
        orderType: {
            type: String,
            default: "",
        },
    },
    filters: {
        stateFilter(state) {
            if (state == 0) {
                return "info";
            } else if (state == 1) {
                return "primary";
            } else if (state == 2) {
                return "success";
            }
            return "warning";
        },
    },
    data() {
        return {
            submitBtnLock: false,
            userList: [],
            orderPayImgList: [],
            viewOrderPayImgDialogVisible: false,
            viewOrderPayImgTitle: "",
            page: {
                page_index: 0,
                page_size: 10,
                total_count: 0,
            },
        };
    },
    computed: {},
    async created() {
        this.getUserOrderList();
    },
    methods: {
        async viewOrderPayImg(uid, order_id) {
            let data = {
                uid,
                order_id,
            };
            let res = await viewOrderPayImg(data);
            this.orderPayImgList = res.data;
            this.viewOrderPayImgDialogVisible = true;
            this.viewOrderPayImgTitle = "查看支付凭证";
        },
        async getUserOrderList() {
            let data = {
                ...this.page,
                uid: this.uid,
                order_type: this.orderType,
            };
            let res = await (this.orderType == "fansOrder"
                ? getUserFansOrder(data)
                : getUserOrderList(data));
            this.userList = res.data.list;
            this.page.page_index = res.data.page_index;
            this.page.page_size = res.data.page_size;
            this.page.total_count = res.data.total_count;
        },
        _getDefaultImg(img) {
            if (img) {
                return img;
            }
            return require("../../../../assets/local/nothing.png");
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
        _getStateStr(state) {
            if (state == 0) {
                return "待支付";
            } else if (state == 1) {
                return "买家已支付";
            } else if (state == 2) {
                return "卖家已确认";
            }
            return "未知";
        },
        async handleSizeChange(val) {
            this.page.page_size = val;
            await this.getUserOrderList();
        },
        async handleCurrentChange(val) {
            this.page.page_index = val - 1;
            await this.getUserOrderList();
        },
    },
};
</script>

<style lang="scss" scoped>
.demo-table-expand {
    font-size: 0;
}
.demo-table-expand label {
    width: 90px;
    color: #99a9bf;
}
.demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
}
.app-container {
    .roles-table {
        margin-top: 30px;
    }
    .permission-tree {
        margin-bottom: 30px;
    }
}

.goods-img {
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

.img-list {
    word-wrap: break-all;
    caret-color: transparent;
}
.img-list img {
    width: 90px;
    height: 90px;
    border: solid 1px #eee;
    margin: 5px;
}
.img-list .mask {
    position: absolute;
    top: 5px;
    left: 5px;
    background: #0005;
    width: 90px;
    height: 90px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #eee;
    opacity: 0;
}
.img-list .mask i {
    flex: 1;
}
.img-list > div {
    position: relative;
    display: inline-block;
}
.img-list > div:hover .mask {
    opacity: 1;
}

.pagination {
    margin: 20px 0;
}

.div-recommender {
    font-size: 0.8em;
    padding: 0;
    margin: 0;
    text-align: left;
}
.div-recommender p {
    margin: 2px;
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

.blacklist-element {
    margin: 3px;
    padding: 5px;
    width: 200px;
    border-radius: 5px;
    background: #efefef;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.blacklist-element > img {
    width: 60px;
    height: 60px;
    margin-right: 10px;
}
.blacklist-element > div {
    text-align: left;
}
.blacklist-element > div p {
    line-height: 30px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.selected-black-list {
    word-wrap: break-word;
}
.el-carousel__item {
    overflow: auto;
    text-align: center;
}
</style>
