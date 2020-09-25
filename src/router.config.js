import asyncComponent from './asyncComponent.js'
var routers = [
	{/*首页*/
		path:'/',
		component: asyncComponent(() => import("./pages/index/page.jsx")),
		exact:true
	},
	{/*登录*/
		path:'/user/login',
		component:asyncComponent(() => import("./pages/login/page.jsx"))
	},
	{/*商品搜索*/
		path:'/item/search',
		component:asyncComponent(() => import("./pages/searchGoods/page.jsx"))
	},
	{/*商品详情*/
		path:'/item/details',
		component:asyncComponent(() => import("./pages/goodsDetails/page.jsx"))
	},
	{/*购物车*/
		path:'/user/carts',
		component:asyncComponent(() => import("./pages/carts/page.jsx"))
	},
	{/*结算页*/
		path:'/order/settlement',
		component:asyncComponent(() => import("./pages/settlement/page.jsx"))
	},
	{/*我的*/
		path:'/user/my',
		component:asyncComponent(() => import("./pages/my/page.jsx"))
	},
	{/*我的订单*/
		path:'/user/order',
		component:asyncComponent(() => import("./pages/orderList/page.jsx"))
	},
	{/*当月订单*/
		path:'/user/cOrder',
		component:asyncComponent(() => import("./pages/orderList/page.jsx"))
	},
	{/*订单详情*/
		path:'/order/details',
		component:asyncComponent(() => import("./pages/orderDetails/page.jsx"))
	},
	{/*收藏商品/常购商品列表*/
		path:'/search/actionGoods',
		component:asyncComponent(() => import("./pages/searchActionGoods/page.jsx"))
	},
	{/* 积分 */
		path:'/user/integral',
		component:asyncComponent(() => import("./pages/integral/page.jsx"))
	},
	{/* 账户余额  */
		path:'/user/balance',
		component:asyncComponent(() => import("./pages/balance/page.jsx"))
	},
	{/* 消息中心  */
		path:'/user/message',
		component:asyncComponent(() => import("./pages/message/page.jsx"))
	},
	{/* 活动页  */
		path:'/activity/search',
		component:asyncComponent(() => import("./pages/activity/page.jsx"))
	},
	{/* 活动页  */
		path:'/user/coupon',
		component:asyncComponent(() => import("./pages/coupons/page.jsx"))
	},
	{/* 优惠券领取  */
		path:'/user/couponsReceive',
		component:asyncComponent(() => import("./pages/couponsReceive/page.jsx"))
	},
	{/* 秒杀  */
		path:'/activity/seckill',
		component:asyncComponent(() => import("./pages/seckill/page.jsx"))
	},
	{/* 积分商品列表  */
		path:'/integral/search',
		component:asyncComponent(() => import("./pages/integralGoods/page.jsx"))
	}
]
export default routers
