import React, {Component} from 'react'
import { getCookie ,backLogin } from '../public/utils.js';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			menuList: [
				{
					title: "订单中心",
					children: [
						{name:'我的订单', path:'#/user/order'}
					]
				},
				{
					title: "我的钱包",
					children: [
						{name:'优惠券', path:'#/user/coupon'},
//						{name:'兑换券', path:''},
						{name:'积分', path:'#/user/integral'},
						{name:'账户余额', path:'#/user/balance'}
					]
				},
				{
					title: "我的关注",
					children: [
						{name:'收藏商品', path:'#/search/actionGoods?type=collection'},
						{name:'常购清单', path:'#/search/actionGoods?type=often'},
					]
				},
				{
					title: "消息中心",
					children: [
						{name:'系统消息', path:'#/user/message'},
					]
				}
			]
		}
	}
	componentDidMount(){/* 初次渲染组件 */
	}
	render(){
		console.log(this.props.action)
		return (<div className="c_myMenu c_flex_l1_box">
			{
				this.state.menuList.map(item => (
					<div key={item.title} className="c_myMenu__block">
						<p className="title">{item.title}</p>
						<ul className="list">
							{
								item.children.map(i => <li key={i.name} className="item"><a className={this.props.action == i.name ?'action':''} href={i.path}>{i.name}</a></li>)
							}
						</ul>
					</div>
				))
			}
			
		</div>)
	}
}

export default Main;
