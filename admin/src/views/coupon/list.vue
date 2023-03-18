<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      highlight-current-row
      :data="couponList"
      row-key="coupon_id"
      style="width: 100%; margin-top: 30px"
      border
    >
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
                    <el-tag :type="row | stateFilter">
                        {{_getStateStr(row.state)}}
                    </el-tag>
                </template>
            </el-table-column>
    </el-table>

    <el-dialog
      :visible.sync="dialogVisible"
      title="提现审核"
    >
    <div class="user-info">
        <img :src="_getDefaultImg(usercoupon.avatar)" />
        <div>
          <p><span>卡号：</span>{{ usercoupon.payee_bankno }}</p>
          <p><span>开户行：</span>{{ usercoupon.payee_bankname }}</p>
          <p><span>收款人：</span>{{ usercoupon.payee_name }}</p>
          <p><span>手机号：</span>{{ usercoupon.phone }}</p>
          <p><span>申请金额：</span>{{ usercoupon.amount }}</p>
          <p><span>提现前总收入：</span>{{ usercoupon.before_total_income }}</p>
          <p><span>提现前剩余可提现收益：</span>{{ usercoupon.before_availble_income }}</p>
        </div>
      </div>
      <el-form label-width="120px" :model="usercoupon" label-position="left">
        <el-form-item label="审核备注">
                    <el-input v-model="usercoupon.ack_reason"
                        placeholder="审核备注" />
                </el-form-item>

      </el-form>
      <div style="text-align: right">
        <el-button
          type="danger"
          @click="updateUsercoupon(-1)"
          >拒绝</el-button
        >
        <el-button
          type="primary"
          @click="updateUsercoupon(1)"
          >同意</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import { getUserCoupon } from "@/api/user";

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
  name: "couponList",
  props: {
    uid: {
      type: Number,
    },
  },
  data() {
    return {
      listLoading: true,
      couponList: [],
      usercoupon:[],
      dialogVisible: false
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
        return "已过期";
      } else if (state == 1) {
        return "正常";
      }
      return "已过期";
    },
    async getList() {
      let data = {
        uid: this.uid,
      };
      let res = await getUserCoupon(data);
      this.couponList = res.data;
      this.listLoading = false;
    },
    ackUsercoupon(row){
        this.usercoupon = row;
        this.dialogVisible = true;
    },
    async updateUsercoupon(ack) {
        this.usercoupon.ack = ack;
        let data = {
            uid:this.usercoupon.uid,
            coupon_id:this.usercoupon.id,
            ack,
            ack_reason:this.usercoupon.ack_reason
        }
      let {res_code,msg} = await ackUsercoupon(data);
      this.$message({
        message: msg,
        type: res_code > 0 ? "success" : "error",
      });
      if (res_code > 0) {
        this.getList();
        this.dialogVisible = false;
      }
    }
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
