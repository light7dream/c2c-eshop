<template>
  <div class="app-container">
    <el-form inline label-width="110px" label-position="left">
      <el-form-item label="商品名称">
        <el-input placeholder="商品名称" v-model="search.name" />
      </el-form-item>
      <!-- <el-form-item>
        <el-checkbox v-model="search.onsale">显示商品</el-checkbox>
      </el-form-item> -->
      <el-form-item label="商品状态">
        <el-select v-model="search.state" placeholder="请选择">
          <el-option label="请选择" value=""> </el-option>
          <el-option v-for="item in stateMapList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="抢购场次">
        <el-select v-model="search.sid" clearable="" placeholder="请选择">
          <!-- <el-option label="请选择" value=""> </el-option> -->
          <el-option label="待分配" value="0"> </el-option>
          <el-option v-for="item in scheduleList" :key="item.id" :label="item.name" :value="item.id">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px" v-if="bucket_id==0">({{ item.bucket_name||'总仓' }})</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-button type="success" @click="getGoods">搜索</el-button>
      <el-button type="warning" @click="exportGoodsList">导出</el-button>
      <el-button type="primary" @click="handleAddGoods" v-if="bucket_id==0">添加商品</el-button>
      <el-button type="primary" @click="onSyncRush" icon="el-icon-refresh">推送商品</el-button>
    </el-form>

    <el-table :data="goodsList" style="width: 100%; margin-top: 30px" :height="tableHeight" border>
      <el-table-column align="center" label="商品ID" width="80">
        <template slot-scope="scope">
          {{ scope.row.gid }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品编号" width="120">
        <template slot-scope="scope">
          <!-- {{ _getCategoryName(scope.row.cid) }} -->
          {{ scope.row.code + scope.row.gid }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="200" :show-overflow-tooltip="true" label="商品名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="初始价格" width="120">
        <template slot-scope="scope">
          {{ (scope.row.base_price / 100).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="价格" width="120">
        <template slot-scope="scope">
          {{ (scope.row.price / 100).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column align="center" :show-overflow-tooltip="true" label="商品简介">
        <template slot-scope="scope">
          {{ scope.row.summary }}
        </template>
      </el-table-column>

      <el-table-column align="center" :show-overflow-tooltip="true" label="买方信息">
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
            <el-button type="text" @click="showSetBelong(scope.row,'rusher_id')" slot="reference">{{ scope.row.rusher_nickname != null ? scope.row.rusher_nickname : '--'}}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="center" :show-overflow-tooltip="true" label="卖方信息">
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
            <el-button type="text" slot="reference"
              @click="showSetBelong(scope.row,'belong')">{{
              scope.row.belong_nickname == null
                ? "卖方信息未找到"
                : scope.row.belong_nickname
            }}</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="center" label="支付凭证">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.rusher_id == 0" @click="
              viewOrderPayImg(scope.row.rusher_id, scope.row.current_order_id)
            ">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" width="100" label="商品图片">
        <template slot-scope="scope">
          <img class="goods-img" :src="_getFirstImg(scope.row.img)" alt="" />
        </template>
      </el-table-column>
      <el-table-column align="center" :show-overflow-tooltip="true" label="抢购场次">
        <template slot-scope="scope">
          {{ scope.row.schedule_name }}<template v-if="bucket_id==0">({{scope.row.bucket_name||'总仓'}})</template>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="分仓类型"
        width="180"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <el-button type="text" class="div-recommender pointer" @click="updateBucket(scope.row)">
            {{ scope.row.bucket_name || '总仓' }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" class-name="status-col" width="120">
        <template slot-scope="{ row }">
          <el-tag :type="row.state | stateFilter">
            {{ _getStateStr(row.state) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="240">
        <template slot-scope="scope">
          <el-button type="warning" size="small" @click="handleDiv(scope)" v-if="bucket_id==0">拆分订单</el-button>
          <el-button type="primary" size="small" @click="handleEdit(scope)">修改</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)" v-if="bucket_id==0">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="viewOrderPayImgTitle" :visible.sync="viewOrderPayImgDialogVisible">
      <el-carousel width="100%" :interval="4000">
        <el-carousel-item v-for="(item, i) in orderPayImgList" :key="i">
          <img :src="item.img" width="100%" />
        </el-carousel-item>
      </el-carousel>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOrderPayImgDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog title="拆分订单" :visible.sync="dialogDivVisible">
      <el-form>
        <el-form-item label="拆分后价格"> {{ new_price }}元 </el-form-item>
        <el-form-item label="选择商品">
          <el-select v-model="sub_gids" @change="onSelectGood" multiple placeholder="选择商品">
            <el-option v-for="item in selectGoodsList" :key="item.gid" :label="item.name" :value="item.gid">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDivVisible = false">取 消</el-button>
        <el-button type="primary" @click="onDivRushGoods">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible" :close-on-click-modal="false" :title="dialogType === 'edit' ? '修改商品' : '新增商品'">
      <el-form :model="singleGoods" v-loading="submitBtnLock" label-width="110px" label-position="left">
        <el-form-item label="商品名称">
          <el-input v-model="singleGoods.name" placeholder="商品名称" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="singleGoods.cid" placeholder="请选择">
            <el-option v-for="item in categories" :key="item.cid" :label="item.name" :value="item.cid">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格(元)">
          <el-input-number v-model="singleGoods.price" :precision="2" :max="100000000" :min="0" :step="100" placeholder="商品价格" />
        </el-form-item>
        <el-form-item label="商品简介">
          <el-input v-model="singleGoods.summary" placeholder="商品简介" />
        </el-form-item>
        <el-form-item label="商品详情">
          <el-input v-model="singleGoods.description" :autosize="{ minRows: 6, maxRows: 10 }" type="textarea" placeholder="商品详情" />
        </el-form-item>
        <el-form-item label="商品图片">
          <div class="img-list">
            <div v-for="(item, index) in editImageArr" :key="index" v-show="!item.delete">
              <img :src="item.url" alt="" />
              <div class="mask">
                <div>
                  <i class="el-icon-delete" @click="removeExitImage(item)"></i>
                </div>
              </div>
            </div>
          </div>
          <el-upload ref="uploader" list-type="picture" action="web/oss/getAuth" :auto-upload="false" :http-request="handleSelectSuccess" :on-change="imgChange" :before-upload="beforeImgUpload" :on-remove="imgChange">
            <el-button size="small" type="primary">选择图片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="singleGoods.state" placeholder="请选择">
            <el-option v-for="item in stateMapList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属人" v-if="false">
          <el-select v-model="singleGoods.belonguserId" filterable remote placeholder="请输入手机号或昵称" :remote-method="remoteMethod" :loading="loading">
            <el-option v-for="item in recommenderList" :key="item.uid" :label="`${item.nickname}(${item.phone})`" :value="item.uid">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="抢购场次">
          <el-select v-model="singleGoods.schedulelist" style="width: 100%" placeholder="请选择" clearable>
            <el-option v-for="item in scheduleList" :key="item.id" :label="item.name" :value="item.id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px" v-if="bucket_id==0">({{ item.bucket_name||'总仓' }})</span>
              <!-- <el-option v-for="item in scheduleList" :key="item.id" :label="item.name" :value="item.id"> -->
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align: right">
        <el-button type="danger" :disabled="submitBtnLock" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="submitBtnLock" @click="confirmGoods">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="updateDialogTitle" :visible.sync="setRecommenderDialogVisible">
      <el-form>
        <el-form-item
          :label="`设置${singleGoods.name} 的${updateField === 'rusher_id' ? '买方' : '卖方'}`"
        >
          <el-select
            v-model="updateValue"
            filterable
            :value="updateValue"
            remote
            placeholder="请输入手机号或昵称"
            :remote-method="remoteMethod"
            :loading="loading"
          >
          <el-option
              label="没有人"
              :value="0"
            >
            </el-option>
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
        <el-button type="primary" @click="updateGoods">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改分仓" :visible.sync="dialogVisibleBucket">
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleBucket = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="handleUpdateBucket">确 定</el-button>
      </div>
    </el-dialog>

    <el-pagination class="pagination" layout="total, sizes, prev, pager, next, jumper" background @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-size="page.page_size" :pager-count="11" :total="page.total_count">
    </el-pagination>
  </div>
</template>

<script>
import _ from "lodash";
import {
  exportGoodsList,
  getGoods,
  addGoods,
  updateGoods,
  deleteGoods,
  getUploadAuth,
  getCategories,
  divRushGoods,
  getCanDivGoods,
  updateBucket
} from "@/api/goods_rush";
import { getList as getScheduleList } from "@/api/rush_schedule";
import { getRecommenders, viewOrderPayImg } from "@/api/user";
import { getBucketList } from '@/api/userBucket'
import { uplaodImage } from "@/utils/oss";
import { syncRush } from "@/api/syncdb";
import { mapGetters } from 'vuex'
const defaultGoods = {
  gid: 0,
  cid: 0,
  name: "",
  summary: "",
  description: "",
  base_price: 0,
  last_price: 0,
  price: 0,
  img: "[]",
  belong: 0,
  real_path: "[]",
  show_path: "[]",
  schedulelist: "",
  state: 1,
  origin: 0,
};

import { v4 as uuidv4 } from "uuid";

export default {
  filters: {
    stateFilter(state) {
      if (state == 0) {
        return "warning";
      } else if (state > 0 && state < 4) {
        return "primary";
      } else if (state == 4) {
        return "success";
      } else if (state == 5) {
        return "danger";
      } else {
        return "info";
      }
    },
  },
  data() {
    return {
      loading: false,
      recommenderList: [],
      tableHeight: 400,
      submitBtnLock: false,
      categories: [],
      goodsList: [],
      singleGoods: Object.assign({}, defaultGoods),
      dialogVisible: false,
      dialogDivVisible: false,
      dialogType: "new",
      ossAuth: { authType: "admin" },
      sub_gids: [],
      orderPayImgList: [],
      new_price: 0,
      page: {
        page_index: 0,
        page_size: 10,
        total_count: 0,
      },
      viewOrderPayImgDialogVisible: false,
      viewOrderPayImgTitle: "",
      scheduleList: [],
      selectGoodsList: [],
      stateMapList: [
        {
          id: 0,
          name: "未上架",
        },
        {
          id: 1,
          name: "已上架",
        },
        {
          id: 2,
          name: "待支付",
        },
        {
          id: 3,
          name: "已支付",
        },
        // {
        //   id: 4,
        //   name: "已确认",
        // },
        {
          id: 5,
          name: "待解决",
        },
        {
          id: 6,
          name: "已提货",
        },
        {
          id: 7,
          name: "已发货",
        },
      ],
      editImageArr: [],
      search: { name: "", state: "", onsale: false, sid: "" },
      setRecommenderDialogVisible: false,
      recommenderId: '',
      belongParams:{},
      updateDialogTitle : '设置买方',
      updateField: '',
      updateValue : 0,
      notices:[],
      dialogVisibleBucket : false,
      select_bucket_id : '',
      select_gid : ''
    };
  },
  components: {},
  computed: {
    ...mapGetters([
      'bucket_id'
    ])
  },
  async created() {
    await this.getCategories();
    await this.getScheduleList();
    this.getGoods();
    await this.remoteMethod()
    this.tableHeight = document.documentElement.clientHeight - 300;
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
    async remoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        let data = await getRecommenders({
          uid: this.singleGoods.belong,
          searchkey: query,
        });
        this.recommenderList = data.data;
        this.loading = false;
      } else {
        this.recommenderList = [];
      }
    },
    async getCategories() {
      let res = await getCategories();
      this.categories = res.data;
    },
    async onSyncRush() {
      let data = await syncRush();
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async getScheduleList() {
      let res = await getScheduleList();

      if (this.bucket_id != 0) {
        this.scheduleList = res.data.filter(x => x.bucket_id == this.bucket_id);
      } else
        this.scheduleList = res.data;

    },
    async getGoods() {
      let data = {
        ...this.page,
        cid: 0,
        name: this.search.name,
        onsale: this.search.onsale ? 1 : undefined,
        state: this.search.state,
        sid: this.search.sid
      };
      let res = await getGoods(data);
      this.goodsList = res.data.list;
      this.page.page_index = res.data.page_index;
      this.page.page_size = res.data.page_size;
      this.page.total_count = res.data.total_count;
    },
    async exportGoodsList() {
      let data = {
        ...this.page,
        cid: 0,
        name: this.search.name,
        onsale: this.search.onsale ? 1 : undefined,
        state: this.search.state,
        sid: this.search.sid
      };
      let res = await exportGoodsList(data);
      window.open(window.location.origin + window.location.pathname + res.data.substr(1, res.data.length), '_blank')
    },
    handleAddGoods() {
      this.singleGoods = Object.assign({}, defaultGoods);
      this.dialogType = "new";
      this.editImageArr = [];
      this.dialogVisible = true;
      this.submitBtnLock = false;
    },
    handleEdit(scope) {
      this.dialogType = "edit";
      this.singleGoods = _.cloneDeep(scope.row);
      this.editImageArr = JSON.parse(this.singleGoods.img).map((str) => {
        return {
          guid: uuidv4(),
          uid: 0,
          url: str,
          state: 1,
          delete: false,
        };
      });
      this.singleGoods.schedulelist = this.singleGoods.schedulelist[0];
      this.singleGoods.price /= 100;
      this.dialogVisible = true;
      this.submitBtnLock = false;
    },
    async handleDiv(scope) {
      this.sub_gids = [];
      this.new_price = 0;
      this.singleGoods = _.cloneDeep(scope.row);
      this.singleGoods.price /= 100;
      this.new_price = this.singleGoods.price;
      let { data } = await getCanDivGoods();
      this.selectGoodsList = data;
      this.dialogDivVisible = true;
    },
    onSelectGood(data) {
      var p = eval(
        this.selectGoodsList
          .filter((x) => data.indexOf(x.gid) > -1)
          .map((x) => x.price / 100)
          .join("+")
      );
      //   if (p >= this.singleGoods.price) {
      //     this.$message({
      //       type: "warning",
      //       message: "拆分后价格不合规",
      //     });
      //     return;
      //   }
      this.new_price = !p ? this.singleGoods.price : this.singleGoods.price - p;
    },
    async onDivRushGoods() {
      let resData = {
        origin_gid: this.singleGoods.gid,
        sub_gids: this.sub_gids,
        new_price: this.new_price * 100,
      };
      let { msg, res_code } = await divRushGoods(resData);
      if (res_code > -1) {
        this.$message({
          type: "success",
          message: "拆分成功!",
        });
        this.dialogDivVisible = false;
        this.sub_gids = [];
        this.new_price = 0;
      }
    },
    async confirmGoods() {
      this.submitBtnLock = true;
      const isEdit = this.dialogType === "edit";
      let copyRow = _.cloneDeep(this.singleGoods);
      copyRow.price = parseInt(copyRow.price * 100);
      copyRow.sid = copyRow.schedulelist
      // if (copyRow.belonguserId)
      //   copyRow.belong = copyRow.belonguserId;
      // copyRow.schedulelist = [copyRow.schedulelist];
      console.log(this.scheduleList,'scheduleList');
      const findItem = this.scheduleList.find(x => x.id == copyRow.schedulelist)
      copyRow.bucket_id = findItem ? findItem.bucket_id :copyRow.bucket_id
      let this_ = this;

      if (copyRow.waitUpload) {
        async function uploadSingleImage(data) {
          let res = await getUploadAuth({
            authType: "goods-rush",
          });
          let sts = res.data;
          let result = await uplaodImage(data.raw, sts);
          console.log(result);
          this_.editImageArr.push({
            guid: 0,
            uid: data.uid,
            url: result.url,
            newadd: true,
          });
        }
        for (let i = 0; i < copyRow.waitUpload.length; i++) {
          await uploadSingleImage(copyRow.waitUpload[i]);
        }
        this.$refs.uploader.clearFiles();
      }
      copyRow.img = this.editImageArr
        .filter((d) => {
          return (d.uid == 0 && !d.delete) || d.uid > 0;
        })
        .map((d) => {
          return d.url;
        });

      copyRow.img = JSON.stringify(copyRow.img);

      if (isEdit) {
        await updateGoods({
          ...copyRow,
          fileChnage: this.editImageArr,
        });
        this.editImageArr = [];
        copyRow.waitUpload = undefined;
        for (let index = 0; index < this.goodsList.length; index++) {
          if (this.goodsList[index].gid === copyRow.gid) {
            this.goodsList.splice(index, 1, Object.assign({}, copyRow));
            break;
          }
        }
      } else {
        const { res_code, data } = await addGoods(copyRow);
        this.editImageArr = [];
        if (res_code < 1) {
          this.submitBtnLock = false;
          return;
        }
        copyRow.waitUpload = undefined;
        copyRow.gid = data;
        copyRow.base_price = copyRow.price;
        this.goodsList.unshift(copyRow);
      }

      this.dialogVisible = false;
      this.setRecommenderDialogVisible = false

      copyRow.updateInfo = undefined;
      this.submitBtnLock = false;
      this.$notify({
        title: "成功",
        dangerouslyUseHTMLString: true,
        message: `
                    <div>商品id: ${copyRow.gid}</div>
                    <div>商品名称: ${copyRow.name}</div>
                `,
        type: "success",
      });
      await this.getGoods();
    },
    handleDelete({ $index, row }) {
      this.$confirm(
        "确定删除当前商品?不可恢复！！！如仍需使用建议使用 “不显示” 功能",
        "警告",
        {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(async () => {
          await deleteGoods({ gid: row.gid });
          this.goodsList.splice($index, 1);
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    async handleSelectSuccess(fileData) {
      let res = await getUploadAuth({ authType: "admin" });
      let sts = res.data;
      let this_ = this;

      let OSS = require("ali-oss");
      console.log(sts);
      //使用STS临时授权数据初始化OSS对象
      let client = new OSS({
        accessKeyId: sts.accessKeyId,
        accessKeySecret: sts.accessKeySecret,
        stsToken: sts.stsToken,
        region: sts.region,
        bucket: sts.bucket,
      });

      let result = await client.put(sts.filepath, fileData.file);
      console.log("-- result");
      console.log(result);
      if (result.res && result.res.status == 200) {
        this_.$notify({
          title: "成功",
          dangerouslyUseHTMLString: true,
          message: `上传完成`,
          type: "success",
        });
        this_.singleGoods.img = result.url;
      } else {
        this_.$notify({
          title: "上传失败",
          dangerouslyUseHTMLString: true,
          message: "",
          type: "error",
        });
        console.log("--- upload err ---");
        console.log(result);
      }
    },
    beforeImgUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt20M = file.size / 1024 / 1024 < 20;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 或 PNG 格式!");
      }
      if (!isLt20M) {
        this.$message.error("上传头像图片大小不能超过 20MB!");
      }
      return isJPG && isLt20M;
    },
    _getFirstImg(imgArrStr) {
      let arr = JSON.parse(imgArrStr);
      if (arr.length > 0) {
        return arr[0];
      }
      return require("../../../assets/local/nothing.png");
    },
    _getAllImg(imgArrStr) {
      return JSON.parse(imgArrStr);
    },
    _getStateStr(state) {
      if (state == 0) {
        return "未上架";
      } else if (state == 1) {
        return "已上架";
      } else if (state == 2) {
        return "待支付";
      } else if (state == 3) {
        return "已支付";
      } else if (state == 4) {
        return "已确认";
      } else if (state == 5) {
        return "待解决";
      } else if (state == 6) {
        return "已提货";
      } else if (state == 7) {
        return "已发货";
      }
    },
    _getCategoryName(cid) {
      let findC = this.categories.find((c) => {
        return c.cid == cid;
      });
      return findC ? findC.name : "";
    },
    imgChange(file, fileList) {
      this.singleGoods.waitUpload = fileList;
    },
    removeExitImage(item) {
      if (this.editImageArr) {
        this.editImageArr.forEach((d) => {
          if (d.guid == item.guid) {
            d.delete = true;
          }
        });
      }
    },
    async handleSizeChange(val) {
      this.page.page_size = val;
      await this.getGoods();
    },
    async handleCurrentChange(val) {
      this.page.page_index = val - 1;
      await this.getGoods();
    },
  // 设置卖方
    async showSetBelong(row, field){
      await this.remoteMethod()
      console.log(row);
      this.singleGoods = row
      this.dialogType = "edit";
      this.updateField = field
      if(field === 'rusher_id'){
        this.updateDialogTitle = '设置买方'
      }else{
        this.updateDialogTitle = '设置卖方'
      }
      this.singleGoods = _.cloneDeep(row);
      this.updateValue =  this.singleGoods[field]
      this.editImageArr = JSON.parse(this.singleGoods.img).map((str) => {
        return {
          guid: uuidv4(),
          uid: 0,
          url: str,
          state: 1,
          delete: false,
        };
      });
      this.singleGoods.schedulelist = this.singleGoods.schedulelist[0];
      this.singleGoods.price /= 100;
      this.setRecommenderDialogVisible = true
    },
    updateGoods() {
      this.singleGoods[this.updateField] = this.updateValue
      this.confirmGoods()
    },
    updateBucket(row) {
      this.dialogVisibleBucket = true
      this.select_bucket_id = row.bucket_id
      this.select_gid = row.gid
      this.getNotices()
    },
    async getNotices() {
      const res = await getBucketList();
      this.notices = res.data.map(item => {
        return {
         ...item,
        uid: item.uid.toString()
        }
      });
    },
    async handleUpdateBucket() {
      let result = await updateBucket({
        gid: this.select_gid,
        bucket_id: this.select_bucket_id,
      });
      if(result.res_code === 1){
        this.$message({
          type: "success",
          message: "修改成功!",
        });
        this.dialogVisibleBucket = false
      }
      
      this.getGoods();
    }
    // TODO  后台上传图片存在控件泄露问题
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

.el-carousel__item {
  overflow: auto;
  text-align: center;
}
.pointer{
  cursor: pointer;
}
</style>
