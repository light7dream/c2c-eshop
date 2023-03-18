<template>
    <div class="page">
        <div class="fixed">
            <BackNavigate title="我的邀请二维码"
                v-on:onBack="onBack" />
        </div>

        <div class="img-header">
            <div id="qr"
                class="wrap">
                <img class="img"
                    :src="userinfo.qrcode" />
                <img class="avatar"
                    :src="_getAvatar(userinfo.avatar)">
            </div>
        </div>

        <p style="font-size:1.3rem">{{userinfo.nickname}}</p>
        <p style="margin-top:40px;color:#c6c6c6">请直接截屏保存二维码</p>

    </div>
</template>

<script>
import ButtonBlock from "@/components/ButtonBlock";
import ButtonFill from "@/components/ButtonFill";
import BackNavigate from "@/components/BackNavigate";
import html2canvas from "html2canvas";
export default {
    data() {
        return {
            userinfo: {},
            url: null,
        };
    },
    components: {
        BackNavigate,
        ButtonBlock,
        ButtonFill,
    },
    async created() {
        let uinfo = localStorage.getItem("userinfo");

        if (uinfo) {
            this.userinfo = JSON.parse(uinfo);
        }
    },
    async mounted() {
        this.changeImg();
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        _getAvatar(avatar) {
            if (avatar) {
                return `${avatar}?${new Date().getTime()}`;
            }
            return require("../../assets/img/user.png");
        },
        changeImg() {
            html2canvas(document.getElementById("qr"), {
                backgroundColor: "transparent",
                allowTaint: true,
                useCORS: true,
            }).then((canvas) => {
                this.url = canvas.toDataURL();
            });
        },
    },
};
</script>

<style scoped>
.page {
    position: relative;
    text-align: center;
    padding-top: 10px;
}
.fixed {
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;
}
.img-header {
    box-sizing: border-box;
    margin-top: 50px;
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 100%;
    text-align: center;
}
.img-header > .wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.img-header > .wrap > .img {
    position: absolute;
    top: 5%;
    left: 5%;
    width: 90%;
    height: 90%;
    object-fit: cover;
}
.img-header > .wrap > .avatar {
    position: absolute;
    top: 40%;
    left: 40%;
    width: 20%;
    height: 20%;
    border: solid 4px white;
    border-radius: 10px;
    object-fit: cover;
    background: #fff;
}
.img-header > .face {
    position: absolute;
    top: 5%;
    left: 5%;
    width: 90%;
    height: 90%;
    object-fit: cover;
    background: #fff;
}

.btn-back {
    margin: 30px 20px;
}
</style>