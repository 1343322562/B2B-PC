import React, {Component} from 'react'
import API from '../api'
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			list:{},
			listKey:[],
		}
	}
	componentDidMount(){/* 初次渲染组件 */
		this.getPageData();
	}
	getPageData(){
		API.Public.searchItemCls({
			data:{},
			success: ret => {
				if (ret.code ==0) {
					let data = ret.data
					let one = data.firstCls||[],
					two = data.secondCls||[],
					list = {},
					listKey = [];
					one.map((item,index)=>{
						listKey.push(item.clsNo);
						list[item.clsNo] = {clsName:item.clsName,children:[]}
					})
					two.map((item,index)=>{
						let cls=item.clsNo.substr(0,2);
						list[cls]&&list[cls].children.push(item);
					})
					let newObj={ list:list,listKey:listKey ,modularCls:data.modularCls||[]};
					this.setState(newObj);
					this.props.getData&&this.props.getData(newObj);
				}
			}
		})
	}
	getOpenUrl (clsNo) {
		return "#/item/search?cls_no="+clsNo
	}
	render(){
		const {listKey,list} = this.state;
		const {showBorder,contTitle,href} = this.props
		return (<div className={"c_top_nav"+(showBorder?"":" c_top_nav--showBorder")}>
			<div className="c_top_nav__box c_w">
				<div className={"c_top_nav__box_classify"+(showBorder?"":(" c_top_nav__box_classify--hide"+(contTitle?" c_top_nav__box_classify--noHover":"")) )}>
					<a href={contTitle?(href||""): this.getOpenUrl('')}>{contTitle||'全部商品分类'}</a>
					<ul className={"c_top_nav__box_classify_oneList"+(listKey.length>15?' act':'')}>
						{
							listKey.map((item,index)=>(
								<li key={index}>
									<a href={this.getOpenUrl(item)} title={list[item].clsName}>{list[item].clsName}</a>
									<i>></i>
									<ul>
										{
											list[item].children.map((zItem,zIndex)=>(
												<li key={zIndex} title={zItem.clsName} ><a href={this.getOpenUrl(zItem.clsNo)} >{zItem.clsName}</a></li>
											))
										}
										
									</ul>
								</li>
							))
						}
					</ul>
				</div>
				
				<div className="c_top_nav__box_menu">
					<span>
						<a href="#">商城首页</a>
					</span>
					<span>
						<a href="#/item/search">商品分类</a>
					</span>
					<span>
						<a href="#/user/order">订单管理</a>
					</span>
				</div>
			</div>
		</div>)
	}
}

export default Main;
