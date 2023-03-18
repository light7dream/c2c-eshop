
/** When your routing table is too long, you can split it into small modules**/


const homeRouter = [
    {
        path: '/gooddetail',
        name: 'Gooddetail',
        component: () => import('@/views/home/Gooddetail'),
        meta: {
            needLogin: true //需要加校检判断的路由
        },
    },
    {
        path: '/preorder',
        name: 'PreOrder',
        component: () => import('@/views/home/PreOrder'),
        meta: {
            needLogin: true //需要加校检判断的路由
        },
    },
]

export default homeRouter

