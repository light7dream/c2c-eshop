<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { getopenid,updateOpenId } from "@/api/user";

export default {
  name: "App",
  mounted() {
    if (/(Android)/i.test(navigator.userAgent)) {
        localStorage.setItem('os','Android');
    }
  },
  methods: {
    onPage(value) {
      this.selected = value;
    },
  },
};
</script>

<style>
#app {
  /* font-family: "Avenir", Helvetica, Arial, sans-serif; */
  font-family: "Microsoft Yahei UI";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* height: 100%; */
  /* background-color: #2c3e50; */
  background-color: #efefef;
}
</style>
