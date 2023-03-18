
/** When your routing table is too long, you can split it into small modules**/


const cartRouter = [
    {
        path: '/goodsorder',
        name: 'GoodsOrder',
        component: () => import('@/views/cart/GoodsOrder'),
        meta: {
            needLogin: true //需要加校检判断的路由
        },
    },
]

export default cartRouter

