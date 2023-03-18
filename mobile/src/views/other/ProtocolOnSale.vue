<template>
    <div class="page">
        <div class="fixed">
            <BackNavigate :title="name"
                v-on:onBack="onBack" />
        </div>
        <iframe class="protocol-viewer"
            :src="url"
            frameborder="0"></iframe>
        <ButtonFill class="btn"
            :content="text"
            :enable="enable"
            v-on:onClick="onClick" />
    </div>
</template>

<script>
import BackNavigate from "@/components/BackNavigate";
import ButtonFill from "@/components/ButtonFill";
import { updateUserInfo } from "@/api/user";
import { getProtocolBaseUrl } from "@/api/protocol";
const timeout = 30;
export default {
    data() {
        return {
            enable: false,
            baseUrl: "",
            url: "",
            name: "",
            text: "请仔细阅读协议",
            protocols: ["商品上架规范及用户间交易协议", "上架品类资质名录"],
            curStep: 0,
            timer: null,
            tick: timeout,
        };
    },
    components: {
        BackNavigate,
        ButtonFill,
    },
    async mounted() {
        let data = await getProtocolBaseUrl();
        if (data.res_code > 0) {
            this.baseUrl = data.data;
            this.startStep(0);
        } else {
            alert("获取协议失败");
        }
    },
    methods: {
        onBack() {
            this.$router.go(-1);
        },
        async startStep(no) {
            let this_ = this;
            this.name = this.protocols[no];
            this.url = `${this.baseUrl}?protocol=${this.protocols[no]}`;
            clearInterval(this.timer);
            this_.enable = false;
            this.timer = setInterval(() => {
                this_.text = `请仔细阅读协议 ${this_.tick--} s`;
                if (this_.tick < 0) {
                    this_.enable = true;
                    this_.text = "已阅读";
                    clearInterval(this_.timer);
                    this_.tick = timeout;
                }
            }, 1000);
        },
        async onClick() {
            this.curStep++;
            this.text = "请仔细阅读协议";
            if (this.curStep > 1) {
                let data = await updateUserInfo({
                    has_read_protocol: 1,
                });
                if (data.res_code > 0) {
                    this.$router.go(-2);
                } else {
                    alert("协议状态更新失败，请重试");
                }
            } else {
                this.startStep(this.curStep);
            }
        },
    },
};
</script>

<style scoped>
.page {
    position: relative;
    height: 100vh;
}
.fixed {
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;
}

.protocol-viewer {
    box-sizing: border-box;
    margin-top: 30px;
    padding: 10px;
    height: calc(100vh - 100px);
    width: 100%;
}

.btn {
    position: absolute;
    bottom: 20px;
    width: 220px;
    left: 50%;
    transform: translateX(-50%);
}
</style>