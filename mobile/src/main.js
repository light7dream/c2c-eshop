// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

// 使用mint-ui完全引入
// 如果项目打包后太大，可以按需引入
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
Vue.use(MintUI)
import {MessageBox} from 'mint-ui'


/* 手写板 */
import vueEsign from 'vue-esign';
Vue.use(vueEsign);

import SignCanvas from "sign-canvas";
Vue.use(SignCanvas);

// 路由拦截
router.beforeEach((to, from, next) => {
    if (to.meta.needLogin) {
        let tid = localStorage.getItem("tid");
        if (tid) {
            next();
        } else {
            if (localStorage.getItem('os') == 'Android') {
                MessageBox.confirm("当前页面需要登录").then(action => {
                    if (action == 'confirm') {
                        router.push({
                            path: '/login',
                            query: { redirect: router.currentRoute.fullPath }
                        })
                    }
                });
            } else {
                let cresult = confirm("当前页面需要登录.");
                if (cresult) {
                    router.push({
                        path: '/login',
                        query: { redirect: router.currentRoute.fullPath }
                    })
                }
            }
        }
    } else {
        next();
    }
});

// 剪切板功能
import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})
