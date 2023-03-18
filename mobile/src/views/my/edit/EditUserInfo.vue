<template>
    <div class="page">
        <BarNavigate class="nav-back"
            title="用户信息"
            v-on:onBack="onBack"
            righttitle="修改密码"
            v-on:onRightClick="resetPwd" />
        <div class="page-content">
            <div class="item">
                <div>
                    <img class="img"
                        :src="_getUserImg(userinfo.avatar)">
                </div>
                <div style="flex:1;padding-left:20px">
                    <span class="innertext"
                        style="font-size:1.1rem;color:#555">{{odata.nickname}}</span>
                </div>
                <ButtonMini class="btn"
                    fill="fill"
                    content="选择头像"
                    v-on:onClick="onSelectImg" />

            </div>

            <div class="item">
                <p>手机号: <span class="innertext">{{userinfo.phone}}</span></p>
            </div>

            <div class="item">
                <span>昵称: </span>
                <input type="text"
                    class="nickname"
                    v-model="userinfo.nickname">
                <ButtonMini class="btn"
                    fill="fill"
                    :enable="odata.nickname != userinfo.nickname"
                    content="保存"
                    v-on:onClick="onEditNickname" />
            </div>
            <div class="item">
                <p>注册时间: <span class="innertext">{{userinfo.create_time}}</span></p>
            </div>
            <div class="item">
                <p>登录时间: <span class="innertext">{{userinfo.last_login_time}}</span></p>
            </div>
            <input type="file"
                id="avatarSelector"
                name="image"
                accept="image/*"
                class="getImgUrl_file"
                @change="preview($event)">
        </div>
    </div>
</template>

<script>
import BarNavigate from "@/components/BarNavigate";
import ButtonMini from "@/components/ButtonMini";
import ButtonBlock from "@/components/ButtonBlock";
import { getUploadAuth } from "@/api/oss";
import { uplaodImage } from "@/utils/oss";
import { setCacheUserInfo, getCacheUserInfo } from "@/utils/token";
import { editNickname, getInfo, editAvatar } from "@/api/user";
import { Toast } from "mint-ui";
import _ from "lodash";

export default {
    data() {
        return {
            odata: {},
            userinfo: {},
        };
    },
    components: { BarNavigate, ButtonMini, ButtonBlock },
    async created() {
        this.odata = getCacheUserInfo().userinfo;
        this.userinfo = _.cloneDeep(this.odata);
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        _getUserImg(img) {
            if (img) {
                return img;
            }
            return require("../../../assets/img/user.png");
        },
        async refreshInfo() {
            let data = await getInfo();
            if (data.res_code > 0) {
                this.userinfo = data.data;
                setCacheUserInfo(data.data);
                this.odata = getCacheUserInfo().userinfo;
                this.userinfo = _.cloneDeep(this.odata);
                if (this.userinfo.avatar) {
                    this.userinfo.avatar += `?${new Date().getTime()}`;
                }
            }
        },
        async onEditNickname() {
            if (this.userinfo == null || this.userinfo.nickname == null) {
                Toast({
                    messsage: "昵称不能为空",
                });
                return;
            }
            this.userinfo.nickname = this.userinfo.nickname.replace(/\s*/g, "");
            if (this.userinfo.nickname == "") {
                Toast({
                    messsage: "昵称不能为空",
                });
                return;
            }
            let data = await editNickname({
                nickname: this.userinfo.nickname,
            });

            if (data.res_code > 0) {
                this.refreshInfo();
            }
            Toast({
                message: data.msg,
            });
        },
        onSelectImg() {
            document.getElementById("avatarSelector").click();
        },
        async preview(event) {
            let files = document.getElementById("avatarSelector").files[0];

            let isJPG =
                files.type === "image/jpeg" || files.type === "image/png";
            const isLt20M = files.size / 1024 / 1024 < 20;

            if (!isJPG) {
                Toast({
                    message: "上传头像图片只能是 JPG 或 PNG 格式!",
                });
                return;
            }
            if (!isLt20M) {
                Toast({
                    message: "上传头像图片大小不能超过 20MB!",
                });
                return;
            }

            let res = await getUploadAuth({
                authType: "user-avatar",
            });
            console.log(res);
            if (res.success) {
                let sts = res.data;

                let result = await uplaodImage(files, sts);
                if (result && result.res.status == 200) {
                    let data = await editAvatar({
                        avatar: result.url,
                    });
                    Toast({
                        message: data.msg,
                    });
                    if (data.res_code > 0) {
                        this.refreshInfo();
                    }
                } else {
                    Toast({
                        message: "上传失败",
                    });
                }
            } else {
                Toast({
                    message: "获取上传参数失败",
                });
            }
        },
        resetPwd() {
            this.$router.push({ path: "/editpwd" });
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

.item {
    margin: 10px 0;
    padding: 10px;
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
.img-header {
    flex: 1;
}
.img {
    width: 50px;
    height: 50px;
    object-fit: cover;
}
.btn {
    width: 80px;
}
.pwd-btn {
    width: 120px;
    margin-top: 30px;
    margin-left: 50%;
    transform: translateX(-50%);
}

#avatarSelector {
    display: none;
}
.innertext {
    font-size: 0.9rem;
    color: #999;
}
</style>