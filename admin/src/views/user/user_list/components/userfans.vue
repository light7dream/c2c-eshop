<template>
  <div class="app-container">
    <el-table :data="userList" style="width: 100%; margin-top: 30px" border>
      <el-table-column
        align="center"
        width="180"
        :show-overflow-tooltip="true"
        label="手机号"
      >
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="昵称" width="180">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="邀请时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="关系" width="180">
        <template slot-scope="scope">
          {{ scope.row.level==1?'一级粉丝':'二级粉丝' }}
        </template>
      </el-table-column>
      
      <el-table-column align="center" label="粉丝购买订单">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="viewOrderPayImg(scope.row.uid)"
            >查看</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="viewOrderPayImgTitle"
      :visible.sync="viewOrderPayImgDialogVisible"
    >
      <FansOrderList :uid="fansid" :key="new Date().getTime()" orderType="fansOrder" />
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
import { getUserFans } from "@/api/user";
import FansOrderList from "@/views/user/user_list/components/fansOrderList";
export default {
  name: "userFans",
  props: {
    uid: {
      type: Number,
    }
  },
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
      fansid:'',
      submitBtnLock: false,
      userList: [],
      orderPayImgList: [],
      viewOrderPayImgDialogVisible:false,
      viewOrderPayImgTitle:"",
      page: {
        page_index: 0,
        page_size: 10,
        total_count: 0,
      },
    };
  },
  components: { FansOrderList },
  computed: {},
  async created() {
    this.getUserOrderList();
  },
  methods: {
    async viewOrderPayImg(uid) {
      this.fansid = uid;
      this.viewOrderPayImgDialogVisible = true;
      this.viewOrderPayImgTitle="粉丝购买订单";
    },
    async getUserOrderList() {
      let data = {
        ...this.page,
        uid: this.uid
      };
      let res = await getUserFans(data);
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
.el-carousel__item{
  overflow: auto;
  text-align: center;
}
</style>
