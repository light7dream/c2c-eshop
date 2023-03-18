<template>
  <div class="app-container">
    <el-input placeholder="输入会员名进行过滤" v-model="filterText">
    </el-input>
    <el-tree :data="data" :props="defaultProps" accordion :filter-node-method="filterNode" ref="tree2">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button type="text" size="mini" @click="() => viewFansOrder(data)">
            查看粉丝数据
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog title="查看粉丝数据" class="dialogClass" :visible.sync="editParcelInfoDialogVisible">
      <el-tabs v-model="activeName">
        <el-tab-pane label="粉丝订单" name="first">

          <p style="color:#409EFF">当日订单总数: {{(userList && userList.length>0)?userList.length:0}}<span style="margin-left:30px">当日订单总金额: {{(today_total/100).toFixed(2)}} 元</span></p>
          <el-table :data="userList" max-height="500" style="width: 100%; margin-top: 20px" border>
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
                    <el-form-item label="商品单价">
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
            <el-table-column align="center" :show-overflow-tooltip="true" label="卖方信息">
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
                <el-button type="text" @click="viewOrderPayImg(scope.row.uid, scope.row.order_id)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="粉丝进场数据" name="second">
          <el-select v-model="sid" placeholder="请选择抢购场次" @change="selectSchedule">
            <el-option v-for="item in scheduleList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
          <span style="color:#409EFF" v-if="sid!=''">今日该场次有{{inList.length}}人进场。</span>

          <el-table :data="inList" max-height="500" style="width: 100%; margin-top: 20px" border>
            <el-table-column align="center" label="用户姓名">
              <template slot-scope="scope">
                {{ scope.row.nickname }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="粉丝抢购成功数据" name="third">
          <el-select v-model="sid" placeholder="请选择抢购场次" @change="selectSchedule">
            <el-option v-for="item in scheduleList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
          <span style="color:#409EFF" v-if="sid!=''">今日该场次有{{okList.length}}人抢购成功。</span>
          <el-table :data="okList" max-height="500" style="width: 100%; margin-top: 20px" border>
            <el-table-column align="center" label="用户姓名">
              <template slot-scope="scope">
                {{ scope.row.nickname }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editParcelInfoDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="查看支付凭证" :visible.sync="viewOrderPayImgDialogVisible">
      <el-carousel width="100%" :interval="4000">
        <el-carousel-item v-for="(item, i) in orderPayImgList" :key="i">
          <img :src="item.img" width="100%" />
        </el-carousel-item>
      </el-carousel>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOrderPayImgDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRecommenderTree, getFansOrderStatisticsByUser, getFansAccessData } from "@/api/system";
import { getList as getScheduleList } from "@/api/rush_schedule";
import { viewOrderPayImg } from "@/api/user";
export default {
  components: {},
  mounted() {
    this.showSeeksGraph();
  }, watch: {
    filterText(val) {
      this.$refs.tree2.filter(val);
    },
    editParcelInfoDialogVisible(val) {
      if (val == false) {
        this.inList = [];
        this.okList = [];
        this.sid = '';
        this.uid = '';
      }
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.nickname.indexOf(value) !== -1;
    },
    async showSeeksGraph() {
      let { data } = await getRecommenderTree();
      this.data = data.tree;
    },
    async getScheduleList() {
      let res = await getScheduleList();
      this.scheduleList = res.data;
    },
    async viewFansOrder(data) {
      this.uid = data.uid;
      let req = {
        uid: this.uid,
      };
      let res = await getFansOrderStatisticsByUser(req);
      this.userList = res.data.list;
      this.today_total = res.data.today_total;

      this.editParcelInfoDialogVisible = true;
    },
    async selectSchedule(val) {
      let req = {
        uid: this.uid,
        s: val
      };
      let res = await getFansAccessData(req);
      this.inList = res.data.inList;
      this.okList = res.data.okList;

    },
    async viewOrderPayImg(uid, order_id) {
      let data = {
        uid,
        order_id,
      };
      let res = await viewOrderPayImg(data);
      this.orderPayImgList = res.data;
      this.viewOrderPayImgDialogVisible = true;
    },
  },
  async created() {
    this.getScheduleList();
  },
  data() {
    return {
      filterText: '',
      editParcelInfoDialogVisible: false,
      viewOrderPayImgDialogVisible: false,
      scheduleList: [],
      orderPayImgList: [],
      userList: [],
      inList: [],
      okList: [],
      today_total: 0,
      data: [],
      activeName: "first",
      sid: '',
      uid: '',
      defaultProps: {
        children: "list",
        label: "nickname",
      },
    };
  },
};
</script>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.c-my-node {
  background-position: center center;
  background-size: 100%;
  border: #ff8c00 solid 2px;
  height: 80px;
  width: 80px;
  border-radius: 40px;
}
.c-node-name {
  width: 160px;
  margin-left: -40px;
  text-align: center;
  margin-top: 85px;
}
</style>


<style>
.dialogClass .el-dialog__body {
  padding: 0 20px 10px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
</style>