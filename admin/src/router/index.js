import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
        path: '/login',
        component: () =>
            import('@/views/login/index'),
        hidden: true
    },

    {
        path: '/404',
        component: () =>
            import('@/views/404'),
        hidden: true
    },

    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [{
            path: 'dashboard',
            name: 'Dashboard',
            component: () =>
                import('@/views/dashboard/index'),
            meta: {
                title: '管理员',
                icon: 'dashboard'
            }
        }]
    },
    // {
    //     path: '/form',
    //     component: Layout,
    //     children: [{
    //         path: 'index',
    //         name: 'Form',
    //         component: () =>
    //             import ('@/views/form/index'),
    //         meta: { title: 'Form', icon: 'form' }
    //     }]
    // },
    {
        bucket:1,
        path: '/goods',
        component: Layout,
        meta: {
            title: '商品管理',
            icon: 'nested'
        },
        children: [{
                path: 'category/index',
                name: 'Category',
                component: () =>
                    import('@/views/goods/category/index'),
                meta: {
                    title: '商品分类',
                    icon: 'form'
                }
            },
            {


                path: 'goodsshelves/index',
                name: 'Goods',
                component: () =>
                    import('@/views/goods/goods_shelves/index'),
                meta: {
                    title: '货架商品台账',
                    icon: 'form'
                }
            },
            {
        bucket:1,
        path: 'goodsrush/index',
                name: 'GoodsRush',
                component: () =>
                    import('@/views/goods/goods_rush/index'),
                meta: {
                    title: '抢购商品台账',
                    icon: 'form'
                }
            },
        ]
    },

    // {
    //     path: '/notice',
    //     component: Layout,
    //     children: [{
    //         path: 'index',
    //         name: 'Notice',
    //         component: () =>
    //             import ('@/views/notice/index'),
    //         meta: { title: '通知公告', icon: 'form' }
    //     }]
    // },
    {


        path: '/coupon',
        component: Layout,
        children: [{
            path: 'index',
            name: 'Coupon',
            component: () =>
                import('@/views/coupon/index'),
            meta: {
                title: '优惠券',
                icon: 'form'
            }
        }]
    },
    {
        bucket:1,
        path: '/rush',
        component: Layout,
        children: [{
            path: 'index',
            name: 'Rush',
            component: () =>
                import('@/views/rush_schedule/index'),
            meta: {
                title: '抢购场次',
                icon: 'form'
            }
        }]
    },
    {
        path: '/withdrawal',
        component: Layout,
        children: [{
            path: 'index',
            name: 'withdrawal',
            component: () =>
                import('@/views/withdrawal/index'),
            meta: {
                title: '提现申请',
                icon: 'form'
            }
        }]
    },
    {
        path: '/recommenderTree',
        component: Layout,
        children: [{
            path: 'index',
            name: 'recommenderTree',
            component: () =>
                import('@/views/recommenderTree/index'),
            meta: {
                title: '推荐树',
                icon: 'form'
            }
        }]
    },

    {
        path: '/userbucket',
        component: Layout,
        children: [{
            path: 'index',
            name: 'userbucket',
            component: () =>
                import('@/views/userbucket/index'),
            meta: {
                title: '分仓列表',
                icon: 'form'
            }
        }]
    },
    {
        bucket: 0,
        path: '/user',
        component: Layout,
        redirect: '/user/userlist',
        name: 'User',
        meta: {
            title: '用户管理',
            icon: 'nested'
        },
        children: [{
            bucket: 1,
            path: 'userlist',
            component: () =>
                import('@/views/user/user_list/index'), // Parent router-view
            name: 'UserList',
            meta: {
                title: '用户台账'
            },
          },]
        },
        {
          bucket: 0,
          path: '/recyclelist',
          component: Layout,
          redirect: '/recyclelist',
          name: 'Recyclelist',
          meta: {
            title: '回收站列表',
            icon: 'nested'
          },
          children: [{
            bucket: 1,
            path: 'recyclelist',
            component: () =>
              import('@/views/recycle_list/index'), // Parent router-view
            name: 'Recyclelist',
            meta: {
              title: '回收站列表'
            },
          },]
    },
    {
        path: '/orders',
        component: Layout,
        meta: {
            title: '订单管理',
            icon: 'nested'
        },
        children: [{
                path: '/orders/index',
                name: 'orders',
                component: () =>
                    import('@/views/orders/index'),
                meta: {
                    title: '抢购订单台账',
                    icon: 'form'
                }
            }, {
                path: '/disputeorder/index',
                name: 'DisputeOrder',
                component: () =>
                    import('@/views/orders/dispute/index'),
                meta: {
                    title: '投诉订单',
                    icon: 'form'
                }
            },
            {
                path: '/shelvesorder/index',
                name: 'ShelvesOrder',
                component: () =>
                    import('@/views/orders/shelves/index'),
                meta: {
                    title: '商城订单',
                    icon: 'form'
                }
            },
            {
                path: '/pickuporder/index',
                name: 'PickUporderOrder',
                component: () =>
                    import('@/views/orders/pickup/index'),
                meta: {
                    title: '提货订单',
                    icon: 'form'
                }
            },
        ]
    },
    {
        path: '/protocol',
        component: Layout,
        meta: {
            title: '协议管理',
            icon: 'nested'
        },
        children: [{
                path: 'p1/index',
                name: 'Category',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '用户须知',
                    icon: 'form',
                    pid: 1
                }
            },
            {
                path: 'p2/index',
                name: 'Protocal2',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '用户隐私政策',
                    icon: 'form',
                    pid: 2
                }
            },
            {
                path: 'p3/index',
                name: 'Protocal3',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '用户注册服务协议',
                    icon: 'form',
                    pid: 3
                }
            },
            {
                path: 'p4/index',
                name: 'Protocal4',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '上架规范交易协议',
                    icon: 'form',
                    pid: 4
                }
            },
            {
                path: 'p5/index',
                name: 'Protocal5',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '上架品类资质名录',
                    icon: 'form',
                    pid: 5
                }
            },
            {
                path: 'p6/index',
                name: 'Protocal6',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '用户促销活动协议',
                    icon: 'form',
                    pid: 6
                }
            },
            {
                path: 'p7/index',
                name: 'Protocal7',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '商城支付扣款协议',
                    icon: 'form',
                    pid: 7
                }
            },
            {
                path: 'p8/index',
                name: 'Protocal8',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '员工用语行为标准',
                    icon: 'form',
                    pid: 8
                }
            },
            {
                path: 'p9/index',
                name: 'Protocal9',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '著作权转让合同',
                    icon: 'form',
                    pid: 9
                }
            },
            {
                path: 'p10/index',
                name: 'Protocal10',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '入驻服务协议',
                    icon: 'form',
                    pid: 10
                }
            },
            {
                path: 'p11/index',
                name: 'Protocal11',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '供销框架协议',
                    icon: 'form',
                    pid: 11
                }
            },
            {
                path: 'p12/index',
                name: 'Protocal12',
                component: () =>
                    import('@/views/protocol/index'),
                meta: {
                    title: '用户推荐协议',
                    icon: 'form',
                    pid: 12
                }
            },
        ]
    },

    // 404 page must be placed at the end !!!
    {
        path: '*',
        redirect: '/404',
        hidden: true
    }
]

const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({
        y: 0
    }),
    routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

export default router