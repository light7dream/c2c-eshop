<template>
    <div class="page">
        <div class="fixed">
            <BackNavigate title="找回密码"
                v-on:onBack="onBack" />
        </div>
        <div class="login-panel">
            <div class="login-info-panel">
                <div class="login-info">
                    <div class="item">
                        <span>手机号</span>
                        <div class="diy-input">
                            <span>+86</span>
                            <input type="text"
                                v-model="phone">
                            <i @click="_clearPhone"
                                class="mintui mintui-close-bold"></i>
                        </div>
                    </div>
                    <div class="item">
                        <span>新密码</span>
                        <div class="diy-input">
                            <input id="pwd"
                                type="password"
                                v-model="pwd">
                            <span style="opacity:0;">+86</span>
                            <i id="eye"
                                class="mintui mintui-no_eye"
                                @click="_switchPwd"></i>
                        </div>
                    </div>
                    <div class="item">
                        <span>验证码</span>
                        <div class="diy-input">
                            <input type="sms-code"
                                v-model="sms_code">
                            <span style="opacity:0;">+86</span>
                            <i id="eye"
                                style="opacity:0;"
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
                            :enable="true"
                            content="确认"
                            v-on:onClick="onFindPwd" />
                    </div>
                    <div class="login-register">
                        <span @click="onJump('立即注册')">立即注册</span>
                    </div>
                </div>
            </div>
            <div class="login-protocol"
                v-if="false">
                <CheckBox :ischeck="isRead"
                    size="1"
                    v-on:onCheckChange="onCheckChange" />
                <span @click="onJump('《用户协议》')">《用户协议》</span>
                <span>和</span>
                <span @click="onJump('《隐私协议》')">《隐私协议》</span>
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
import { resetPwdSmsCode, getCodeByFindPwd } from "@/api/user";

const tick = 10;
export default {
    data() {
        return {
            openEye: false,
            isRead: false,
            phone: "",
            pwd: "",
            sms_code: "",
            sms_btn_str: "发送验证码",
            sms_btn_time: tick,
            sms_btn_timer: null,
            sms_btn_enable: true,
        };
    },
    components: {
        BackNavigate,
        ButtonFill,
        ButtonBlock,
        CheckBox,
    },
    mounted() {},
    methods: {
        onBack() {
            this.$router.go(-1);
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
        onJump() {
            this.$router.replace({ path: "/register" });
        },
        async onFindPwd() {
            let this_ = this;
            if (!this.phone || !this._isPhone(this.phone)) {
                Toast({
                    message: "请输入正确手机号",
                    position: "center",
                });
                return;
            } else if (!this.pwd) {
                Toast({
                    message: "请输入新密码",
                    position: "center",
                });
                return;
            }
            let data = await resetPwdSmsCode({
                phone: this.phone,
                new_pwd: this.pwd,
                sms_code: this.sms_code,
            });
            if (data.res_code > 0) {
                alert("密码重置成功,请重新登录");
                this_.$router.go(-1);
            } else {
                Toast({
                    message: data.msg,
                    position: "center",
                });
            }
        },
        async sendSMSCode() {
            if (!this.phone || !this._isPhone(this.phone)) {
                Toast({
                    message: "请输入正确手机号",
                    position: "center",
                });
                return;
            }
            let this_ = this;
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

            let data = await getCodeByFindPwd({
                phone: this.phone,
            });
            console.log(data);
            if (data.res_code > 0) {
                // TODO 上线后替换掉
                this.sms_code = data.data;
            } else {
                Toast({
                    message: data.msg,
                    position: "center",
                });
            }
        },
        _isPhone(phone) {
            let phoneCodeVerification = /^[1][0-9][0-9]{9}$/;
            return phoneCodeVerification.test(phone);
        },
    },
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
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
.login-panel > .login-info-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
</style>
