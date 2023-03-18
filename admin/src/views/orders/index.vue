<template>
  <div class="app-container">
    <el-form inline label-width="110px" label-position="left">
      <el-form-item label="商品名称">
        <el-input placeholder="商品名称" v-model="search.goodName" />
      </el-form-item>
      <el-form-item label="总经销">
        <el-select v-model="search.topUid" placeholder="请选择">
          <el-option label="请选择" value=""> </el-option>
          <el-option
            v-for="item in topUidoptions"
            :key="item.uid"
            :label="item.nickname"
            :value="item.uid"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="卖方手机号">
        <el-input placeholder="卖方手机号" v-model="search.salerPhone" />
      </el-form-item>
      <el-form-item label="买方手机号">
        <el-input placeholder="买方手机号" v-model="search.buyerPhone" />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="search.payState" placeholder="请选择">
          <el-option label="请选择" value=""> </el-option>
          <el-option
            v-for="item in payStateoptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="下单时间">
        <el-date-picker
          v-model="search.createdDate"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        >
        </el-date-picker>
      </el-form-item>
      <el-button type="success" @click="getUserOrderList">搜索</el-button>
      <el-button type="warning" @click="exportUserOrderList">导出</el-button>
    </el-form>

    <el-table :data="userList" style="width: 100%; margin-top: 30px" border>
      <el-table-column align="center" label="订单号">
        <template slot-scope="scope">
          {{ scope.row.order_no }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="下单时间">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品价格">
        <template slot-scope="scope">
          {{ scope.row.g_price / 100 }}元
        </template>
      </el-table-column>
      <el-table-column align="center" label="所属总销">
        <template slot-scope="scope">
          {{ scope.row.总销.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品信息">
        <template slot-scope="scope">
          <el-popover placement="top" width="420" trigger="hover">
            <el-form label-position="left" class="demo-table-expand">
              <el-form-item label="商品名称">
                <span>{{ scope.row.商品name }}</span>
              </el-form-item>
              <el-form-item label="商品价格">
                <span>{{ scope.row.g_price / 100 }}元</span>
              </el-form-item>
            </el-form>
            <el-button type="text" slot="reference">{{
              scope.row.商品name
            }}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="center" label="买方信息">
        <template slot-scope="scope">
          <el-popover placement="top" width="320" trigger="hover">
            <el-form label-position="left" class="demo-table-expand">
              <el-form-item label="用户名">
                <span>{{ scope.row.买方nickname }}</span>
              </el-form-item>
              <el-form-item label="开户行">
                <span>{{ scope.row.买方bankname }}</span>
              </el-form-item>
              <el-form-item label="卡号">
                <span>{{ scope.row.买方bankno }}</span>
              </el-form-item>
              <el-form-item label="收款人">
                <span>{{ scope.row.买方payeename }}</span>
              </el-form-item>
              <el-form-item label="电话">
                <span>{{ scope.row.买方phone }}</span>
              </el-form-item>
            </el-form>
            <el-button type="text" slot="reference">{{
              scope.row.买方nickname == null
                ? "卖方信息未找到"
                : scope.row.买方nickname
            }}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :show-overflow-tooltip="true"
        label="卖方信息"
      >
        <template slot-scope="scope">
          <el-popover placement="top" width="320" trigger="hover">
            <el-form label-position="left" class="demo-table-expand">
              <el-form-item label="用户名">
                <span>{{ scope.row.卖方nickname }}</span>
              </el-form-item>
              <el-form-item label="开户行">
                <span>{{ scope.row.卖方bankname }}</span>
              </el-form-item>
              <el-form-item label="卡号">
                <span>{{ scope.row.卖方bankno }}</span>
              </el-form-item>
              <el-form-item label="收款人">
                <span>{{ scope.row.卖方payeename }}</span>
              </el-form-item>
              <el-form-item label="电话">
                <span>{{ scope.row.卖方phone }}</span>
              </el-form-item>
            </el-form>
            <el-button type="text" slot="reference">{{
              scope.row.卖方nickname == null
                ? "卖方信息未找到"
                : scope.row.卖方nickname
            }}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="center" label="支付凭证">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="viewOrderPayImg(scope.row.uid, scope.row.order_id)"
            >查看</el-button
          >
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-button type="danger" size="small" @click="onCancleOrder(scope.row)" v-if="scope.row.pay_state==0">取消订单</el-button>
        </template>
      </el-table-column>

    </el-table>

    <el-dialog
      :title="viewOrderPayImgTitle"
      :visible.sync="viewOrderPayImgDialogVisible"
    >
      <el-carousel width="100%" :interval="4000">
        <el-carousel-item v-for="(item, i) in orderPayImgList" :key="i">
          <img :src="item.img" width="100%" />
        </el-carousel-item>
      </el-carousel>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOrderPayImgDialogVisible = false"
          >关闭</el-button
        >
      </div>
    </el-dialog>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :page-size="page.page_size"
      :pager-count="11"
      :total="page.total_count"
    >
    </el-pagination>
  </div>
</template>

<script>
import _ from "lodash";
import {
  getRushOrders,
  viewOrderPayImg,
  cancelOrder,
  getTopFuns,
  exportRushOrders,
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
      topUidoptions: [],
      payStateoptions: [
        { value: 0, label: "待支付" },
        { value: -1, label: "取消订单" },
        { value: 1, label: "完成" },
        { value: 2, label: "已上架" },
      ],
      search: {
        salerPhone: "",
        buyerPhone: "",
        payState: "",
        createdDate: "",
        goodName: "",
        topUid: "",
      },
    };
  },
  computed: {},
  async created() {
    let res = await getTopFuns({});
    this.topUidoptions = res.data;
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
    async onCancleOrder(item) {
      let cresult = confirm(
        "取消订单后该用户已成功抢购的记录不会清除，确认取消订单？"
      );
      if (cresult) {
        let data = {
          gid: item.gid,
          order_id: item.order_id,
          uid: item.uid
      };
        let{ msg, res_code } = await cancelOrder(data);
        if (res_code > -1) {
            await this.getUserOrderList();
            this.$message({
              type: "success",
              message: "取消成功!",
            });
          }
      }
    },
    async getUserOrderList() {
      let data = {
        ...this.page,
        topUid: this.search.topUid,
        goodName: this.search.goodName,
        payState: this.search.payState,
        salerPhone: this.search.salerPhone,
        buyerPhone: this.search.buyerPhone,
        createdAtStart: this.search.createdDate
          ? this.search.createdDate[0]
          : "",
        createdAtEnd: this.search.createdDate ? this.search.createdDate[1] : "",
      };
      let res = await getRushOrders(data);
      this.userList = res.data.list;
      this.page.page_index = res.data.page_index;
      this.page.page_size = res.data.page_size;
      this.page.total_count = res.data.total_count;
    },
    async exportUserOrderList() {
      let data = {
        ...this.page,
        topUid: this.search.topUid,
        goodName: this.search.goodName,
        payState: this.search.payState,
        salerPhone: this.search.salerPhone,
        buyerPhone: this.search.buyerPhone,
        createdAtStart: this.search.createdDate
          ? this.search.createdDate[0]
          : "",
        createdAtEnd: this.search.createdDate ? this.search.createdDate[1] : "",
      };
      let res = await exportRushOrders(data);
      window.open(window.location.origin+window.location.pathname+res.data.substr(1,res.data.length),'_blank')
    },
    moreSetting(data) {
      let this_ = this;
      let key = data.key;
      let { $index, row } = data.scope;
      this.$confirm(
        `确定将订单 ${row.order_no}设置为${
          key == 1 ? "上架" : key == 2 ? "抢购" : "已支付"
        }状态吗?`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(async () => {
          let { res_code } = await setRushOrderInfo({
            state: key,
            order_id: row.order_id,
          });
          if (res_code > 0) {
            this.$message({
              type: "success",
              message: "设置成功!",
            });
            await this_.getUserOrderList();
          }
        })
        .catch((err) => {
          this.$message({
            type: "success",
            message: "设置失败!",
          });
        });
    },
    _getDefaultImg(img) {
      if (img) {
        return img;
      }
      return require("../../assets/local/nothing.png");
    },
    _getFirstImg(img) {
      if (img) {
        img = JSON.parse(img);
        return img[0] ? img[0] : require("../../assets/local/nothing.png");
      }
      return require("../../assets/local/nothing.png");
    },
    _getStateStr(state) {
      if (state == 0) {
        return "停用";
      } else if (state == 1) {
        return "正常";
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
