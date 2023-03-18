<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddGoods">添加货架商品</el-button>
    <el-button type="primary" @click="onSyncShelves" icon="el-icon-refresh">推送商品</el-button>
    <el-button type="warning" @click="exportGoodsList">导出</el-button>
    <el-table :data="goodsList" style="width: 100%;margin-top:30px;" border>
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
      <el-table-column align="center" width="200" :show-overflow-tooltip="true" label="商品名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品类别" width="100">
        <template slot-scope="scope">
          {{_getCategoryName(scope.row.cid)}}
        </template>
      </el-table-column>
      <el-table-column align="center" label="价格" width="100">
        <template slot-scope="scope">
          {{ (scope.row.price/100).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column align="center" :show-overflow-tooltip="true" label="商品简介">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="数量" width="80">
        <template slot-scope="scope">
          {{ scope.row.count }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="80" label="商品图片">
        <template slot-scope="scope">
          <img class="goods-img" :src="_getFirstImg(scope.row.img)" alt="">
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" class-name="status-col" width="80">
        <template slot-scope="{row}">
          <el-tag :type="row.state | stateFilter">
            {{_getStateStr(row.state)}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">修改</el-button>
          <el-button v-if="scope.row.state!=0" size="small" @click="handleModifyState(scope.row,'hidden')">
            隐藏
          </el-button>
          <el-button v-if="scope.row.state==0" size="small" type="success" @click="handleModifyState(scope.row,'show')">
            显示
          </el-button>
          <el-tooltip content="用户列表可见,显示为 “下架” 状态" placement="top">
            <el-button v-if="scope.row.state!=2" size="small" @click="handleModifyState(scope.row,'offline')">
              下架
            </el-button>
          </el-tooltip>
          <el-button v-if="scope.row.state==2" size="small" @click="handleModifyState(scope.row,'online')">
            上架
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :close-on-click-modal="false" :title="dialogType==='edit'?'修改货架商品':'新增货架商品'">
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
        <el-form-item label="商品数量">
          <el-input-number v-model="singleGoods.count" :max="9999" :min="1" :step="1" placeholder="商品数量" />
        </el-form-item>
        <el-form-item label="商品简介">
          <el-input v-model="singleGoods.summary" placeholder="商品简介" />
        </el-form-item>
        <el-form-item label="商品详情">
          <el-input v-model="singleGoods.description" :autosize="{ minRows: 6, maxRows: 10}" type="textarea" placeholder="商品详情" />
        </el-form-item>
        <el-form-item label="商品图片">
          <div class="img-list">
            <div v-for="(item,index) in editImageArr" :key="index" v-show="!item.delete">
              <img :src="item.url" alt="">
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
        <el-form-item label="商品状态">
          <el-select v-model="singleGoods.state" placeholder="请选择">
            <el-option v-for="item in stateMapList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" :disabled="submitBtnLock" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :disabled="submitBtnLock" @click="confirmGoods">确认</el-button>
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
} from "@/api/goods_shelves";
import { uplaodImage } from "@/utils/oss";
import { syncShelves } from "@/api/syncdb";

const defaultGoods = {
  gid: 0,
  cid: 0,
  name: "",
  summary: "",
  description: "",
  price: 0,
  count: 0,
  img: "[]",
  belong: 0,
  state: 1,
};

import { v4 as uuidv4 } from "uuid";

export default {
  filters: {
    stateFilter(state) {
      if (state == 0) {
        return "warning";
      } else if (state == 1) {
        return "success";
      } else if (state == 2) {
        return "danger";
      } else {
        return "info";
      }
    },
  },
  data() {
    return {
      submitBtnLock: false,
      categories: [],
      goodsList: [],
      singleGoods: Object.assign({}, defaultGoods),
      dialogVisible: false,
      dialogType: "new",
      ossAuth: { authType: "admin" },
      page: {
        page_index: 0,
        page_size: 10,
        total_count: 0,
      },
      stateMapList: [
        {
          id: 0,
          name: "隐藏",
        },
        {
          id: 1,
          name: "上架",
        },
        {
          id: 2,
          name: "下架",
        },
      ],
      editImageArr: [],
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
    async onSyncShelves() {
      let data = await syncShelves();
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async getGoods() {
      let data = {
        ...this.page,
        gid: 0,
        name: "",
        state: -2,
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
        gid: 0,
        name: "",
        state: -2,
      };
      let res = await exportGoodsList(data);
      window.open(window.location.origin+window.location.pathname+res.data.substr(1,res.data.length),'_blank')
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
      this.singleGoods.price /= 100;
      this.dialogVisible = true;
      this.submitBtnLock = false;
    },
    async confirmGoods() {
      this.submitBtnLock = true;
      const isEdit = this.dialogType === "edit";
      let copyRow = _.cloneDeep(this.singleGoods);
      copyRow.price = parseInt(copyRow.price * 100);
      let this_ = this;

      if (copyRow.waitUpload) {
        async function uploadSingleImage(data) {
          let res = await getUploadAuth({
            authType: "goods-shelves",
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
            this.goodsList.splice(
              index,
              1,
              Object.assign({}, copyRow)
            );
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
        this.goodsList.unshift(copyRow);
      }

      this.dialogVisible = false;
      this.submitBtnLock = false;
      copyRow.updateInfo = undefined;

      this.$notify({
        title: "成功",
        dangerouslyUseHTMLString: true,
        message: `
                    <div>商品id: ${copyRow.gid}</div>
                    <div>商品名称: ${copyRow.name}</div>
                `,
        type: "success",
      });
    },
    async handleModifyState(row, strState) {
      let copyRow = _.cloneDeep(row);

      if (strState == "hidden") {
        copyRow.state = 0;
      } else if (strState == "show") {
        copyRow.state = 1;
      } else if (strState == "offline") {
        copyRow.state = 2;
      } else if (strState == "online") {
        copyRow.state = 1;
      }

      await updateGoods(copyRow);
      for (let index = 0; index < this.goodsList.length; index++) {
        if (this.goodsList[index].gid === copyRow.gid) {
          this.goodsList.splice(index, 1, Object.assign({}, copyRow));
          break;
        }
      }

      this.$message({
        message: "操作成功",
        type: "success",
      });
      row.state = copyRow.state;
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
      console.log("--- ---");
      console.log(fileData);
      return;
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
      const isJPG =
        file.type === "image/jpeg" || file.type === "image/png";
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
        return "隐藏";
      } else if (state == 1) {
        return "正常";
      } else if (state == 2) {
        return "下架";
      } else {
        return "未知";
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
</style>
