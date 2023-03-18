<template>
  <div class="app-container">
    <div class="div-btn">
      <el-button type="primary" @click="handleRush">添加抢购场次</el-button>
      <el-button type="primary" @click="onSyncCommon('schedule')" icon="el-icon-refresh">推送场次</el-button>
    </div>

    <el-table v-loading="listLoading" highlight-current-row :data="rushes" row-key="id" style="width: 100%; margin-top: 30px" border>
      <el-table-column align="center" label="场次ID" width="80">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" :show-overflow-tooltip="true" label="抢购场次名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" :show-overflow-tooltip="true" label="所属分仓" v-if="bucket_id==0">
        <template slot-scope="scope">
          {{ scope.row.bucket_name||'总仓' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="开始时间" width="200">
        <template slot-scope="scope">
          {{ scope.row.starttime }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="结束时间" width="200">
        <template slot-scope="scope">
          {{ scope.row.endtime }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="200">
        <template slot-scope="scope">
          <el-tag :type="scope.row.state | stateFilter">
            {{ scope.row.state==1?'正常':'暂停' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="提示" width="200">
        <template slot-scope="scope">
          {{ scope.row.tip }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="200" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">修改</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType === 'edit' ? '修改抢购场次' : '新增抢购场次'">
      <el-form :model="rush" label-width="120px" label-position="left">
        <el-form-item label="抢购场次名称">
          <el-input v-model="rush.name" placeholder="例如：上午 第一场" />
        </el-form-item>
        <el-form-item label="所属分仓" v-if="bucket_id==0">
          <el-select v-model="rush.bucket_id" placeholder="请选择">
            <el-option label="总仓" :value="0" />
            <el-option v-for="item in bucketSelection" :key="item.uid" :label="item.bucket_name" :value="item.uid" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-time-picker is-range v-model="rush.rushTime" value-format="HH:mm:ss" :picker-options="{
              format: 'HH:mm:ss',
            }" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" @input="daterangeChange">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="rush.state" placeholder="请选择">
            <el-option v-for="item in stateSelection" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提示文字">
          <el-input v-model="rush.tip"></el-input>
        </el-form-item>
      </el-form>
      <div style="text-align: right">
        <el-button type="danger" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmNotice">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import { getList, addRush, updateRush, deleteRush } from "@/api/rush_schedule";
import { getBucketList } from '@/api/userBucket'
import { syncCommon } from "@/api/syncdb";
import { mapGetters } from 'vuex'

const defaultRush = {
  id: 0,
  name: "",
  rushTime: [],
};

export default {
  filters: {
    stateFilter(state) {
      if (state == 0) {
        return "warning";
      } else if (state == 1) {
        return "success";
      }
    },
  },
  data() {
    return {
      listLoading: true,
      rushes: [],
      rush: Object.assign({}, defaultRush),
      dialogVisible: false,
      dialogType: "new",
      bucketSelection:[],
      stateSelection: [{
        id: 1,
        name: "正常"
      }, {
        id: 0,
        name: "暂停"
      }]
    };
  },
  computed: {
    ...mapGetters([
      'bucket_id'
    ])
  },
  created() {
    this.getList();
    this.getBucketList();
  },
  methods: {
    async getList() {
      this.listLoading = true;
      const res = await getList();
      if (this.bucket_id != 0) {
        this.rushes = res.data.filter(x => x.bucket_id == this.bucket_id);
      } else
        this.rushes = res.data;
      this.listLoading = false;
    },
    async getBucketList(){
      const res = await getBucketList();
      this.bucketSelection = res.data;
    },
    async onSyncCommon(key) {
      let data = await syncCommon({ key });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    handleRush() {
      this.rush = Object.assign({bucket_id:this.bucket_id}, defaultRush);
      this.dialogType = "new";
      this.dialogVisible = true;
    },
    handleEdit(scope) {
      this.dialogType = "edit";
      this.dialogVisible = true;
      this.rush = _.cloneDeep(scope.row);
      this.rush.rushTime = [this.rush.starttime, this.rush.endtime]
    },
    handleDelete({ $index, row }) {
      this.$confirm("确定删除当前抢购场次?不可恢复！", "警告", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          await deleteRush({ id: row.id });
          this.rushes.splice($index, 1);
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    async confirmNotice() {
      const isEdit = this.dialogType === "edit";
      if (isEdit) {
        this.rush.starttime = this.rush.rushTime[0];
        this.rush.endtime = this.rush.rushTime[1];
        let { res_code, data } = await updateRush(this.rush);
        if (res_code > 0) {
          for (let index = 0; index < this.rushes.length; index++) {
            if (this.rushes[index].id === this.rush.id) {
              this.rushes.splice(index, 1, Object.assign({}, this.rush));
              break;
            }
          }
          this.dialogVisible = false;
          this.$notify({
            title: "成功",
            dangerouslyUseHTMLString: true,
            message: `
                    <div>抢购场次id: ${this.rush.id}</div>
                    <div>抢购场次: ${this.rush.name}</div>
                `,
            type: "success",
          });
        }
      } else {
        this.rush.starttime = this.rush.rushTime[0];
        this.rush.endtime = this.rush.rushTime[1];
        let { res_code, data } = await addRush(this.rush);
        if (res_code > 0) {
          this.rush.id = data;
          this.rushes.push(this.rush);
          this.dialogVisible = false;
          this.$notify({
            title: "成功",
            dangerouslyUseHTMLString: true,
            message: `
                    <div>抢购场次id: ${this.rush.id}</div>
                    <div>抢购场次: ${this.rush.name}</div>
                `,
            type: "success",
          });
        }
      }
      this.getList();
    },
    daterangeChange(e) {
      let _this = this
      console.log(e)
      _this.$nextTick(() => {
        _this.$set(_this.rush, "rushTime", [e[0], e[1]]);
        _this.$forceUpdate();
      });
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
</style>
