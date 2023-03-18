import axios from 'axios';
import router from '@/router/index';
import {
    getCacheUserInfo,
    clearCacheUserInfo,
} from "@/utils/token";
import {MessageBox} from 'mint-ui'

// 携带cookie
axios.defaults.withCredentials = true;

let baseURL = '/';
// create an axios instance
const service = axios.create({
    baseURL: baseURL, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 5*60*1000 // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent

        // if (store.getters.token) {
        //     // let each request carry token
        //     // ['X-Token'] is a custom headers key
        //     // please modify it according to the actual situation
        //     config.headers['X-Token'] = getToken()
        // }
        let uinfo = getCacheUserInfo();
        let tid = uinfo.tid;
        if (config.data) {
            if (typeof (config.data) == 'string') {

            } else {
                config.data.token = tid;
            }
        } else {
            config.data = { token: tid };
        }
        if (tid) {
            // let each request carry token
            // ['X-Token'] is a custom headers key
            // please modify it according to the actual situation
            config.headers['tid'] = tid
        }
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
    */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        const res = response.data
        if (res.res_code <= -900) {
            if (router.currentRoute.name != "MainPage") {
                clearCacheUserInfo();

                if (localStorage.getItem('os') == 'Android') {
                    MessageBox.confirm(`${res.msg}.是否跳转登录?`).then(action => {
                        if (action == 'confirm') {
                            router.push({
                                path: '/login',
                                query: { redirect: router.currentRoute.fullPath }
                            })
                        }
                    });
                } else {
                    let cresult = confirm(`${res.msg}.是否跳转登录?`);
                    if (cresult) {
                        router.push({
                            path: '/login',
                            query: { redirect: router.currentRoute.fullPath }
                        })
                    }
                }
            }
        } else {
            return res;
        }
    },
    error => {
        // console.log('err' + error) // for debug
        // Message({
        //     message: error.message,
        //     type: 'error',
        //     duration: 5 * 1000
        // })
        return Promise.reject(error)
    }
)

export default service
