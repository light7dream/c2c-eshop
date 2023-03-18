<template>
  <div class="app-container">
    <el-form inline label-width="110px" label-position="left">
      <el-form-item label="姓名">
        <el-input placeholder="姓名" v-model="search.nickname" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input placeholder="手机号" v-model="search.phone" />
      </el-form-item>
      <el-button type="success" @click="getUserList(true)">搜索</el-button>
    </el-form>

    <el-table
      :data="userList"
      style="width: 100%; margin-top: 30px"
      ref="userTable"
      :height="tableHeight"
      border
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column
        align="center"
        :show-overflow-tooltip="true"
        label="手机号"
      >
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="头像">
        <template slot-scope="scope">
          <img
            class="goods-img"
            :src="_getDefaultImg(scope.row.avatar)"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="昵称">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
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
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="resetUser(scope.row)"
            >恢复账号</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="deleteDeep(scope.row)"
          >
            彻底删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
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
  resetUser,
  deleteDeep
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
      tableHeight: 400,
      search: {
        nickname: "",
        phone: "",
        isbad: "",
        has_recommender: "",
      },
      userList: [],
      page: {
        page_index: 0,
        page_size: 10,
        total_count: 0,
      },
      loading: false,
    };
  },
  components: {
  },
  computed: {},
  async created() {
    this.getUserList();
    this.tableHeight = document.documentElement.clientHeight - 300;
  },
  methods: {
    async getUserList(search) {
      if (search) this.page.page_index = 0;
      let data = {
        ...this.page,
        nickname: this.search.nickname,
        phone: this.search.phone,
        state: -1
      };
      let res = await getUserList(data);
      this.userList = res.data.list;
      this.page.page_index = res.data.page_index;
      this.page.page_size = res.data.page_size;
      this.page.total_count = res.data.total_count;
    },
    _getDefaultImg(img) {
      if (img) {
        return img;
      }
      return require("../../assets/local/93.png");
    },
    _getStateStr(state) {
      if (state == 0) {
        return "停用";
      } else if (state == 1) {
        return "正常";
      }
      return "已删除";
    },
    async handleSizeChange(val) {
      this.page.page_size = val;
      await this.getUserList();
    },
    async handleCurrentChange(val) {
      this.page.page_index = val - 1;
      await this.getUserList();
    },
    async resetUser(row){
      this.$confirm(`确定要为用户 ${row.nickname}恢复账号吗?`, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let { res_code } = await resetUser({
              uid: row.uid
            });
            if (res_code > 0) {
              this.$message({
                type: "success",
                message: "恢复成功!",
              });
              await this.getUserList();
            }
          })
          .catch((err) => {
            this.$message({
              type: "success",
              message: "恢复失败!",
            });
          });
      
    },
    async deleteDeep(row){
      this.$confirm(`确定彻底删除 ${row.nickname}吗?`, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            let { res_code } = await deleteDeep({
              uid: row.uid
            });
            if (res_code > 0) {
              this.$message({
                type: "success",
                message: "删除成功!",
              });
              await this.getUserList();
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
</style>
