<template>
    <div class="bar-text">
        {{text}}
    </div>
</template>
<script>
export default {
    props: ["text"],
    data() {
        return {};
    }
};
</script>

<style scoped>
.bar-text {
    width: 100%;
    line-height: 40px;
    text-align: center;
    color: #222;
    background: #fff;
    position: fixed;
    top: 0;
    z-index: 999;
}
</style>