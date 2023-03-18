
/** When your routing table is too long, you can split it into small modules**/

// const onsaleOrder = import('@/views/onsale/OnsaleOrder');
const onsaleRouter = [
    {
        path: '/onsalelist',
        name: 'OnsaleList',
        component: () => import('@/views/onsale/OnsaleList'),
        meta: {
            needLogin: true //需要加校检判断的路由
        },
    },
    {
        path: '/onsaledetail',
        name: 'OnsaleDetail',
        component: () => import('@/views/onsale/OnsaleDetail'),
        meta: {
            needLogin: true //需要加校检判断的路由
        },
    },
    {
        path: '/onsaleorder',
        name: 'OnsaleOrder',
        component: () => import('@/views/onsale/OnsaleOrder'),
        meta: {
            needLogin: true //需要加校检判断的路由
        },
    },
]

export default onsaleRouter

