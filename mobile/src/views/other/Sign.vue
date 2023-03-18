<template>
    <div class="sign-panel">
        <div class="sign-panel-btn">
            <ButtonFill class="rotate-btn"
                :enable="true"
                v-on:onClick="onBack"
                content="返回" />
            <div class="btn-handle">
                <ButtonFill class="rotate-btn"
                    :enable="true"
                    v-on:onClick="handleReset"
                    content="重新签名" />
                <ButtonFill class="rotate-btn"
                    :enable="true"
                    v-on:onClick="handleGenerate"
                    content="确认" />
            </div>
        </div>
        <div class="sign-area">
            <sign-canvas class="sign-canvas"
                ref="SignCanvas"
                :options="options"
                v-model="value" />
        </div>
    </div>
</template>

<script>
import ButtonFill from "@/components/ButtonFill";
import ButtonBlock from "@/components/ButtonBlock";
import { uplaodImage } from "@/utils/oss";
import { getUploadAuth } from "@/api/oss";
import { updateUserInfo } from "@/api/user";
export default {
    data() {
        return {
            value: null,
            clipValue: null,
            options: {
                isDpr: false, //是否使用dpr兼容高倍屏 [Boolean] 可选
                lastWriteSpeed: 1, //书写速度 [Number] 可选
                lastWriteWidth: 2, //下笔的宽度 [Number] 可选
                lineCap: "round", //线条的边缘类型 [butt]平直的边缘 [round]圆形线帽 [square]	正方形线帽
                lineJoin: "bevel", //线条交汇时边角的类型  [bevel]创建斜角 [round]创建圆角 [miter]创建尖角。
                canvasWidth: 260, //canvas宽高 [Number] 可选
                canvasHeight: 530, //高度  [Number] 可选
                isShowBorder: true, //是否显示边框 [可选]
                bgColor: "transparnent", //背景色 [String] 可选
                borderWidth: 1, // 网格线宽度  [Number] 可选
                borderColor: "transparent", //网格颜色  [String] 可选
                writeWidth: 5, //基础轨迹宽度  [Number] 可选
                maxWriteWidth: 30, // 写字模式最大线宽  [Number] 可选
                minWriteWidth: 5, // 写字模式最小线宽  [Number] 可选
                writeColor: "#101010", // 轨迹颜色  [String] 可选
                isSign: true, //签名模式 [Boolean] 默认为非签名模式,有线框, 当设置为true的时候没有任何线框
                imgType: "png", //下载的图片格式  [String] 可选为 jpeg  canvas本是透明背景的
            },
        };
    },
    components: { ButtonFill, ButtonBlock },
    created() {},
    mounted() {
        this.initSignArea();
    },
    methods: {
        // 初始化签名区
        initSignArea() {
            let width = document.documentElement.clientWidth;
            let height = document.documentElement.clientHeight;

            this.options.canvasWidth = width - 80;
            this.options.canvasHeight = height - 20;
        },
        onBack() {
            this.$router.go(-1);
        },
        handleReset() {
            this.$refs.SignCanvas.canvasClear();
        },
        async handleGenerate() {
            let this_ = this;
            this.value = this.$refs.SignCanvas.saveAsImg();
            this.ClippingImage(this.value, async (clipData) => {
                function toBlob(urlData, fileType) {
                    let bytes = window.atob(urlData);
                    let n = bytes.length;
                    let u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bytes.charCodeAt(n);
                    }
                    return new Blob([u8arr], { type: fileType });
                }

                let base64 = clipData.split(",").pop();
                let fileType = clipData.split(";").shift().split(":").pop();
                let blob = toBlob(base64, fileType);
                let reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = async function (event) {
                    function toBuffer(ab) {
                        var buf = new Buffer(ab.byteLength);
                        var view = new Uint8Array(ab);
                        for (var i = 0; i < buf.length; ++i) {
                            buf[i] = view[i];
                        }
                        return buf;
                    }

                    let buffer = toBuffer(event.target.result);
                    let res = await getUploadAuth({ authType: "sign" });
                    let sts = res.data;
                    let result = await uplaodImage(buffer, sts);
                    console.log(result);
                    if (result && result.res.status == 200) {
                        let data = await updateUserInfo({ sign: result.url });
                        if (data.res_code > 0) {
                            this_.$router.go(-1);
                        } else {
                            alert("提交签名失败");
                        }
                    } else {
                        alert("上传签名失败");
                    }
                };
            });
        },
        ClippingImage(base64Codes, callback) {
            let this_ = this;
            let img = new Image();
            img.src = base64Codes;
            //生成canvas
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            let createw = document.createAttribute("width");
            let createh = document.createAttribute("height");
            let imgW = img.width;
            let imgH = img.height;
            let size = imgW > imgH ? imgW : imgH;
            createw.nodeValue = size;
            createh.nodeValue = size;
            canvas.setAttributeNode(createh);
            canvas.setAttributeNode(createw);
            img.onload = function () {
                ctx.rotate((270 * Math.PI) / 180);
                ctx.translate(-size, 0);
                ctx.drawImage(img, 0, 0);
                let imgData = ctx.getImageData(0, 0, size, size);
                let data = this_._getBound(imgData.data, size, size);

                let crop_canvas = document.createElement("canvas");
                let crop_ctx = crop_canvas.getContext("2d");
                crop_canvas.width = data[2] - data[0];
                crop_canvas.height = data[3] - data[1];
                let crop_imgData = ctx.getImageData(...data);
                crop_ctx.globalCompositeOperation = "destination-over";
                crop_ctx.putImageData(crop_imgData, 0, 0);
                crop_ctx.fillStyle = "transparent";
                crop_ctx.fillRect(0, 0, crop_canvas.width, crop_canvas.height);
                let resultImg = crop_canvas.toDataURL();
                callback(resultImg);
            };
        },
        _getBound(imgData, width, height) {
            let topX = width;
            let btmX = 0;
            let topY = height;
            let btmY = 0;
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    let pos = (i + width * j) * 4;
                    if (
                        imgData[pos] > 0 ||
                        imgData[pos + 1] > 0 ||
                        imgData[pos + 2] ||
                        imgData[pos + 3] > 0
                    ) {
                        btmY = Math.max(j, btmY);
                        btmX = Math.max(i, btmX);
                        topY = Math.min(j, topY);
                        topX = Math.min(i, topX);
                    }
                }
            }
            topX++;
            btmX++;
            topY++;
            btmY++;
            let data = [topX, topY, btmX, btmY];
            return data;
        },
    },
};
</script>

<style scoped>
.sign-panel {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    background: #555;
}
.sign-panel > .sign-panel-btn {
    position: relative;
    width: 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.rotate-btn {
    position: absolute;
    width: 100px;
    height: 30px;
    margin: 20px;
    transform: rotate(90deg);
    transform-origin: 15px 15px;
}
.sign-panel > .sign-panel-btn > .btn-handle > .rotate-btn:nth-child(1) {
    bottom: 200px;
}
.sign-panel > .sign-panel-btn > .btn-handle > .rotate-btn:nth-child(2) {
    bottom: 70px;
}

.sign-panel > .sign-area {
    flex: 1;
    margin: 10px 10px 10px 0;
    border-radius: 10px;
    background: #eee;
}

.img-container {
    background: #eee;
    margin: 10px;
    padding: 10px;
    border-radius: 10px;
}
.img-container > img {
    padding: 1px;
}
</style>
