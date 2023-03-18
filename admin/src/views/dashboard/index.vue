<template>
  <div class="dashboard-container">
    <div class="dashboard-text">管理员: {{ nickname }}</div>
    <div class="btn-list">
      <el-button
        type="primary"
        @click="onHandleSysSetting"
        icon="el-icon-refresh"
        >系统设置</el-button
      >
      <el-button
        type="primary"
        @click="onSyncCommon('protocol')"
        icon="el-icon-refresh"
        >推送协议</el-button
      >
      <!-- <el-button
        type="primary"
        @click="onSyncCommon('banner')"
        icon="el-icon-refresh"
        >Banner</el-button
      > -->
    </div>

    <div class="order">
      <p class="dashboard-text">订单数据统计</p>
      <div>
        总销售订单数:<span>{{ orderStatistics.total_count }}</span>
      </div>
      <div>
        总销售订单金额:<span
          >￥{{ (orderStatistics.total_money / 100).toFixed(2) }}</span
        >
      </div>
      <div>
        今日销售订单数:<span>{{ orderStatistics.today_count }}</span>
      </div>
      <div>
        今日销售金额:<span
          >￥{{ (orderStatistics.today_money / 100).toFixed(2) }}</span
        >
      </div>
      <div>
        购买人数:<span>{{ orderStatistics.user_count }}</span>
      </div>
      <div>
        首次购买人数:<span>{{ orderStatistics.first_count }}</span>
      </div>
    </div>

    <div class="order">
      <p class="dashboard-text">抢购人数统计</p>
      <div class="sitem" v-for="(item,index) in rushDataList" :key="index">
        <p>{{item.name}}({{item.starttime}}-{{item.endtime}})</p>
        <p>进场人数:<span style="margin-right:30px">{{ item.count }}</span>成功人数:<span>{{ item.success_count }}</span></p>
        <el-button type="primary" size="mini" @click="downloadTxt(item)">下载进场数据</el-button>
      </div>
    </div>

    <el-dialog title="系统设置" :visible.sync="rateDialogVisible">
      <el-form inline>
        <el-form-item :label="`上架手续费率`">
          <el-input
            v-model="handlingFeeRate"
            autocomplete="off"
            style="width: 130px"
          >
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveHandlingFeeRate"
            >设 定</el-button
          >
        </el-form-item>
      </el-form>
      <el-form inline>
        <el-form-item :label="`上架价格涨幅`">
          <el-input
            v-model="launchGainRate"
            autocomplete="off"
            style="width: 130px"
          >
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveLaunchGainRate"
            >设 定</el-button
          >
        </el-form-item>
      </el-form>
      <el-form inline>
        <el-form-item :label="`委托上架时间`">
          <el-input
            v-model="launchTime"
            autocomplete="off"
            style="width: 130px"
          >
            <template slot="append">小时</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveLaunchTime">设 定</el-button>
        </el-form-item>
      </el-form>
      <el-form inline>
        <el-form-item :label="`上架功能`">
          <el-switch
            v-model="launchStatus"
            :active-value="1"
            :inactive-value="0"
            active-text="开"
            inactive-text="关"
          >
          </el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveLaunchStatus">设 定</el-button>
        </el-form-item>
      </el-form>
      <el-form inline>
        <el-form-item :label="`抢购数量上限`">
          <el-input
            v-model="limitCount"
            autocomplete="off"
            style="width: 130px"
          >
            <template slot="append">件/场</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveLimitCount">设 定</el-button>
        </el-form-item>
      </el-form>
      <el-form inline v-if="false">
        <el-form-item :label="`新用户特权持续时间`">
          <el-input
            v-model="newUserPrivilege.limit_day"
            autocomplete="off"
            style="width: 130px"
          >
            <template slot="append">天</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="`新用户提前入场时间`">
          <el-input
            v-model="newUserPrivilege.time"
            autocomplete="off"
            style="width: 130px"
          >
            <template slot="append">秒</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="`新用户可抢购数量`">
          <el-input
            v-model="newUserPrivilege.count"
            autocomplete="off"
            style="width: 130px"
          >
            <template slot="append">件</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveNewUserPrivilege"
            >设 定</el-button
          >
        </el-form-item>
      </el-form>
      <el-form inline>
        <el-form-item :label="`直接推荐人收益`">
          <el-input
            v-model="incomeRate[0].value"
            autocomplete="off"
            style="width: 130px"
          >
            <template slot="append">‰</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="`间接推荐人收益`">
          <el-input
            v-model="incomeRate[1].value"
            autocomplete="off"
            style="width: 130px"
          >
            <template slot="append">‰</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveIncomeRate">设 定</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rateDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { syncCommon } from "@/api/syncdb";
import {saveAs} from 'file-saver';
import {
  getHandlingFeeRate,
  setHandlingFeeRate,
  getNewUserPrivilege,
  setNewUserPrivilege,
  getIncomeRate,
  setIncomeRate,
  getOrderStatistics,
  getCommonUserLimit,
  setCommonUserLimit,
  getAllGoodsLaunchStatus,
  setAllGoodsLaunchStatus,
  getGoodsLaunchTime,
  setGoodsLaunchTime,
  getGoodsLaunchGain,
  setGoodsLaunchGain,
  getTodayRushAccess,
  getAccessData
} from "@/api/system";

export default {
  name: "Dashboard",
  computed: {
    ...mapGetters(["nickname"]),
  },
  data() {
    return {
      orderStatistics: {},
      rateDialogVisible: false,
      handlingFeeRate: "",
      newUserPrivilege: {
        count: "",
        time: "",
        limit_day: "",
      },
      launchStatus:'',
      launchGainRate:'',
      launchTime:'',
      limitCount: "",
      incomeRate: [
        {
          level: 1,
          value: "",
        },
        {
          level: 2,
          value: "",
        },
      ],
      rushDataList:[]
    };
  },
  async created() {
    let data = await getOrderStatistics();
    this.orderStatistics = data.data;

    let rdata = await getTodayRushAccess();
    if(rdata.res_code>0){
      this.rushDataList = rdata.data;
    }
  },
  methods: {
    async onHandleSysSetting() {
      if (this.handlingFeeRate == "") {
        let data = await getHandlingFeeRate();
        this.handlingFeeRate = data.data;
      }
      if (this.limitCount == "") {
        let { data } = await getCommonUserLimit();
        this.limitCount = data.count;
      }
      if (this.launchStatus == "") {
        let { data } = await getAllGoodsLaunchStatus();
        console.log(data)
        this.launchStatus = data;
      }
      
      if (this.launchGainRate == "") {
        let { data } = await getGoodsLaunchGain();
        this.launchGainRate = data;
      }
      
      if (this.launchTime == "") {
        let { data } = await getGoodsLaunchTime();
        this.launchTime = data;
      }
      if (
        this.newUserPrivilege.count == "" &&
        this.newUserPrivilege.limit_day == "" &&
        this.newUserPrivilege.time == ""
      ) {
        let data = await getNewUserPrivilege();
        this.newUserPrivilege = data.data;
      }
      if (this.incomeRate[0].value == "" && this.incomeRate[1].value == "") {
        let data = await getIncomeRate();
        this.incomeRate = data.data;
      }
      this.rateDialogVisible = true;
    },
    async saveHandlingFeeRate() {
      let data = await setHandlingFeeRate({
        rate: this.handlingFeeRate,
      });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async saveHandlingFeeRate() {
      let data = await setHandlingFeeRate({
        rate: this.handlingFeeRate,
      });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async saveLaunchTime() {
      let data = await setGoodsLaunchTime({
        time: this.launchTime,
      });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async saveLaunchStatus() {
      let data = await setAllGoodsLaunchStatus({
        state: this.launchStatus,
      });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async saveLaunchGainRate() {
      let data = await setGoodsLaunchGain({
        rate: this.launchGainRate,
      });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async saveHandlingFeeRate() {
      let data = await setHandlingFeeRate({
        rate: this.handlingFeeRate,
      });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async saveLimitCount() {
      let data = await setCommonUserLimit({ count: this.limitCount });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async saveNewUserPrivilege() {
      let data = await setNewUserPrivilege(this.newUserPrivilege);
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async saveIncomeRate() {
      let data = await setIncomeRate({ data: this.incomeRate });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async onSyncCommon(key) {
      let data = await syncCommon({ key });
      this.$message({
        message: data.msg,
        type: data.res_code > 0 ? "success" : "error",
      });
    },
    async downloadTxt(item){
      let data = await getAccessData({s:item.sid});
      let str=``;
      if(data.length>0){
        data.forEach(d=>{
          str+=`uid:${d.uid}\tnickname:${d.nickname}\tphone:${d.phone}\n`;
        });
      }
      let blob = new Blob([str],{type:'text/plain;charset=utf-8'});
      saveAs(blob,`${item.name}.txt`);
    }
  },
};
</script>

<style lang="scss" scoped>
.btn-list {
  margin: 30px;
}

.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}

.order > div {
  font-size: 1.2rem;
  margin: 10px 0;
  color: #666;
}
.order > div span {
  margin: 0 5px;
  color: #198ff0;
}

.sitem{
  padding: 10px;
  border-radius: 10px;
  background: #EEE;
}
</style>
