/** When your routing table is too long, you can split it into small modules**/


const myRouter = [
    {
        path: '/mygoodslist',
        name: 'MyFavGoods',
        component: () => import('@/views/my/MyFavGoods'),
    },
    {
        path: "/mybankcard",
        name: 'Mybankcard',
        component: () => import('@/views/my/Mybankcard')
    },
    {
        path: '/addresslist',
        name: 'Myaddress',
        component: () => import('@/views/my/Myaddress')
    },
    {
        path: '/payImg',
        name: 'payImg',
        component: () => import('@/views/other/payImg')
    },
    {
        path: '/myqrcode',
        name: 'MyQrCode',
        component: () => import('@/views/my/MyQrCode')
    },
    {
        path: '/addresssetting',
        name: 'Myaddresssetting',
        component: () => import('@/views/my/Myaddresssetting')
    },
    {
        path: '/mycoupon',
        name: 'MyCoupon',
        component: () => import('@/views/my/MyCoupon')
    },
    {
        path: '/imbuyer',
        name: 'ImBuyerList',
        component: () => import('@/views/my/ImBuyerList')
    },
    {
        path: '/imsaler',
        name: 'ImSalerList',
        component: () => import('@/views/my/ImSalerList')
    },
    {
        path: '/dis',
        name: 'DistributionCenter',
        component: () => import('@/views/my/DistributionCenter')
    },
    {
        path: '/myorderincome',
        name: 'MyOrderImcome',
        component: () => import('@/views/my/MyOrderImcome')
    },
    {
        path: '/incomelist',
        name: 'ImcomeRecord',
        component: () => import('@/views/my/distribution/ImcomeRecord')
    },
    {
        path: '/withdwawrecord',
        name: 'WithdrawRecord',
        component: () => import('@/views/my/distribution/WithdrawRecord')
    },
    {
        path: '/fanslist',
        name: 'FansList',
        component: () => import('@/views/my/distribution/FansList')
    },
    {
        path: '/fansorders',
        name: 'FansOrder',
        component: () => import('@/views/my/distribution/FansOrder')
    },
    {
        path: '/edituserinfo',
        name: 'EditUserInfo',
        component: () => import('@/views/my/edit/EditUserInfo')
    }, {
        path: '/editpwd',
        name: 'EditPwd',
        component: () => import('@/views/my/edit/EditPwd')
    },
    {
        path: '/publishorder',
        name: 'publishOrder',
        component: () => import('@/views/my/publish/publishOrder')
    },
]

export default myRouter
