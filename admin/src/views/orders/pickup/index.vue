<template>
  <div class="app-container">
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
          {{ scope.row.price / 100 }}元
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品信息">
        <template slot-scope="scope">
          <el-popover placement="top" width="420" trigger="hover">
            <el-form label-position="left" class="demo-table-expand">
              <el-form-item label="商品名称">
                <span>{{ scope.row.name }}</span>
              </el-form-item>
              <el-form-item label="商品单价">
                <span>{{ scope.row.price / 100 }}元</span>
              </el-form-item>
              <el-form-item label="">
                <el-carousel :interval="4000">
                  <el-carousel-item
                    v-for="(item, i) in JSON.parse(scope.row.img)"
                    :key="i"
                  >
                    <img :src="item" width="400" />
                  </el-carousel-item>
                </el-carousel>
              </el-form-item>
            </el-form>
            <el-button type="text" slot="reference">{{
              scope.row.name
            }}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :show-overflow-tooltip="true"
        label="提货人"
      >
        <template slot-scope="scope">
          <el-popover placement="top" width="320" trigger="hover">
            <el-form label-position="left" class="demo-table-expand">
              <el-form-item label="用户名">
                <span>{{ scope.row.belong_nickname }}</span>
              </el-form-item>
              <el-form-item label="开户行">
                <span>{{ scope.row.belong_bankname }}</span>
              </el-form-item>
              <el-form-item label="卡号">
                <span>{{ scope.row.belong_bankno }}</span>
              </el-form-item>
              <el-form-item label="收款人">
                <span>{{ scope.row.belong_payeename }}</span>
              </el-form-item>
              <el-form-item label="电话">
                <span>{{ scope.row.belong_phone }}</span>
              </el-form-item>
            </el-form>
            <el-button type="text" slot="reference">{{
              scope.row.belong_nickname == null
                ? "卖方信息未找到"
                : scope.row.belong_nickname
            }}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="卖方信息">
        <template slot-scope="scope">
          <el-popover placement="top" width="320" trigger="hover">
            <el-form label-position="left" class="demo-table-expand">
              <el-form-item label="用户名">
                <span>{{ scope.row.rusher_nickname }}</span>
              </el-form-item>
              <el-form-item label="开户行">
                <span>{{ scope.row.rusher_bankname }}</span>
              </el-form-item>
              <el-form-item label="卡号">
                <span>{{ scope.row.rusher_bankno }}</span>
              </el-form-item>
              <el-form-item label="收款人">
                <span>{{ scope.row.rusher_payeename }}</span>
              </el-form-item>
              <el-form-item label="电话">
                <span>{{ scope.row.rusher_phone }}</span>
              </el-form-item>
            </el-form>
            <el-button type="text" slot="reference">{{
              scope.row.rusher_nickname==null?'卖方信息未找到':scope.row.rusher_nickname
            }}</el-button>
          </el-popover>
        </template>
      </el-table-column> -->
      <el-table-column align="center" label="支付凭证">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="viewOrderPayImg(scope.row.belong, scope.row.order_id)"
            >查看</el-button
          >
        </template>
      </el-table-column>
      <el-table-column align="center" label="收货信息">
        <template slot-scope="scope">
          <div class="div-recommender">
            <p>
              地址 {{ scope.row.address_info.province
              }}{{ scope.row.address_info.city
              }}{{ scope.row.address_info.county
              }}{{ scope.row.address_info.detail }}
            </p>
            <p>收货人 {{ scope.row.address_info.name }}</p>
            <p>手机号 {{ scope.row.address_info.phone }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="物流信息">
        <template slot-scope="scope">
          {{ scope.row.parcel_info }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="300">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEditParcelInfo(scope.row)"
            >填写物流信息</el-button
          >
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
    <el-dialog title="填写物流信息" :visible.sync="editParcelInfoDialogVisible">
      <el-form>
        <el-form-item :label="`订单 ${order_no} 物流信息`">
          <el-input v-model="parcel_info" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editParcelInfoDialogVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="oneditParcelInfo">确 定</el-button>
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
import { getPickupOrder, setRushOrderInfo, viewOrderPayImg } from "@/api/user";

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
      editParcelInfoDialogVisible: false,
      viewOrderPayImgTitle: "",
      order_no: "",
      parcel_info: "",
      order_id: "",
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
    handleEditParcelInfo(scope) {
      this.order_id = scope.order_id;
      this.order_no = scope.order_no;
      this.parcel_info = scope.parcel_info;
      this.editParcelInfoDialogVisible = true;
    },
    async oneditParcelInfo() {
      let this_ = this;
      let data = {
        order_id: this.order_id,
        parcel_info: this.parcel_info,
        state: 6,
      };
      let res = await setRushOrderInfo(data);
      if (res.res_code > 0) {
        this.getUserOrderList();
        this.$message({
          type: "success",
          message: res.msg,
        });
        this.editParcelInfoDialogVisible = false;
        await this_.getUserOrderList();
      } else {
        this.$message({
          type: "success",
          message: res.msg,
        });
      }
    },
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
      };
      let res = await getPickupOrder(data);
      console.log(res.data.list);
      this.userList = res.data.list;
      this.page.page_index = res.data.page_index;
      this.page.page_size = res.data.page_size;
      this.page.total_count = res.data.total_count;
    },
    _getDefaultImg(img) {
      if (img) {
        return img;
      }
      return require("../../../assets/local/nothing.png");
    },
    _getFirstImg(img) {
      if (img) {
        img = JSON.parse(img);
        return img[0] ? img[0] : require("../../../assets/local/nothing.png");
      }
      return require("../../../assets/local/nothing.png");
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
