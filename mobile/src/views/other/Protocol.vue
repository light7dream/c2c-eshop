<template>
    <div class="page">
        <div class="fixed">
            <BackNavigate :title="name"
                v-on:onBack="onBack" />
        </div>
        <iframe class="protocol-viewer"
            :src="url"
            frameborder="0"></iframe>
    </div>
</template>

<script>
import BackNavigate from "@/components/BackNavigate";

export default {
    data() {
        return {
            url: "",
            name: "",
        };
    },
    components: {
        BackNavigate,
    },
    mounted() {
        let protocol = this.$route.query.protocol;
        this.name = this.$route.query.name;
        this.url = `${this.$route.query.base_url}?protocol=${protocol}`;
    },
    methods: {
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
    height: calc(100vh - 50px);
    width: 100%;
}
</style>