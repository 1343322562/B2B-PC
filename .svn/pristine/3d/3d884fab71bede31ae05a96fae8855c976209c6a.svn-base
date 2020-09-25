import React, {Component} from 'react'
import API from '../api'
import { getCookie ,backLogin,getGoodsImgSize,deepCopy,toast } from '../public/utils.js';
import { createHashHistory } from 'history';
class Main extends Component{
	constructor(props){/* 初次加载 */
		super(props);
		this.state={
			height:window.innerHeight,
			isShowCarts:false,
			list:{},
			listKey:[],
			goodsTotalNum: 0
		}
		this.openCarts=this.openCarts.bind(this);
		this.goSettlementPage = this.goSettlementPage.bind(this)
	}
	getCartsGoods(){
		const getCarts = this.props.getCarts
		API.Carts.getShoppingCartInfo({
			data: {},
			success: ret => {
				let arr=ret.data||[],
				list=new Object(),
				listKey=new Array();
				let goodsTotalNum = 0
				if(ret.code=='0'){
					let goodsObj = {}
					arr.forEach((shop,i) => {
						shop.datas.forEach((item,z) => {
							let type = shop.sourceType == '0' ? (item.stockType == '0' ? 'cw' : 'dw') : shop.sourceNo ,
							subtotal =Number( (item.realQty * item.price).toFixed(2) );
							item.checked=true;
							item.nowNum=item.realQty;
							goodsTotalNum += item.realQty
							goodsObj[item.itemNo] = item
							item.imgUrl = item.itemNo+'/'+ getGoodsImgSize(item.picUrl)
							if(list[type]){
								list[type].item.push(item);
				                list[type].totalMoney = Number((list[type].totalMoney + subtotal).toFixed(2));
				                list[type].totalNum += item.realQty;
				                list[type].num++;
							}else{
                				let startPrice =(type == 'cw' ? arr[i].normalTemperature : (type == 'dw' ? arr[i].refrigeration : arr[i].startPrice))||0;
            					list[type] = {
            						sourceName: arr[i].sourceName,
            						startPrice: startPrice,
            						item:[item],
            						totalMoney:subtotal,
            						totalNum: item.realQty,
            						num: 1,
            						index:listKey.length,
            						checked:true
            					};
            					listKey.push(type);
							}
						})
					})
					getCarts && getCarts(goodsObj,this)
				}
				this.setState({list,listKey,goodsTotalNum})
			}
		})
	}
	componentDidMount(){/* 初次渲染组件 */
		this.getCartsGoods();
		window.onresize=() => {
			this.setState({height:window.innerHeight})
		}
	}
	selectGoods(k,i){ /* 单选 */
		let t=this,
		list=t.state.list,
		item=deepCopy(list[k].item[i],{});
		list[k].item[i].checked=!item.checked;
		if(item.checked){
			list[k].checked=false;
			list[k].num--;
		}else{
			list[k].num++;
		}
		t.getTotalMoney(list);
	}
	selectAllGoods(k){ /*全选 */
		let t=this,
		list=t.state.list,
		maxNum=0;
		list[k].checked=!list[k].checked;
		list[k].item.map((item,index)=>{
			item.checked=list[k].checked;
			maxNum++;
		});
		list[k].num=list[k].checked?maxNum:0;
		t.getTotalMoney(list);
	}
	getTotalMoney(list){
		let t=this;
		list||(list=t.state.list);
		for( let i in list){
			let num=0,money=0;
			list[i].item.map((item,index)=>{
				if(item.checked){
					num++;
					money+=Number((item.price*item.realQty).toFixed(2))
				}
			});
			list[i].num=num;
			list[i].totalMoney=parseFloat(money.toFixed(2));
		}
		t.setState(list);
	}
	goSettlementPage(e){
		const k = e.target.dataset.type
		let t=this,
		list=t.state.list[k],
		itemNos=new Array();
		const History = createHashHistory()
		if(!list.num){
			toast('请选择商品');
			return;
		}
		if (list.startPrice > list.totalMoney){toast('没有达到起送金额');return}
		list.item.forEach(item=>{
			if(item.checked) { 
				itemNos.push(item.itemNo);
			}
		})
		History.push('/order/settlement?selected='+escape(JSON.stringify(itemNos)))
	}
	openCarts(){
		let isShowCarts=this.state.isShowCarts;
		this.setState({isShowCarts:!isShowCarts});
		if(!isShowCarts){
			this.getCartsGoods();
		}
	}
	render(){
		let t=this,
		{listKey,list,height,isShowCarts,goodsTotalNum}=t.state;
		const config = this.props.config;
		const History = createHashHistory()
		
		return (<div className="c_sidebar" style={{'height':height,'right':(isShowCarts?320:0)+'px'}}>
			<div className="c_sidebar__btnList" >
				<div>
					<div className="icon c_sidebar__btnList_icon_my" onClick={()=>{History.push('/user/my')}}>
						<span>个人中心<i></i></span>
					</div>
					<div onClick={t.openCarts} className={"c_sidebar__btnList_icon_carts"+(isShowCarts?" c_sidebar__btnList_icon--action":"")}>
						{goodsTotalNum?<div className="totalNum">{goodsTotalNum}</div>:''}
						<i className="icon"></i>
						<b>购物车</b>
					</div>
					<div className="icon c_sidebar__btnList_icon_goUp" onClick={()=>{ window.scrollTo(0,0) }}>
					</div>
					
				</div>
			</div>
			<div className="c_sidebar__content">
				<div className="c_sidebar__content_carts">
					<p className="c_sidebar__content_carts_title">
						<span className="c_float_l">购物车</span>
						<span className="c_float_r"><a href="#/user/carts">查看全部</a></span>
					</p>
					<ul className="c_sidebar__content_carts_list">
						{
							listKey.map((k,i)=>(
								<li	key={i}>
									<p className={"c_sidebar__content_carts_list_title c_sidebar__content_carts_list_title--"+(k!='cw'&&k!='dw'?'zc':k)}>
										<input type="checkbox" checked={list[k].checked} onChange={()=>{t.selectAllGoods(k)}} />
										<i></i>
										<span>{list[k].sourceName}</span>
									</p>
									<ul className="c_sidebar__content_carts_list_goods">
										{
											list[k].item.map((item,index)=>{
												let imgArr=item.picUrl?item.picUrl.split(','):[],
												picUrl=imgArr[imgArr.length-1];
												return (<li key={index}>
													<div className="c_sidebar__content_carts_list_goods_checkbox"><input type="checkbox" checked={item.checked} onChange={()=>{t.selectGoods(k,index)}} /></div>
													<div className="c_sidebar__content_carts_list_goods_img" style={{'backgroundImage':"url("+config.goodsUrl+item.imgUrl+")"}} ></div>
													<div className="c_sidebar__content_carts_list_goods_name">
														<a href={"#/item/details?item_type=0&item_no="+item.itemNo}>{item.itemName}</a>
														<p>商品规格:{item.itemSize}</p>
													</div>
													<div className="price">
														<span className="now">¥{item.price}</span>
													</div>
													<div className="num">数量:{item.nowNum}</div>
												</li>)
											})
										}
									</ul>
									<p className="c_sidebar__content_carts_list_btn">
										<span>已选{list[k].num}件</span>
										<span>共<i className="c_t_red">¥{list[k].totalMoney}</i></span>
										<a onClick={this.goSettlementPage} data-type={k} className="c_float_r c_bg_red">去结算</a>
									</p>
								</li>
							))
						}
						
					</ul>
					{!listKey.length?
					<div className="c_sidebar__content_carts_null">
						<p>购物车空空的哦~</p>
						<p>去看看心仪的商品吧~</p>
					</div>:''}
				</div>
			</div>
		</div>)
	}
}

export default Main;
