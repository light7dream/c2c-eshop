<template>
  <div class="app-container">
    <!-- Note that row-key(nid) is necessary to get a correct row order. -->
    <el-table
      ref="dragTable"
      v-loading="listLoading"
      highlight-current-row
      :data="notices"
      row-key="nid"
      style="width: 100%; margin-top: 30px"
      border
    >
      <el-table-column align="center" label="分仓ID">
        <template slot-scope="scope">
          {{ scope.row.uid }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :show-overflow-tooltip="true"
        width="450"
        label="分仓名称"
      >
        <template slot-scope="scope">
          {{ scope.row.bucket_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="300" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="viewMembers(scope)"
            >查看成员</el-button
          >
          <el-button type="danger" size="small" @click="handleDelete(scope)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="查看分仓管理员"
      :visible.sync="setRecommenderDialogVisible"
    >
      <el-table
        highlight-current-row
        :data="members"
        row-key="nid"
        style="width: 100%; margin-top: 30px"
        border
      >
        <el-table-column align="center" label="昵称">
          <template slot-scope="scope">
            {{ scope.row.nickname }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="手机号">
          <template slot-scope="scope">
            {{ scope.row.phone }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="开户行">
          <template slot-scope="scope">
            {{ scope.row.payee_bankname }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="银行卡号">
          <template slot-scope="scope">
            {{ scope.row.payee_bankno }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="收款人">
          <template slot-scope="scope">
            {{ scope.row.payee_name }}
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRecommenderDialogVisible = false"
          >关 闭</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import {
  getBucketList,
  deleteBucket,
  getBucketMembers,
} from "@/api/userBucket";

export default {
  data() {
    return {
      listLoading: true,
      members: [],
      notices: [],
      setRecommenderDialogVisible: false,
    };
  },
  computed: {},
  created() {
    this.getNotices();
  },
  methods: {
    async getNotices() {
      this.listLoading = true;
      const res = await getBucketList();
      this.notices = res.data;
      this.listLoading = false;
    },
    async viewMembers(scope) {
      const res = await getBucketMembers({bucket_id:scope.row.uid});
      this.members = res.data;
      this.setRecommenderDialogVisible = true;
    },
    handleDelete({ $index, row }) {
      this.$confirm("确定删除当前分仓?不可恢复！！！", "警告", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          await deleteBucket({ bucket_id: row.uid });
          this.notices.splice($index, 1);
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        })
        .catch((err) => {
          console.error(err);
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

.sortable-ghost {
  opacity: 0.8;
  color: #fff !important;
  background: #42b983 !important;
}

.icon-star {
  margin-right: 2px;
}
.drag-handler {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.show-d {
  margin-top: 15px;
}
</style>
