<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="修改密码"
            v-on:onBack="onBack" />
        <div class="page-content">
            <div class="item">
                <span>原始密码: </span>
                <input type="password"
                    class="nickname"
                    v-model="pwd">
            </div>
            <div class="item"
                style="margin-top:10px">
                <span>新密码: </span>
                <input type="password"
                    class="nickname"
                    v-model="npwd1">
            </div>
            <div class="item">
                <span>确认密码: </span>
                <input type="password"
                    class="nickname"
                    v-model="npwd2">
            </div>
            <ButtonBlock class="btn"
                :enable="true"
                fill="fill"
                content="确认修改"
                v-on:onClick="setPwd" />
        </div>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import ButtonBlock from "@/components/ButtonBlock";
import { getCacheUserInfo, clearCacheUserInfo } from "@/utils/token";
import { resetPwd } from "@/api/user";
import _ from "lodash";
import { Toast } from "mint-ui";

export default {
    data() {
        return {
            pwd: "",
            npwd1: "",
            npwd2: "",
            userinfo: {},
        };
    },
    components: { BarNavigate, ButtonBlock },
    async created() {
        this.odata = getCacheUserInfo().userinfo;
        this.userinfo = _.cloneDeep(this.odata);
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },

        async setPwd() {
            if (!this.pwd) {
                Toast({
                    message: "原密码不能为空",
                });
                return;
            }
            if (!this.npwd1 || !this.npwd2) {
                Toast({
                    message: "请输入新密码",
                });
                return;
            }
            if (this.npwd1.length < 6 || this.npwd2.length < 6) {
                Toast({
                    message: "密码长度最小6位",
                });
                return;
            }
            if (this.npwd1 != this.npwd2) {
                Toast({
                    message: "两次密码输入不一致",
                });
                return;
            }
            let data = await resetPwd({
                cur_pwd: this.pwd,
                new_pwd: this.npwd1,
            });
            if (data.res_code > 0) {
                clearCacheUserInfo();
                alert('修改成功,请重新登录');

                this.$router.replace("/login");
            } else {
                Toast({
                    message: data.msg,
                });
            }
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
    padding-top: 50px;
}

.item {
    margin: 0;
    padding: 20px;
    background: #fff;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
.nickname {
    box-sizing: border-box;
    border: none;
    border-bottom: solid 1px #999;
    color: #555;
    flex: 1;
    margin: 0 10px;
    line-height: 2rem;
}

.btn {
    width: 120px;
    margin-top: 30px;
    margin-left: 50%;
    transform: translateX(-50%);
}
</style>