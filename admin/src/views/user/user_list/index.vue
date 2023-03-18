<template>
  <div class="app-container">
    <el-form inline label-width="110px" label-position="left">
      <el-form-item label="姓名">
        <el-input placeholder="姓名" v-model="search.nickname" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input placeholder="手机号" v-model="search.phone" />
      </el-form-item>
      <el-form-item label="有无推荐人">
        <el-select v-model="search.has_recommender" placeholder="请选择">
          <el-option
            v-for="item in has_recommenderoptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否恶意用户">
        <el-select v-model="search.isbad" placeholder="请选择">
          <el-option
            v-for="item in isbadoptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-button type="success" @click="getUserList(true)">搜索</el-button>
      <el-button type="warning" @click="exportUserList">导出</el-button>
      <el-button type="primary" @click="handleSetCoupon">发放优惠券</el-button>
      <el-tooltip placement="bottom" content="清空所有用户提前抢购特权">
        <el-button
          type="danger"
          @click="onClearAllUser('TQ')"
          icon="el-icon-refresh"
          >清空特权</el-button
        >
      </el-tooltip>

      <el-tooltip placement="bottom" content="清空所有用户黑名单商品">
        <el-button
          type="danger"
          @click="onClearAllUser('HMD')"
          icon="el-icon-refresh"
          >清空黑名单</el-button
        >
      </el-tooltip>
    </el-form>

    <el-table
      :data="userList"
      style="width: 100%; margin-top: 30px"
      ref="userTable"
      :height="tableHeight"
      border
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-tabs type="border-card">
            <el-tab-pane label="出售订单">
              <order-list :uid="props.row.uid" orderType="sale" />
            </el-tab-pane>
            <el-tab-pane label="购买订单">
              <order-list :uid="props.row.uid" orderType="buy" />
            </el-tab-pane>
            <el-tab-pane label="提现申请">
              <withdrawal :uid="props.row.uid" />
            </el-tab-pane>
            <el-tab-pane label="优惠券">
              <couponList :uid="props.row.uid" />
            </el-tab-pane>
            <el-tab-pane label="抢购商品">
              <userGoodsRush :uid="props.row.uid" />
            </el-tab-pane>
            <el-tab-pane label="粉丝">
              <userfans :uid="props.row.uid" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        width="130"
        :show-overflow-tooltip="true"
        label="手机号"
      >
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="90" label="头像">
        <template slot-scope="scope">
          <img
            class="goods-img"
            :src="_getDefaultImg(scope.row.avatar)"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="昵称" width="150">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="银行卡信息" width="180">
        <template slot-scope="scope">
          <div class="div-recommender">
            <p>收款人 {{ scope.row.payee_name }}</p>
            <p>卡号 {{ scope.row.payee_bankno }}</p>
            <p>开户行 {{ scope.row.payee_bankname }}</p>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-if="false"
        align="center"
        width="100"
        label="专属二维码"
      >
        <template slot-scope="scope">
          <img
            class="goods-img"
            :src="_getDefaultImg(scope.row.qrcode)"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="推荐人"
        width="180"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <div class="div-recommender">
            <p>
              推荐人
              <span style="font-weight: bold">{{
                scope.row.recommender_nickname
              }}</span>
            </p>
            <p>手机号 {{ scope.row.recommender_phone }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="分仓类型"
        width="180"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="updateBucket(scope.row)">
            {{ scope.row.bucket_name || "总仓" }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        class-name="status-col"
        width="80"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.state | stateFilter">
            {{ _getStateStr(row.state) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="恶意用户"
        align="center"
        class-name="status-col"
        width="80"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.bad ? 'success' : 'warning'">
            {{ row.bad ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="管理员"
        align="center"
        class-name="status-col"
        width="80"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.roles.indexOf(1) > -1 ? 'success' : 'warning'">
            {{ row.roles.indexOf(1) > -1 ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="银行卡"
        align="center"
        class-name="status-col"
        width="100"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.edit_bank_access ? 'success' : 'warning'">
            {{ row.edit_bank_access ? "可编辑" : "不可编辑" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="阅读协议"
        align="center"
        class-name="status-col"
        width="100"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.has_read_protocol ? 'success' : 'warning'">
            {{ row.has_read_protocol ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" width="90" label="签名">
        <template slot-scope="scope">
          <img class="goods-img" :src="_getDefaultImg(scope.row.sign)" alt="" />
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" width="90" label="微信收款码">
        <template slot-scope="scope">
          <img class="goods-img" :src="_getDefaultImg(scope.row.wxpay_img)" alt="" />
        </template>
      </el-table-column>
      <el-table-column align="center" width="90" label="支付宝收款码">
        <template slot-scope="scope">
          <img class="goods-img" :src="_getDefaultImg(scope.row.alipay_img)" alt="" />
        </template>
      </el-table-column> -->
      <el-table-column align="center" label="操作" width="280">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)"
            >权限设置</el-button
          >
          <el-button
            v-if="scope.row.state != 0"
            size="small"
            @click="handleModifyState(scope.row, 'forbidden')"
          >
            禁用
          </el-button>
          <el-button
            v-if="scope.row.state == 0"
            size="small"
            @click="handleModifyState(scope.row, 'allow')"
          >
            启用
          </el-button>
          <el-dropdown @command="moreSetting" style="margin-left: 10px">
            <span class="el-dropdown-link">
              更多设置<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="{ key: 'openBucket', scope }"
                >开启分仓</el-dropdown-item
              >
              <el-dropdown-item :command="{ key: 'resetPwd', scope }"
                >重置密码</el-dropdown-item
              >
              <el-dropdown-item :command="{ key: 'setUserRecommender', scope }"
                >设置推荐人</el-dropdown-item
              >
              <el-dropdown-item :command="{ key: 'setBankAccess', scope }"
                >银行卡可编辑</el-dropdown-item
              >
              <el-dropdown-item :command="{ key: 'setBad', scope }">{{
                scope.row.bad == 0 ? "设置恶意用户" : "取消恶意用户"
              }}</el-dropdown-item>
              <el-dropdown-item :command="{ key: 'setAdmin', scope }">{{
                scope.row.roles && scope.row.roles.indexOf(1) == -1
                  ? "设为管理员"
                  : "取消管理员"
              }}</el-dropdown-item>
              <el-dropdown-item :command="{ key: 'resetUser', scope }"
                >账号恢复</el-dropdown-item
              >
              <el-dropdown-item
                divided
                style="color: red"
                :command="{ key: 'deleteUser', scope }"
                >删除用户</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 用户权限详情 -->
    <!-- <el-dialog :visible.sync="dialogVisible"
            :close-on-click-modal="false"
            v-loading="submitBtnLock"
            title="特权设置">
            <div class="user-info">
                <img :src="_getDefaultImg(usergod.avatar)" />
                <div>
                    <p><span>手机号：</span>{{ usergod.phone }}</p>
                    <p><span>用户ID：</span>{{ usergod.uid }}</p>
                    <p><span>昵称：</span>{{ usergod.nickname }}</p>
                    <p><span>注册时间：</span>{{ usergod.create_time }}</p>
                    <p><span>最后登录时间：</span>{{ usergod.last_login_time }}</p>
                </div>
            </div>

            <el-form :model="usergod"
                v-if="usergod && usergod.god"
                label-width="110px"
                label-position="left">
                <el-form-item label="抢购商品上限">
                    <div>
                        <el-switch v-model="usergod.god.limit.use"></el-switch>
                        <el-input-number style="margin-left: 20px"
                            size="mini"
                            :disabled="!usergod.god.limit.use"
                            v-model="usergod.god.limit.data"
                            :min="0"
                            :max="100000"
                            label="描述文字"></el-input-number>
                    </div>
                </el-form-item>
                <el-form-item label="商品黑名单">
                    <div>
                        <el-switch v-model="usergod.god.blacklist.use"></el-switch>
                        <el-button style="margin-left: 20px"
                            :disabled="!usergod.god.blacklist.use"
                            @click="selectBlackListGoods"
                            size="mini"
                            type="primary">指定商品</el-button>
                    </div>
                    <div class="selected-black-list">
                        <div style="display: inline-block"
                            v-for="(item, index) in usergod.god.blacklist.data"
                            :key="index">
                            <div class="blacklist-element">
                                <img :src="_getFirstImg(item.img)"
                                    alt="" />
                                <div>
                                    <p>商品id：{{ item.gid }}</p>
                                    <p>{{ item.name }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="禁止抢购"
                    v-if="false">
                    <el-switch v-model="usergod.god.blackroom.use"></el-switch>
                </el-form-item>
                <el-form-item label="提前抢购(秒)">
                    <div>
                        <el-switch v-model="usergod.god.godtime.use"></el-switch>
                        <el-input-number style="margin-left: 20px"
                            :disabled="!usergod.god.godtime.use"
                            size="mini"
                            v-model="usergod.god.godtime.data"
                            :min="1"
                            :max="100000"
                            label="描述文字"></el-input-number>
                    </div>
                </el-form-item>
                <el-form-item label="特权有效期(天)">
                    <div>
                        <el-input-number style="margin-left: 20px"
                            v-if="usergod.god.godtime.use && usergod.god.limit.use"
                            size="mini"
                            v-model="usergod.god.ttl.ttl"
                            :min="1"
                            :max="100000"></el-input-number>
                        <span v-if="usergod.god.godtime.use && usergod.god.limit.use"
                            style="color:#999;margin-left:20px">特权生效时间:{{usergod.god.ttl.time}}</span>
                    </div>
                </el-form-item>
            </el-form>
            <div style="text-align: right">
                <el-button type="danger"
                    :disabled="submitBtnLock"
                    @click="dialogVisible = false">取消</el-button>
                <el-button type="primary"
                    :disabled="submitBtnLock"
                    @click="updateUserGodState">保存</el-button>
            </div>
        </el-dialog> -->

    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      v-loading="submitBtnLock"
      title="特权设置"
    >
      <div class="user-info">
        <img :src="_getDefaultImg(usergod.avatar)" />
        <div>
          <p><span>手机号：</span>{{ usergod.phone }}</p>
          <p><span>用户ID：</span>{{ usergod.uid }}</p>
          <p><span>昵称：</span>{{ usergod.nickname }}</p>
          <p><span>注册时间：</span>{{ usergod.create_time }}</p>
          <p><span>最后登录时间：</span>{{ usergod.last_login_time }}</p>
        </div>
      </div>
      <hr style="border: none; border-bottom: solid 1px #ababab" />
      <el-form
        :model="usergod"
        v-if="usergod && usergod.god"
        label-width="110px"
        label-position="left"
      >
        <el-form-item label="特权抢购上限">
          <div>
            <el-input-number
              style="margin-left: 20px"
              size="mini"
              v-model="usergod.god.limit.data"
              :min="0"
              :max="100000"
              label="描述文字"
            ></el-input-number>
          </div>
        </el-form-item>
        <el-form-item label="禁止抢购" v-if="false">
          <el-switch v-model="usergod.god.blackroom.use"></el-switch>
        </el-form-item>
        <el-form-item label="提前抢购(秒)">
          <div>
            <el-input-number
              style="margin-left: 20px"
              size="mini"
              v-model="usergod.god.godtime.data"
              :min="0"
              :max="100000"
              label="描述文字"
            ></el-input-number>
          </div>
        </el-form-item>
        <el-form-item label="特权有效期(天)">
          <div>
            <el-input-number
              style="margin-left: 20px"
              size="mini"
              v-model="usergod.god.ttl.ttl"
              :min="1"
              :max="100000"
            ></el-input-number>
            <span
              v-if="usergod.god.godtime.use && usergod.god.limit.use"
              style="color: #999; margin-left: 20px"
              >特权设置时间:{{ usergod.god.ttl.time }}</span
            >
          </div>
        </el-form-item>
      </el-form>
      <hr style="border: none; border-bottom: solid 1px #ababab" />
      <el-form
        :model="usergod"
        v-if="usergod && usergod.god"
        label-width="110px"
        label-position="left"
      >
        <el-form-item label="商品黑名单">
          <div>
            <el-button
              style="margin-left: 20px"
              @click="selectBlackListGoods"
              size="mini"
              type="primary"
              >指定商品</el-button
            >
          </div>
          <div class="selected-black-list">
            <div
              style="display: inline-block"
              v-for="(item, index) in usergod.god.blacklist.data"
              :key="index"
            >
              <div class="blacklist-element">
                <img :src="_getFirstImg(item.img)" alt="" />
                <div>
                  <p>商品id：{{ item.gid }}</p>
                  <p>{{ item.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div style="text-align: right">
        <el-button
          type="danger"
          :disabled="submitBtnLock"
          @click="dialogVisible = false"
          >关闭</el-button
        >
        <el-button
          type="primary"
          :disabled="submitBtnLock"
          @click="updateUserGodState"
          >保存</el-button
        >
      </div>
    </el-dialog>
    <!-- 商品黑名单 -->
    <el-dialog
      :visible.sync="goodsListDialogVisible"
      :close-on-click-modal="false"
      title="选择商品列表"
    >
      <dnd-list
        :list1="dndList1"
        :list2="dndList2"
        list1-title="用户商品黑名单"
        list2-title="抢购商品列表"
      />
      <div style="text-align: right">
        <el-button
          type="danger"
          :disabled="submitBtnLock"
          @click="goodsListDialogVisible = false"
          >取消</el-button
        >
        <el-button
          type="primary"
          :disabled="submitBtnLock"
          @click="blackListFinish"
          >保存</el-button
        >
      </div>
    </el-dialog>

    <el-dialog title="设置推荐人" :visible.sync="setRecommenderDialogVisible">
      <el-form :model="userPwd">
        <el-form-item
          :label="`设置用户 ${userPwd.nickname}(${userPwd.phone}) 的推荐人`"
        >
          <el-select
            v-model="recommenderId"
            filterable
            remote
            placeholder="请输入手机号或昵称"
            :remote-method="remoteMethod"
            :loading="loading"
          >
            <el-option
              v-for="item in recommenderList"
              :key="item.uid"
              :label="`${item.nickname}(${item.phone})`"
              :value="item.uid"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRecommenderDialogVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="onSetRecommender">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="重置用户密码" :visible.sync="resetPwdDialogVisible">
      <el-form :model="userPwd">
        <el-form-item
          :label="`用户 ${userPwd.nickname}(${userPwd.phone}) 新密码`"
        >
          <el-input v-model="userPwd.new_pwd" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPwdDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onResetUserPwd">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="选择优惠券" :visible.sync="couponDialogVisible">
      <el-form>
        <el-form-item label="选择优惠券">
          <el-select v-model="coupon" placeholder="选择优惠券">
            <el-option
              v-for="item in selectCouponList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="couponDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSetUserCoupon">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改分仓" :visible.sync="dialogVisibleBucket" v-if="dialogVisibleBucket">
      <el-form>
        <el-form-item label="选择分仓">
          <el-select v-model="select_bucket_id" placeholder="选择分仓">
            <el-option
              label="总仓"
              :value="0"
              key="0"
            >
            </el-option>
            <el-option
              v-for="item in notices"
              :key="item.uid"
              :label="item.bucket_name"
              :value="item.uid"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所有粉丝是否转移">
          <el-switch
            v-model="isUpdateLevel"
          >
          </el-switch>
        </el-form-item>
        <el-form-item label="商品是否转移">
          <el-switch
            v-model="isUpdateGood"
          >
          </el-switch>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleBucket = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdateBucket">确 定</el-button>
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
  getUserList,
  exportUserList,
  deleteUser,
  freeUser,
  forbiddenUser,
  getUserGodState,
  setUserGodState,
  getRushGoods,
  resetUserPwd,
  setBadUser,
  setUserEditBankAccess,
  getRecommenders,
  setUserRecommender,
  setAdminUser,
  removeAdminUser,
  resetUser,
  updateBucket,
} from "@/api/user";
import { getCoupons, setUserCoupon } from "@/api/coupon";
import { createBucket,getBucketList } from "@/api/userBucket";
import DndList from "@/views/user/user_list/components/DmdList.vue";
import OrderList from "@/views/user/user_list/components/orderList.vue";
import withdrawal from "@/views/withdrawal/index.vue";
import couponList from "@/views/coupon/list.vue";
import userGoodsRush from "@/views/goods/goods_rush/list.vue";
import userfans from "@/views/user/user_list/components/userfans.vue";
import { celarAllUserBlackList, clearAllUserPrivilege } from "@/api/syncdb";

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
      tableHeight: 400,
      search: {
        nickname: "",
        phone: "",
        isbad: "",
        has_recommender: "",
      },
      has_recommenderoptions: [
        { label: "请选择", value: "" },
        { label: "有", value: 1 },
        { label: "无", value: 0 },
      ],
      isbadoptions: [
        { label: "请选择", value: "" },
        { label: "有", value: 1 },
        { label: "无", value: 0 },
      ],
      coupon: "",
      couponDialogVisible: false,
      submitBtnLock: false,
      userList: [],
      selectCouponList: [],
      dialogVisible: false,
      goodsListDialogVisible: false,
      resetPwdDialogVisible: false,
      setRecommenderDialogVisible: false,
      page: {
        page_index: 0,
        page_size: 10,
        total_count: 0,
      },
      loading: false,
      recommenderId: undefined,
      recommenderList: [],
      usergod: {},
      dndList1: [],
      dndList2: [],
      userPwd: {},
      dialogVisibleBucket: false,
      select_bucket_id: '',
      isUpdateLevel: false,
      isUpdateGood: false,
      select_uid: '',
      notices: []
    };
  },
  components: {
    DndList,
    OrderList,
    withdrawal,
    couponList,
    userGoodsRush,
    userfans,
  },
  computed: {},
  async created() {
    this.getUserList();
    this.getCoupons();
    this.tableHeight = document.documentElement.clientHeight - 300;
  },
  methods: {
    async getUserList(search) {
      if (search) this.page.page_index = 0;
      let data = {
        ...this.page,
        nickname: this.search.nickname,
        phone: this.search.phone,
        isbad: this.search.isbad,
        has_recommender: this.search.has_recommender,
      };
      let res = await getUserList(data);
      this.userList = res.data.list;
      this.page.page_index = res.data.page_index;
      this.page.page_size = res.data.page_size;
      this.page.total_count = res.data.total_count;
    },
    async exportUserList() {
      let data = {
        ...this.page,
        nickname: this.search.nickname,
        phone: this.search.phone,
        isbad: this.search.isbad,
        has_recommender: this.search.has_recommender,
      };
      let res = await exportUserList(data);
      window.open(
        window.location.origin +
          window.location.pathname +
          res.data.substr(1, res.data.length),
        "_blank"
      );
    },
    async onClearAllUser(key) {
      if (key == "TQ") {
        this.$confirm(`确定要清空所有用户特权吗?`, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let data = await clearAllUserPrivilege();
            if (data.res_code > 0) {
              this.$message({
                message: data.msg,
                type: data.res_code > 0 ? "success" : "error",
              });
            }
          })
          .catch((err) => {});
      } else if (key == "HMD") {
        this.$confirm(`确定要清空所有用户的商品黑名单?`, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let data = await celarAllUserBlackList();
            if (data.res_code > 0) {
              this.$message({
                message: data.msg,
                type: data.res_code > 0 ? "success" : "error",
              });
            }
          })
          .catch((err) => {});
      }
    },
    async getCoupons() {
      let data = {
        ...this.page,
      };
      let res = await getCoupons(data);
      this.selectCouponList = res.data;
      // this.page.page_index = res.data.page_index;
      // this.page.page_size = res.data.page_size;
      // this.page.total_count = res.data.total_count;
    },
    handleSetCoupon() {
      let uids = this.$refs.userTable.selection.map((x) => x.uid);
      if (uids.length == 0) {
        this.$message({
          type: "warning",
          message: "请先选择用户",
        });
        return;
      }
      this.couponDialogVisible = true;
    },
    async onSetUserCoupon() {
      let uids = this.$refs.userTable.selection.map((x) => x.uid);
      let { res_code, msg } = await setUserCoupon({
        uids: uids,
        coupon_id: this.coupon,
      });
      if (res_code > 0) {
        this.getUserList();
        this.$message({
          type: "success",
          message: msg,
        });
        this.couponDialogVisible = false;
      } else {
        this.$message({
          type: "warning",
          message: msg,
        });
      }
    },
    async handleEdit(scope) {
      this.dialogVisible = true;
      this.submitBtnLock = false;
      let { res_code, data } = await getUserGodState({
        uid: scope.row.uid,
      });
      if (res_code > 0) {
        this.usergod = data;
      }
    },
    async remoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        let data = await getRecommenders({
          uid: this.userPwd.uid,
          searchkey: query,
        });
        this.recommenderList = data.data;
        this.loading = false;
      } else {
        this.recommenderList = [];
      }
    },
    async onSetRecommender() {
      let { res_code, msg } = await setUserRecommender({
        uid: this.userPwd.uid,
        recommender_id: this.recommenderId,
      });
      if (res_code > 0) {
        this.getUserList();
        this.$message({
          type: "success",
          message: msg,
        });
        this.setRecommenderDialogVisible = false;
      } else {
        this.$message({
          type: "warning",
          message: msg,
        });
      }
    },
    async handleModifyState(row, strState) {
      if (strState == "forbidden") {
        let { res_code } = await forbiddenUser({ uid: row.uid });
        if (res_code > 0) {
          row.state = 0;
        }
      } else if (strState == "allow") {
        let { res_code } = await freeUser({ uid: row.uid });
        if (res_code > 0) {
          row.state = 1;
        }
      }
    },
    moreSetting(data) {
      let key = data.key;
      let { $index, row } = data.scope;

      if (key == "setRole") {
        this.handleEdit(data.scope);
      } else if (key == "openBucket") {
        this.$confirm(`确定要为用户 ${row.nickname}独立分仓吗?`, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let { res_code } = await createBucket({
              uid: row.uid,
              bucket_name: `${row.nickname}分仓`,
              admin_uid: row.uid,
            });
            if (res_code > 0) {
              this.$message({
                type: "success",
                message: "分仓成功!",
              });
            }
          })
          .catch((err) => {
            this.$message({
              type: "success",
              message: "分仓失败!",
            });
          });
      } else if (key == "setBankAccess") {
        this.$confirm(
          `确定要为用户 ${row.nickname}(${row.phone})开通编辑银行卡权限吗?`,
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(async () => {
            let { res_code } = await setUserEditBankAccess({
              uid: row.uid,
              access: 1,
            });
            if (res_code > 0) {
              this.$message({
                type: "success",
                message: "开通成功!",
              });
            }
          })
          .catch((err) => {
            this.$message({
              type: "success",
              message: "开通失败!",
            });
          });
      } else if (key == "setBad") {
        this.$confirm(
          `确定要将用户 ${row.nickname}(${row.phone})设为${
            row.bad == 0 ? "恶意" : "正常"
          }用户?`,
          "警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(async () => {
            let { res_code } = await setBadUser({
              uid: row.uid,
              isbad: row.bad == 0 ? 1 : 0,
            });
            if (res_code > 0) {
              this.getUserList();
              this.$message({
                type: "success",
                message: "设置成功!",
              });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } else if (key == "setAdmin") {
        this.$confirm(
          `确定要将用户 ${row.nickname}(${row.phone})设为${
            row.roles.indexOf(1) == -1 ? "管理员" : "普通"
          }用户?`,
          "警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(async () => {
            let { res_code } =
              row.roles.indexOf(1) == -1
                ? await setAdminUser({
                    uid: row.uid,
                  })
                : await removeAdminUser({
                    uid: row.uid,
                  });
            if (res_code > 0) {
              this.getUserList();
              this.$message({
                type: "success",
                message: "设置成功!",
              });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } else if (key == "setUserRecommender") {
        this.setRecommenderDialogVisible = true;
        this.userPwd = {
          uid: row.uid,
          nickname: row.nickname,
          phone: row.phone,
        };
      } else if (key == "resetPwd") {
        this.userPwd = {
          uid: row.uid,
          nickname: row.nickname,
          phone: row.phone,
          new_pwd: "",
        };
        this.resetPwdDialogVisible = true;
      } else if (key == "deleteUser") {
        this.$confirm(`确定删除用户 ${row.nickname}(${row.phone})?`, "警告", {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let { res_code } = await deleteUser({ uid: row.uid });
            if (res_code > 0) {
              this.getUserList();
              this.$message({
                type: "success",
                message: "删除成功!",
              });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } else if (key === "resetUser") {
        this.$confirm(`确定要为用户 ${row.nickname}恢复账号吗?`, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let { res_code } = await resetUser({
              uid: row.uid,
            });
            if (res_code > 0) {
              this.$message({
                type: "success",
                message: "恢复成功!",
              });
            }
          })
          .catch((err) => {
            this.$message({
              type: "success",
              message: "恢复失败!",
            });
          });
      }
    },
    _getDefaultImg(img) {
      if (img) {
        return img;
      }
      return require("../../../assets/local/93.png");
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
      await this.getUserList();
    },
    async handleCurrentChange(val) {
      this.page.page_index = val - 1;
      await this.getUserList();
    },
    async selectBlackListGoods() {
      this.goodsListDialogVisible = true;
      let { res_code, data } = await getRushGoods({
        page_index: 0,
        page_size: 1000,
      });
      if (res_code > 0) {
        this.dndList1 = [];
        this.dndList2 = data.list;
      }
    },
    blackListFinish() {
      this.goodsListDialogVisible = false;
      this.usergod.god.blacklist.data = this.dndList1;
    },
    async onResetUserPwd() {
      this.resetPwdDialogVisible = false;
      let data = await resetUserPwd({
        uid: this.userPwd.uid,
        pwd: this.userPwd.new_pwd,
      });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async updateUserGodState() {
      this.usergod.god.blacklist.use = true;
      this.usergod.god.godtime.use = true;
      this.usergod.god.limit.use = true;
      let { res_code, data } = await setUserGodState({
        ...this.usergod.god,
        uid: this.usergod.uid,
      });
      this.dialogVisible = false;
    },
    deleteUserList() {
      this.$router.push("/user/recyclelist");
    },
    async updateBucket(row) {
      console.log(row);
      this.dialogVisibleBucket = true
      this.select_bucket_id = row.bucket_id
      this.select_uid = row.uid
      this.getNotices()
    },
    async getNotices() {
      const res = await getBucketList();
      this.notices = res.data;
    },
    async handleUpdateBucket() {
      let result = await updateBucket({
        uid: this.select_uid,
        bucket_id: this.select_bucket_id,
        isUpdateLevel: this.isUpdateLevel ? 1 : 0,
        isUpdateGood: this.isUpdateGood ? 1 : 0,
      });
      if(result.res_code === 1){
        this.$message({
          type: "success",
          message: "修改成功!",
        });
        this.dialogVisibleBucket = false
      }
      
      this.getUserList();
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
.pointer{
  cursor: pointer;
}
</style>
