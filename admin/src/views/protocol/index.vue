<template>
    <div class="p-page">
        <div class="ptotocol-name">
            <span>{{name}}</span>

            <el-button class="btn-save"
                type="danger"
                size="mini"
                @click="onUpdateProtocol">
                更新
            </el-button>
        </div>
        <div>
            <tinymce v-model="content"
                :height="400" />
        </div>
        <div class="ptotocol-name">
            <span>协议预览</span>
        </div>
        <div class="editor-content"
            v-html="content" />

    </div>
</template>

<script>
import Tinymce from "@/components/Tinymce";
import { getProtocol, updateProtocol } from "@/api/protocol";

export default {
    name: "ProtocalPage",
    components: { Tinymce },
    data() {
        return {
            pid: 0,
            content: "",
            name: "暂未获取到协议...",
        };
    },
    async created() {
        this.pid = this.$route.meta.pid;
        let data = await getProtocol({
            pid: this.pid,
        });

        if (data.res_code > 0) {
            this.name = data.data.name;
            this.content = data.data.content;
        }
    },
    methods: {
        async onUpdateProtocol() {
            let data = await updateProtocol({
                pid: this.pid,
                content: this.content,
            });
            this.$message({
                message: data.msg,
                type: data.res_code > 0 ? "success" : "danger",
            });
        },
    },
};
</script>

<style scoped>
.p-page {
    padding: 20px;
}
.ptotocol-name {
    margin: 20px;
    text-align: center;
    font-size: 2em;
    font-weight: bold;
    position: relative;
}
.editor-content {
    border: solid 1px #ccc;
    min-height: 300px;
    margin-top: 20px;
}
.btn-save {
    position: fixed;
    right: 20px;
    height: 50px;
    width: 200px;
    height: 40px;
    font-size: 20px;
}
</style>

