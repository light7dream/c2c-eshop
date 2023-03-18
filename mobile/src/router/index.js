import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/views/MainPage'

Vue.use(Router)


import otherRouter from './modules/other'
import myRouter from './modules/my'
import homeRouter from './modules/home'
import onsaleRouter from './modules/onsale'
import cartRouter from './modules/cart'

export default new Router({
    routes: [
        {
            path: '/',
            name: 'MainPage',
            component: MainPage
        },
        ...otherRouter,
        ...myRouter,
        ...homeRouter,
        ...onsaleRouter,
        ...cartRouter
    ],
    mode:"history",
    base: '/',
})
