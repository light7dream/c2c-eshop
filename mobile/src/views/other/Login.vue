<template>
    <div class="page">
        <div class="fixed">
            <BackNavigate title="登录"
                v-on:onBack="onBack" />
        </div>
        <div class="login-panel">
            <img class="logo"
                :src="logoImg" />
            <div class="login-info-panel">
                <div class="login-info">
                    <div class="item">
                        <span>手机号</span>
                        <div class="diy-input">
                            <span>+86</span>
                            <input class="inner-text"
                                type="text"
                                v-model="phone" />
                            <i @click="_clearPhone"
                                class="mintui mintui-close-bold"></i>
                        </div>
                    </div>
                    <div class="item">
                        <span>密码</span>
                        <div class="diy-input">
                            <input id="pwd"
                                class="inner-text"
                                type="password"
                                v-model="pwd" />
                            <span style="opacity: 0">+86</span>
                            <i id="eye"
                                class="mintui mintui-no_eye"
                                @click="_switchPwd"></i>
                        </div>
                    </div>
                    <ButtonFill class="login-btn"
                        :enable="true"
                        content="登录"
                        v-on:onClick="onLogin" />
                    <div class="login-register">
                        <span @click="onJump('立即注册')">立即注册</span>
                        <span> | </span>
                        <span @click="onJump('忘记密码')">忘记密码</span>
                    </div>
                </div>
            </div>
            <div class="login-protocol"
                v-if="false">
                <CheckBox :ischeck="isRead"
                    size="1"
                    v-on:onCheckChange="onCheckChange" />
                <span @click="onJump('用户须知')">《用户须知》</span>
            </div>
        </div>
    </div>
</template>

<script>
import { Toast } from "mint-ui";
import BackNavigate from "@/components/BackNavigate";
import ButtonFill from "@/components/ButtonFill";
import CheckBox from "@/components/CheckBox";
import $ from "jquery";
import { login, updateOpenId } from "@/api/user";
import { setCacheUserInfo } from "@/utils/token";

export default {
    data() {
        return {
            openEye: false,
            isRead: false,
            phone: "",
            pwd: "",
            logoImg:''
        };
    },
    components: {
        BackNavigate,
        ButtonFill,
        CheckBox,
    },
    mounted() {
        this.logoImg = require(`../../assets/img/${process.env.logo}`);
    },
    methods: {
        onBack() {
            if (window.history.length > 1) {
                this.$router.go(-1);
            } else {
                this.$router.replace("/");
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
        async onJump(r) {
            if (r == "立即注册") {
                this.$router.replace("/register");
            } else if (r == "忘记密码") {
                this.$router.push({ path: "/findpwd" });
            } else {
                Toast({
                    message: r,
                    position: "center",
                });
            }
        },
        async onLogin() {
            if (!this.phone || !this._isPhone(this.phone)) {
                Toast({
                    message: "请输入正确手机号",
                    position: "center",
                });
                return;
            } else if (!this.pwd) {
                Toast({
                    message: "请输入密码",
                    position: "center",
                });
                return;
            }
            let openid = localStorage.getItem("openid");
            let data = await login({
                phone: this.phone,
                pwd: this.pwd,
            });
            if (data.res_code > 0) {
                let userInfo = data.data;
                if (!userInfo.open_id || userInfo.open_id == "") {
                    userInfo.open_id = openid;
                    updateOpenId({ openId: openid });
                }
                setCacheUserInfo(userInfo);
                if (window.history.length > 1) {
                    // this.$router.go(-1);
                    this.$router.replace("/");
                } else {
                    this.$router.replace("/");
                }
            } else {
                Toast({
                    message: data.msg,
                    position: "center",
                });
            }
        },
        _isPhone(phone) {
            phone = phone.replace(/\s*/g, ""); //处理空字符串
            let phoneCodeVerification = /^[1][0-9][0-9]{9}$/;
            return phoneCodeVerification.test(phone);
        },
    },
};
</script>

<style scoped>
.page {
    position: relative;
    height: 100vh;
    background: #fff;
}
.fixed {
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;
}

.login-panel {
    padding-top: 40px;
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
    margin: 20px 0 40px 0;
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

.login-btn {
    margin: 30px 10px 0 0;
}

.login-register {
    text-align: center;
    margin-top: 60px;
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