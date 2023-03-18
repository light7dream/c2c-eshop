/** When your routing table is too long, you can split it into small modules**/


const otherRouter = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/other/Login'),
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/other/Register'),
    }, {
        path: '/findpwd',
        name: 'FindPwd',
        component: () => import('@/views/other/FindPwd'),
    },
    {
        path: '/protocol',
        name: 'Protocol',
        component: () => import('@/views/other/Protocol'),
    },
    {
        path: '/sign',
        name: 'Sign',
        component: () => import('@/views/other/Sign'),
        meta: {
            needLogin: true //需要加校检判断的路由
        },
    },
    {
        path: '/protocolonsale',
        name: 'ProtocolOnSale',
        component: () => import('@/views/other/ProtocolOnSale'),
        meta: {
            needLogin: true //需要加校检判断的路由
        },
    },
]

export default otherRouter
