<template>
    <div class="page"
        id="three_level_address">
        <BarNavigate class="nav-back"
            title="地址信息"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="region-div">
                <mt-popup v-model="regionVisible"
                    position="bottom"
                    class="region-popup">
                    <mt-picker :slots="myAddressSlots"
                        valueKey="name"
                        :visibleItemCount="5"
                        @change="addressChange"
                        :itemHeight="40"></mt-picker>
                </mt-popup>

                <div>

                    <mt-field label="姓名"
                        placeholder="收件人姓名"
                        v-model="info.name"></mt-field>
                    <mt-field label="手机"
                        placeholder="收件人手机号"
                        v-model="info.phone"></mt-field>
                    <hr class="hr">
                    <div class="item"
                        @click="showAddressPicker">
                        <!-- <hr class="line" /> -->
                        <p><span style="margin-right:73px">地址</span>{{info.province}} {{ info.city}} {{info.county}} </p>
                    </div>
                    <mt-field label="详细"
                        placeholder="具体到门牌号"
                        type="textarea"
                        rows="4"
                        v-model="info.detail"></mt-field>
                    <hr class="hr">
                    <div class="item">
                        <!-- <hr class="line"> -->
                        </hr>
                        <span>默认地址</span>
                        <mt-switch style="float:right;margin-top:5px"
                            v-model="info.isdefault"></mt-switch>
                    </div>

                    <div class="btn-panel">
                        <ButtonBlock class="btn"
                            :enable="true"
                            content="删除"
                            v-if="mode=='edit'"
                            v-on:onClick="onDeleAddress" />
                        <ButtonFill class="btn"
                            :enable="!lockBtn"
                            content="保存"
                            v-on:onClick="onSaveAddress" />
                    </div>

                </div>

            </div>
        </div>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
//引入省市区数据json文件
import threeLevelAddress from "@/assets/json/threeLevelAddress.json";
import {
    getDetail,
    addAddress,
    updateAddress,
    deleteAddress,
} from "@/api/address";
import ButtonFill from "@/components/ButtonFill";
import ButtonBlock from "@/components/ButtonBlock";
import _ from "lodash";
import { MessageBox } from "mint-ui";

export default {
    data() {
        return {
            id: 0,
            mode: "add",
            info: {
                province: "北京市", //省
                city: "北京市", //市
                county: "东城区", //县
                name: "",
                phone: "",
                isdefault: false,
            },
            region: "", //三级地址

            provinceCode: "", //省级代码
            cityCode: "", //市级代码
            countyCode: "", //县级代码

            regionVisible: false, //弹出框是否可见
            regionInit: false, //禁止地区选择器自动初始化，picker组件会默认进行初始化，导致一进入页面就会默认选中一个初始3级地址

            //picker组件插槽
            myAddressSlots: [
                //省
                {
                    flex: 1,
                    values: this.getProvinceArr(), //省份数组
                    className: "slot1",
                    textAlign: "center",
                },
                //分隔符
                {
                    divider: true,
                    content: "",
                    className: "slot2",
                },
                //市
                {
                    flex: 1,
                    values: this.getCityArr("北京市"),
                    className: "slot3",
                    textAlign: "center",
                },
                {
                    divider: true,
                    content: "",
                    className: "slot4",
                },
                //县
                {
                    flex: 1,
                    values: this.getCountyArr("北京市", "北京市"),
                    className: "slot5",
                    textAlign: "center",
                },
            ],
            lockBtn:false
        };
    },
    components: {
        ButtonFill,
        ButtonBlock,
        BarNavigate,
    },
    async mounted() {
        this.id = this.$route.query.id;
        this.mode = this.$route.query.mode;

        if (this.mode === "edit") {
            let data = await getDetail({ id: this.id });
            if (data.res_code > 0) {
                data.data.isdefault = data.data.isdefault == 1;
                this.info = data.data;
            }
        }

        //初始化设备高度为设备高度height 100%
        let orderHeight = window.innerHeight;
        document.getElementById("three_level_address").style.height =
            orderHeight + "px";
    },
    methods: {
        //打开地址选择器
        showAddressPicker() {
            this.regionVisible = true;
        },
        //picker组件的change事件，进行取值赋值
        addressChange(picker, values) {
            if (this.regionInit) {
                if (!values[2]) {
                    values[2] = values[1];
                }
                //取值并赋值
                this.region =
                    values[0]["name"] + values[1]["name"] + values[2]["name"];
                this.info.province = values[0]["name"];
                this.info.city = values[1]["name"];
                this.info.county = values[2]["name"];
                this.provinceCode = values[0]["code"];
                this.cityCode = values[1]["code"];
                this.countyCode = values[2]["code"];

                //给市、县赋值
                picker.setSlotValues(1, this.getCityArr(values[0]["name"]));
                picker.setSlotValues(
                    2,
                    this.getCountyArr(values[0]["name"], values[1]["name"])
                );
            } else {
                this.regionInit = true;
            }
        },
        //遍历json，返回省级对象数组
        getProvinceArr() {
            let provinceArr = [];
            threeLevelAddress.forEach(function (item) {
                let obj = {};
                obj.name = item.name;
                obj.code = item.code;
                provinceArr.push(obj);
            });
            return provinceArr;
        },
        //遍历json，返回市级对象数组
        getCityArr(province) {
            let cityArr = [];
            threeLevelAddress.forEach(function (item) {
                if (item.name === province) {
                    item.children.forEach(function (args) {
                        let obj = {};
                        obj.name = args.name;
                        obj.code = args.code;
                        cityArr.push(obj);
                    });
                }
            });
            return cityArr;
        },
        //遍历json，返回县级对象数组
        getCountyArr(province, city) {
            let countyArr = [];
            threeLevelAddress.forEach(function (item) {
                if (item.name === province) {
                    item.children.forEach(function (args) {
                        if (args.name === city) {
                            args.children.forEach(function (param) {
                                let obj = {};
                                obj.name = param.name;
                                obj.code = param.code;
                                countyArr.push(obj);
                            });
                        }
                    });
                }
            });
            return countyArr;
        },
        async onSaveAddress() {
            this.lockBtn = true;
            let param = _.cloneDeep(this.info);
            param.isdefault = param.isdefault ? 1 : 0;
            let data;
            if (this.mode == "add") {
                data = await addAddress(param);
            } else if (this.mode == "edit") {
                data = await updateAddress(param);
            }
            if (data.res_code > 0) {
                alert(data.msg);
                this.$router.go(-1);
            } else {
                alert(data.msg);
            }
            this.lockBtn = false;
        },
        async onDeleAddress() {
            if (this.mode == "edit") {
                if (localStorage.getItem("os") == "Android") {
                    MessageBox.confirm("确认删除当前收货地址").then(
                        async (action) => {
                            if (action == "confirm") {
                                let data = await deleteAddress({
                                    id: this.info.id,
                                });
                                if (data.res_code > 0) {
                                    alert(data.msg);
                                    this.$router.go(-1);
                                } else {
                                    alert(data.msg);
                                }
                            }
                        }
                    );
                } else {
                    let cresult = confirm("确认删除当前收货地址");
                    if (cresult) {
                        let data = await deleteAddress({
                            id: this.info.id,
                        });
                        if (data.res_code > 0) {
                            alert(data.msg);
                            this.$router.go(-1);
                        } else {
                            alert(data.msg);
                        }
                    }
                }
            }
        },
        onBack() {
            this.$router.go(-1);
        },
    },
};
</script>

<style scoped>
.page {
    position: relative;
}
.nav-back {
    z-index: 999;
}
.page-content {
    padding-top: 40px;
}

ul li {
    list-style: none;
    line-height: 1rem;
    font-size: 0.6rem;
}
.banner img {
    width: 100%;
}
.container h1 {
    color: rgba(51, 51, 51, 1);
    font-size: 0.7rem;
    font-weight: normal;
    padding-left: 1rem;
    line-height: 1.2rem;
    margin-top: 0.5rem;
}
.tab {
    overflow: hidden;
    width: 8.4rem;
    margin: 1.5rem auto 1rem;
}
.tab li {
    width: 4rem;
    height: 1.5rem;
    float: left;
    text-align: center;
    border-radius: 4px 0px 0px 4px;
    border: 1px solid rgba(86, 144, 249, 1);
    color: rgba(86, 144, 249, 1);
    font-size: 0.7rem;
    line-height: 1.5rem;
}
.tab li:nth-child(2) {
    border-radius: 0px 4px 4px 0px;
}
.tab li.active {
    color: #fff;
    background: rgba(86, 144, 249, 1);
}
.line {
    background: #f7f9fb;
    height: 0.5rem;
}
.upload {
    position: relative;
    padding-bottom: 2rem;
}
.upload .add {
    width: 4.3rem;
    display: block;
    margin: 2rem auto 1rem;
}
.upload p {
    text-align: center;
    color: #dcdcdc;
    font-size: 0.7rem;
}
.upload .tip {
    position: absolute;
    right: 0;
    top: -0.5rem;
    font-size: 0.7rem;
    overflow: hidden;
}
.upload .tip span {
    display: block;
    color: #5690f9;
    padding: 0.5rem 1rem 1rem 1rem;
    position: relative;
}
.upload .tip span:nth-child(2) {
    color: #dd1e13;
}
.upload h4 {
    font-size: 0.75rem;
    text-align: center;
    font-weight: normal;
    margin-bottom: 1rem;
}
.upload .receipt {
    padding: 0 1rem;
    line-height: 1.2rem;
    color: #666666;
    text-align: left;
}
.upload h4 span {
    position: relative;
    display: inline-block;
    top: -10px;
    left: 8px;
}
.jiant {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 6px;
    height: 6px;
    border-top: 2px solid #999;
    border-right: 2px solid #999;
    transform: rotate(135deg);
}
.upload h4 span.active .jiant {
    transform: rotate(315deg);
    top: 2px;
}
.verCode button {
    padding: 0.3rem 0.8rem;
    background: #5690f9;
    color: #fff;
    font-size: 0.7rem;
    border-radius: 0.2rem;
    margin-left: 1rem;
    outline: none;
    border: none;
}

.upload .img-avatar {
    border: 2px solid #acc8fb;
    width: 40%;
    display: block;
    margin: 2rem auto 1rem;
}
.upload .addUp .uppic {
    width: 4.3rem;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 50%;
    margin-left: -2.15rem;
    height: 4.3rem;
    opacity: 0;
}
.upload .tip span .uppic {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    z-index: 11;
    opacity: 0;
}
.verCode button.getYzmCode {
    background: #8bb1f6;
}
.verCode button.getYzm {
    background: #5690f9;
}
.invoiceSubmit .citycode .ci {
    position: relative;
    right: 1rem;
    top: -6px;
}

.three-level-address {
    width: 100%;
    text-align: left;
}
.region-div {
    width: 100%;
    /* padding-top: 1rem; */
}
.input-icon {
    display: inline-block;
    vertical-align: middle;
}
.input-icon i {
    font-size: 2rem;
}
.region-div input {
    width: 70%;
    font-size: 1rem;
    line-height: 2rem;
    border-radius: 5px;
    outline: none;
    text-align: right;
    color: black;
}
.region-popup {
    width: 100%;
}

.item {
    position: relative;
    background: #fff;
    text-align: left;
    line-height: 45px;
    padding: 0 10px;
}
.item > .line {
    border: solid 1px #efefef;
    border-width: 1px 0 0 0;
    height: 1px;
    margin-bottom: 5px;
}

.btn-panel {
    text-align: center;
    padding: 20px;
}
.btn-panel .btn {
    display: inline-block;
    width: 100px;
    margin: 10px;
}
.hr {
    border: none;
    border-top: solid 1px transparent;
    margin: 0 10px;
}
</style>