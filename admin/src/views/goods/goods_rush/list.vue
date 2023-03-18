<template>
  <div class="app-container">
    <el-table :data="goodsList" style="width: 100%; margin-top: 30px" border>
      <el-table-column align="center" label="商品ID" width="80">
        <template slot-scope="scope">
          {{ scope.row.gid }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品编号" width="120">
        <template slot-scope="scope">
             {{ (scope.row.code+scope.row.gid) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        width="200"
        :show-overflow-tooltip="true"
        label="商品名称"
      >
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
      <el-table-column
        align="center"
        :show-overflow-tooltip="true"
        label="商品简介"
      >
        <template slot-scope="scope">
          {{ scope.row.summary }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="100" label="商品图片">
        <template slot-scope="scope">
          <img class="goods-img" :src="_getFirstImg(scope.row.img)" alt="" />
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        class-name="status-col"
        width="120"
      >
        <template slot-scope="{ row }">
          <el-tag :type="row.state | stateFilter">
            {{ _getStateStr(row.state) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

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
  getBelongUserRushGoods,
} from "@/api/user";
import {
  getCategories,
} from "@/api/category";

export default {
  name: "userGoodsRush",
  props: {
    uid: {
      type: Number,
    },
  },
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
      page: {
        page_index: 0,
        page_size: 10,
        total_count: 0,
      },
      goodsList:[],
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
        {
          id: 4,
          name: "已确认",
        },
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
    };
  },
  components: {},
  computed: {},
  async created() {
    await this.getCategories();
    this.getGoods();
  },
  methods: {
      async getCategories() {
      let res = await getCategories();
      this.categories = res.data;
    },
    async getGoods() {
      let data = {
        ...this.page,
        uid:this.uid
      };
      let res = await getBelongUserRushGoods(data);
      this.goodsList = res.data.list;
      this.page.page_index = res.data.page_index;
      this.page.page_size = res.data.page_size;
      this.page.total_count = res.data.total_count;
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
      }else if (state == 6) {
        return "已提货";
      }else if (state == 7) {
        return "已发货";
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
    _getCategoryName(cid) {
      let findC = this.categories.find((c) => {
        return c.cid == cid;
      });
      return findC ? findC.name : "";
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
</style>
