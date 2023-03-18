<template>
    <div class="page">
        <div class="fixed">
            <BackNavigate title="注册"
                v-on:onBack="onBack" />
        </div>
        <div class="login-panel">
            <img class="logo"
                :src="logoImg" />
            <div class="login-info-panel">
                <div class="login-info">
                    <div class="item">
                        <span>昵称</span>
                        <div class="diy-input">
                            <input type="text"
                                class="inner-text"
                                v-model="nickname" />
                            <span style="opacity: 0">+86</span>
                            <i @click="_clearNickName"
                                class="mintui mintui-close-bold"></i>
                        </div>
                    </div>
                    <div class="item">
                        <span>手机号</span>
                        <div class="diy-input">
                            <span>+86</span>
                            <input type="text"
                                class="inner-text"
                                v-model="phone" />
                            <i @click="_clearPhone"
                                class="mintui mintui-close-bold"></i>
                        </div>
                    </div>
                    <div class="item">
                        <span>密码</span>
                        <div class="diy-input">
                            <input id="pwd"
                                type="password"
                                class="inner-text"
                                v-model="pwd" />
                            <span style="opacity: 0">+86</span>
                            <i id="eye"
                                class="mintui mintui-no_eye"
                                @click="_switchPwd"></i>
                        </div>
                    </div>
                    <div class="item">
                        <span>验证码</span>
                        <div class="diy-input">
                            <input type="sms-code"
                                class="inner-text"
                                v-model="sms_code" />
                            <span style="opacity: 0">+86</span>
                            <i id="eye"
                                style="opacity: 0"
                                class="mintui mintui-no_eye"
                                @click="_switchPwd"></i>
                        </div>
                    </div>
                    <div>
                        <ButtonBlock class="sms-btn"
                            :content="sms_btn_str"
                            :enable="sms_btn_enable"
                            v-on:onClick="sendSMSCode" />
                        <ButtonFill class="register-btn"
                            :enable="!lockBtn"
                            content="注册"
                            v-on:onClick="onRegister" />
                    </div>
                    <div style="text-align: center; padding-top: 20px"
                        v-if="rid > 0">
                        <img style="width: 40px; height: 40px"
                            :src="_getAvatar(ravatar)" />
                    </div>
                    <p class="recomender"
                        v-if="rid > 0">{{ rname }}</p>
                </div>
            </div>
            <div class="login-protocol">
                <CheckBox :ischeck="isRead"
                    size="1"
                    v-on:onCheckChange="onCheckChange" />
                请仔细阅读<span @click="onJump('用户须知')">《用户须知》</span>相关协议
            </div>
        </div>
    </div>
</template>

<script>
import { Toast } from "mint-ui";
import BackNavigate from "@/components/BackNavigate";
import ButtonFill from "@/components/ButtonFill";
import ButtonBlock from "@/components/ButtonBlock";
import CheckBox from "@/components/CheckBox";
import $ from "jquery";
import {
    register,
    getCodeByRegister,
    whoIsRecommender,
    checkInfo,
} from "@/api/user";
import { getProtocolBaseUrl } from "@/api/protocol";

const tick = 60;
export default {
    data() {
        return {
            openEye: false,
            isRead: false,
            phone: "",
            pwd: "",
            nickname: "",
            sms_code: "",
            openid: "",
            sms_btn_str: "发送验证码",
            sms_btn_time: tick,
            sms_btn_timer: null,
            sms_btn_enable: true,
            rid: 0,
            rname: "无",
            rphone: "",
            ravatar: "",
            lockBtn: false,
            logoImg:''
        };
    },
    components: {
        BackNavigate,
        ButtonFill,
        ButtonBlock,
        CheckBox,
    },
    async mounted() {
        this.logoImg = require(`../../assets/img/${process.env.logo}`);
        this.openid = localStorage.getItem("openid");
        let register = sessionStorage.getItem("register");
        if (register) {
            register = JSON.parse(register);
            this.isRead = register.isRead;
            this.phone = register.phone;
            this.pwd = register.pwd;
            this.nickname = register.nickname;
            this.sms_code = register.sms_code;
        }
        if (this.$route.query && this.$route.query.rid) {
            let tmp = this.$route.query.rid;
            let data = await whoIsRecommender({
                rid: tmp,
            });

            if (data.res_code > 0) {
                this.rid = data.data.rid;
                this.ravatar = data.data.ravatar;
                this.rname = data.data.rname;
                this.rphone = data.data.rphone;
            }
        }
    },
    methods: {
        onBack() {
            if (window.history.length <= 1) {
                this.$router.replace("/");
            } else {
                this.$router.go(-1);
            }
        },
        onCheckChange(ck) {
            this.isRead = ck;
        },
        _switchPwd() {
            //显示隐藏对应的switchPwd()方法:
            let $eye = $("#eye");
            let $pwd = $("#pwd");
            if ($eye.hasClass("mintui-no_eye")) {
                $eye.removeClass("mintui-no_eye").addClass("mintui-eye"); //密码可见
                $pwd.prop("type", "text");
            } else {
                $eye.removeClass("mintui-eye").addClass("mintui-no_eye"); //密码不可见
                $pwd.prop("type", "password");
            }
        },
        _clearPhone() {
            this.phone = "";
            this.pwd = "";
        },
        _clearNickName() {
            this.nickname = "";
        },
        async onJump(r) {
            let data = await getProtocolBaseUrl();
            if (data.res_code > 0) {
                sessionStorage.setItem(
                    "register",
                    JSON.stringify({
                        isRead: this.isRead,
                        phone: this.phone,
                        pwd: this.pwd,
                        nickname: this.nickname,
                        sms_code: this.sms_code,
                        openid: this.openid,
                    })
                );
                this.$router.push({
                    path: "/protocol",
                    query: {
                        name: "协议",
                        protocol: "用户须知",
                        base_url: data.data,
                    },
                });
            }
        },
        async onRegister() {
            let this_ = this;
            if (!this.isRead) {
                Toast({
                    message: "请阅读并勾选页面协议",
                    position: "center",
                });
                return;
            }

            if (!this.nickname) {
                Toast({
                    message: "请输入昵称",
                    position: "center",
                });
                return;
            }

            if (!this.checkNickname(this.nickname)) {
                Toast({
                    message: "昵称不能使用特殊字符",
                    position: "center",
                });
                return;
            }

            if (!this.phone || !this._isPhone(this.phone)) {
                Toast({
                    message: "请输入正确手机号",
                    position: "center",
                });
                return;
            }

            if (!this.pwd) {
                Toast({
                    message: "请输入密码",
                    position: "center",
                });
                return;
            }

            this.lockBtn = true;
            let cdata = await checkInfo({
                nickname: this.nickname,
                phone: this.phone,
                openid: this.openid,
            });

            if (!(cdata.res_code > 0)) {
                Toast({
                    message: cdata.msg,
                });
                this.lockBtn = false;
                return;
            }

            let data = await register({
                nickname: this.nickname,
                phone: this.phone,
                pwd: this.pwd,
                sms_code: this.sms_code,
                rid: this.rid,
                open_id: this.open_id,
            });
            if (data.res_code > 0) {
                alert("注册成功返回登录");
                sessionStorage.removeItem("register");
                this_.$router.replace("/login");
                this.lockBtn = false;
            } else {
                Toast({
                    message: data.msg,
                    position: "center",
                });
            }
            this.lockBtn = false;
        },
        checkNickname(name) {
            var reg = /^[\w\u4e00-\u9fa5]{1,12}$/;
            return reg.test(name);
        },
        async sendSMSCode() {
            if (!this.isRead) {
                Toast({
                    message: "请阅读并勾选页面协议",
                    position: "center",
                });
                return;
            }

            if (!this.phone || !this._isPhone(this.phone)) {
                Toast({
                    message: "请输入正确手机号",
                    position: "center",
                });
                return;
            }
            let r = this.checkNickname(this.nickname);

            if (!r) {
                Toast({
                    message: "昵称不能使用特殊字符,位数1-12",
                    position: "center",
                });
                return;
            }

            let cdata = await checkInfo({
                nickname: this.nickname,
                phone: this.phone,
            });

            if (!(cdata.res_code > 0)) {
                Toast({
                    message: cdata.msg,
                });
                return;
            }

            let this_ = this;
            this_.sms_btn_enable = false;
            this.sms_btn_timer = setInterval(() => {
                if (this_.sms_btn_time > 0) {
                    this_.sms_btn_enable = false;
                    this_.sms_btn_str = `重新发送(${this_.sms_btn_time}s)`;
                    this_.sms_btn_time--;
                } else {
                    this_.sms_btn_time = tick;
                    this_.sms_btn_enable = true;
                    this_.sms_btn_str = "重新发送";
                    clearInterval(this.sms_btn_timer);
                }
            }, 1000);

            let data = await getCodeByRegister({
                phone: this.phone,
            });
            Toast({
                message: data.msg,
                position: "center",
            });
        },
        _isPhone(phone) {
            phone = phone.replace(/\s*/g, ""); //处理空字符串
            let phoneCodeVerification = /^[1][0-9][0-9]{9}$/;
            return phoneCodeVerification.test(phone);
        },
        _getAvatar(avatar) {
            if (avatar) {
                return avatar;
            }
            return require("../../assets/img/user.png");
        },
    },
    beforeDestroy() {},
};
</script>

<style scoped>
.page {
    position: relative;
}
.fixed {
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;
}

.login-panel {
    padding-top: 40px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow-y: auto;
    background: #fff;
}
.login-panel > .logo {
    width: 50vw;
    height: 50vw;
    margin: 20px 0 20px 0;
    /* border: solid 1px #ececec; */
    transform: translateX(-4%);
}
.login-panel > .login-info-panel {
    text-align: center;
}
.login-info > .item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
}
.login-info > .item input {
    outline-style: none;
    background: transparent;
    border-width: 0;
    color: #999;
    padding: 5px 0;
}
.login-info > .item > .diy-input {
    border: solid #999;
    color: #999;
    border-width: 0 0 1px 0;
    margin: 10px;
    padding: 0 3px;
    /* background: #0005; */
}

.register-btn,
.sms-btn {
    margin: 10px;
    margin-top: 20px;
}

.recomender {
    font-weight: bold;
    text-align: center;
    margin-top: 20px;
    color: #eb3614;
    /* color: #222; */
}

.login-register {
    text-align: center;
    margin-top: 20px;
}

.login-register > span:nth-child(n + 2) {
    opacity: 0.5;
}

.login-panel > .login-protocol {
    margin: 20px;
    text-align: center;
}

.inner-text {
    font-size: 1em;
    width: calc(100vw / 2);
}
</style>