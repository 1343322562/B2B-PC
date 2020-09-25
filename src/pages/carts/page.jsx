import React, {Component} from 'react'
import Header from '../../public/header.jsx';
import TopNav from '../../public/top_nav.jsx';
import Footer from '../../public/footer.jsx';
import Loading from '../../public/pageLoading.jsx';
import './page.css';
import { getGoodsImgSize,deepCopy, toast,getCookie } from '../../public/utils.js';
import { contrastStock, changeItemNum, changeCarsNumUpdatePrice } from '../../public/cartsChange.js';
import { getAllPromotion, getGoodsTag } from '../../public/promotion.js';
import TopSearch from '../../public/top_search.jsx';

import 'antd/dist/antd.css';
import { Menu, Dropdown, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import API from '../../api'

class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			config:{},
			list:{},
			listKey:[],
			replenish:{},
			loginLogo:'',
			loading:false,
		}
		this.getConfig = this.getConfig.bind(this)
	}
	componentDidMount(){ /* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.setState({loading: true})
		this.getPromotion()
		
	}
	getPromotion () { // 获取全部促销
		getAllPromotion(API,{
			dbBranchNo: this.userObj.dbBranchNo,
			complete: (obj)=> {
				console.log(obj)
				console.log(this.state)
				this.promotionObj = obj
				this.getPageData();
			}
		})
	}
	deleteGoods(k,i){ /*删除单个商品*/
		let t=this,
		list=t.state.list,
		listKey=t.state.listKey,
		item=deepCopy(list[k].item[i],{});
		item.nowNum='0';
		item.realQty = '0'
		delete list[k].item[i];
		list[k].num--;
		list[k].totalItemNum--;
		if(!list[k].totalItemNum){
			delete listKey[list[k].index]
			delete list[k];
		}
		t.setState({listKey:listKey});
		t.getTotalMoney(list);
		t.changeCartsGoods(k,[item]);
	}
	deleteAllGoods(k){/*删除多个商品*/
		let t=this,
		list=t.state.list,
		listKey=t.state.listKey,
		clearArr=new Array(),
		isDel=0;
		list[k].item.map((item,index)=>{
			if(item.checked){
				item.nowNum='0';
				item.realQty = '0'
				clearArr.push(item);
				delete list[k].item[index];
			}else{
				isDel++;
			}
		});
		if(!isDel){
			delete listKey[list[k].index]
			delete list[k];
		}else{
			list[k].num=isDel;
			list[k].totalItemNum=isDel;
		}
		t.getTotalMoney(list);
		t.changeCartsGoods(k,clearArr);
		
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
	inputChange(k,i,val){ /* input 改变数据 */
		let t=this,
		list=t.state.list,
		item=deepCopy(list[k].item[i],{}),
		n=parseFloat(val)||1;
		list[k].item[i].nowNum=n;
		t.setState({ list });
	}
	inputBlur(k,i,val){ /* input失去焦点事件 */
		let t=this,
		list=t.state.list,
		item=deepCopy(list[k].item[i],{});
		if(item.nowNum == item.realQty)return;
		let msg=contrastStock(item,item.nowNum),
		n=msg?(item.stockQty>item.maxSupplyQty?item.maxSupplyQty:item.stockQty):item.nowNum;
		list[k].item[i].realQty=n;
		list[k].item[i].nowNum=n;
		
		
		// 若有秒杀限购, 则根据限购数量判断是否更新 price 
		if ('MS' in list[k].item[i] && list[k].item[i].MS && 'msMaxQty' in list[k].item[i]) {
			list[k].item[i].price = changeCarsNumUpdatePrice(list[k].item[i], item.realQty, 'input')	
		}
		t.getTotalMoney(list);
		if(msg)toast(msg);
		t.changeCartsGoods(k,[list[k].item[i]]);
	}
	changeGoodsNum(k,i,type){ /* 商品数量改变  */
		console.log('参数：', k,i,type)
		let t=this,
		list=t.state.list,
		item=deepCopy(list[k].item[i],{}),
		n=changeItemNum(item,item.realQty||0,type);

		console.log(list)
		console.log(this.state)
		const msg = type ==1?'':contrastStock(item,n)
		if(n==0){
			t.deleteGoods(k,i);
			return;
		}
		let qty=msg?item.realQty:n;
		// 若有秒杀限购, 则根据限购数量判断是否更新 price 
		if ('MS' in list[k].item[i] && list[k].item[i].MS && 'msMaxQty' in list[k].item[i]) {
			list[k].item[i].price = changeCarsNumUpdatePrice(list[k].item[i], qty, type)	
		}
		console.log(list[k].item[i].price)
		list[k].item[i].nowNum=qty;
		list[k].item[i].realQty=qty;
		t.getTotalMoney(list);
		if(msg)toast(msg);
		t.changeCartsGoods(k,[list[k].item[i]]);
	}
	// 根据秒杀限购数量判断是否更新 price 
	// changeCarsNumUpdatePrice (item, realQty) {
	// 	if (realQty > item.msMaxQty + 1 || realQty < item.msMaxQty - 1) return item.price
	// 	console.log(item.msMaxQty , realQty)
	// 	console.log(item.msMaxQty < realQty)
	// 	switch(item.msMaxQty < realQty) {
	// 		case true:
	// 			toast('超过秒杀限购数量，已恢复原价')
	// 			return item.orgiPrice 		// 回复原价
	// 		case false:
	// 			return item.msPrice 			// 回复秒杀价
	// 	}
	// }

	getTotalMoney(list){
		let t=this;
		list||(list=t.state.list);
		let listKey = this.state.listKey
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
		t.setState({
			list,
			listKey: listKey.filter(item=>list[item]?true:false)
		});
	}
	goSettlementPage(k,replenish){
		let t=this,
		list=t.state.list[k],
		itemNos=new Array();
		if(!list.num){
			toast('请选择商品');
			return;
		}
		if ((list.startPrice > list.totalMoney)&&!replenish){toast('没有达到起送金额');return}
		list.item.forEach(item => {
			if(item.checked) { 
				itemNos.push(item.itemNo);
			}
		})
		this.props.history.replace('/order/settlement?selected='+escape(JSON.stringify(itemNos))+(replenish?('&replenishNo='+replenish):''))
	}
	changeCartsGoods(k,item){
//		clearTimeout(this.loadCartsTime)
//		this.loadCartsTime = setTimeout(()=>{
			console.log(k,item)
			const { branchNo,dbBranchNo } = this.userObj
			const goods = item[0]
			this.setState({ loading: true },()=>{
				let items= []
				item.forEach(goods => {
					items.push({
						itemNo: goods.itemNo,
						realQty: goods.realQty,
						origPrice: goods.orgiPrice,
						validPrice: goods.price,
						specType: goods.specType,
						branchNo: branchNo,
						sourceType: '0',
						sourceNo: dbBranchNo,
						parentItemNo: goods.parentItemNo||'',
						currentPromotionNo: goods.currentPromotionNo
					})
				})
				this.getPageData(items)
			})

//		},1000)
	}
	isReplenish (config) {
		
		API.Carts.couldReplenishment({
	    	data: {},
	    	success: res => {
	 			const data = res.data
	        	if (res.code == '0' && data) {
	    			let replenish = {}
	   	
					let Fun = (arr,types)=>{
			            return types == '0' ? (config.replenishSheet == '1' ? ((arr && arr.length) ? arr[0].sheetNo : ''):'all'):''
			        }
			        replenish['cw'] = Fun(data.normalData, data.normal)
			        replenish['dw'] = Fun(data.coldData, data.cold)
			        
	     			this.setState({ replenish })
	  			}
	 		}
	    })
	}
	getConfig (config) {
		this.setState({config})
		config.replenishFlag != '0' && this.isReplenish(config)
	}
	// 选择默认的促销
	defaultPromoNo(promoStr) {
		let defaultPromotionNo = promoStr.includes(',') ? promoStr.split(',')[0] : [promoStr]
		return defaultPromotionNo
	}
	getPageData(items){
		let t=this;
		console.log(items, 'items')
		API.Carts.getShoppingCartInfo({
			data: {items:items?JSON.stringify(items):''},
			success: obj => {
				console.log(obj, 'obj')
				if (!items) {
					if(obj.code=='0'){
						obj.msg&&toast(obj.msg);
						let arr=obj.data||[],
						list=new Object(),
						listKey=new Array();
						arr.forEach((shop,i) => {
							shop.datas.forEach((item,z) => {
								let type = shop.sourceType == '0' ? (item.stockType == '0' ? 'cw' : 'dw') : shop.sourceNo ,
								subtotal =Number( (item.realQty * item.price).toFixed(2) );
								item.checked=true;
								item.nowNum=item.realQty;
								item.imgUrl = item.itemNo+'/'+ getGoodsImgSize(item.picUrl,1)
								// 添加当前所选的促销，若没有选择，默认选择最近的促销
								if (item.promotionCollections) {
									item.currentPromotionNo = item.currentPromotionNo || t.defaultPromoNo(item.promotionCollections)
									item.currentPromotionType = shop.sourceType == 0 ? item.currentPromotionNo.slice(0, 2) : item.currentPromotionNo.slice(0, 3) 
									item.promotionCollectionsArr = item.promotionCollections.includes(',') ?  item.promotionCollections.split(',') : [item.promotionCollections]	
								}
								if(item.itemNo.indexOf('Z')!=-1) item.isBind = true
								const tag = getGoodsTag(item, this.promotionObj,true)
								item = Object.assign(item, tag)
								if(list[type]){
									list[type].item.push(item);
									list[type].totalMoney = Number((list[type].totalMoney + subtotal).toFixed(2));
									list[type].totalNum += item.realQty;
									list[type].num++;
									list[type].totalItemNum++;
								}else{
									let startPrice =(type == 'cw' ? arr[i].normalTemperature : (type == 'dw' ? arr[i].refrigeration : arr[i].startPrice))||0;
									list[type] = {
										sourceName: arr[i].sourceName,
										startPrice: startPrice,
										item:[item],
										totalMoney:subtotal,
										totalNum: item.realQty,
										num: 1,
										totalItemNum:1,
										index:listKey.length,
										checked:true
									};
									listKey.push(type);
								}
							})
						})
						console.log(list, 'list')
						t.setState({list,listKey});
					}else{
						toast(obj.msg)
					}
				}
			},
			complete: () => {
				this.setState({ loading: false  })
			}
		})
	}
	getOpenUrl (no) {
		return "#/item/details?item_type=0&item_no="+no
	}
	// 选择促销的下拉框
	selectPromoMenu(k, item, i) {
		const _this = this
		const menu = (
			<Menu>
				{
					item.promotionCollectionsArr.map((tag, index) => {
						return (
							<Menu.Item key={index}>
								<a onClick={() => _this.selectPromotionClick(i, tag, k)}>
									{tag.includes('BF')?'买满赠':''}
									{tag.includes('FS')?'首单特价':''}
									{tag.includes('BG')?'买赠':''}
									{tag.includes('SD')?'单日限购':''}
									{tag.includes('MJ')?'满减':''}
									{tag.includes('MQ')?'数量满减':''}
									{tag.includes('MS')?'秒杀':''}
									{tag.includes('ZK')?item.discount:''}
								</a>
							</Menu.Item>
						)
					})
				}
			</Menu>
		);
		const dropdown = (
			<Dropdown overlay={menu} trigger="click">
				<a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
					换促销 <DownOutlined />
				</a>
			</Dropdown>
		)
		return dropdown
	}
	/**
	 *  换促销
	 * 	i 	商品对象下标
	 *  tag 当前要选的 促销
	 *  k	  当前门店
	 */
	selectPromotionClick(i, tag, k) {
		console.log(i, tag)
		let { list, listKey } = this.state
		console.log(list, listKey, k)
		if (list[k].item[i].currentPromotionNo == tag) return message.warning('请选择不同的促销')
		list[k].item[i].currentPromotionNo = tag
		list[k].item[i].currentPromotionType = tag.slice(0,2)
		console.log(list)
		this.setState({ list })
		message.success('切换成功')
	}
	render(){
		console.log(1)
		let t=this,{loading,list,listKey,config,replenish}=t.state;
		console.log(list)
		return (<div className="carts">
			<Loading show={loading} />
			<Header getConfig={this.getConfig} />
			<div className="c_top c_w">
				<a className="c_logo" href="#"></a>
				<TopSearch keys={config.hotSearchKey} />
			</div>
			<TopNav showBorder={false} />
			<div className="carts-content c_w">
			
				<ul className="carts-content__cartsList">
					{
						listKey.map((k,i)=>(
							<li key={i}>
								<div className={"carts-content__cartsList_info carts-content__cartsList_info--"+(k!='cw'&&k!='dw'?'zc':k)}>
									<i></i>
									<p>
										<span className="carts-content__cartsList_info_name">{list[k].sourceName}</span>
										<span>满 <b className="c_t_red">¥ {list[k].startPrice}</b> 起送,免费送上门</span>
									</p>
								</div>
								<p className="carts-content__cartsList_goodsTitle">
									<span className="carts-content__cartsList_goods_li99">序号</span>
									<span className="carts-content__cartsList_goods_li0">商品信息</span>
									<span className="carts-content__cartsList_goods_li1">单价</span>
									<span className="carts-content__cartsList_goods_li2">数量</span>
									<span className="carts-content__cartsList_goods_li3">小计</span>
									<span className="carts-content__cartsList_goods_li4">操作</span>
								</p>
								<ul className="carts-content__cartsList_goods">
									{
										list[k].item.map((item,index)=>{
											return (<li key={index}>
												<div className="carts-content__cartsList_goods_li99"><span className="sort">{index+1}</span></div>
												<div className="carts-content__cartsList_goods_li0">
													<div className="carts-content__cartsList_goods_checkbox">
														<input type="checkbox" checked={item.checked} name="goodsChecked" onChange={()=>{t.selectGoods(k,index)}} />
													</div>
													<div className="carts-content__cartsList_goods_img" style={{'backgroundImage':"url("+config[item.isBind?'zhGoodsUrl':'goodsUrl']+item.imgUrl+")"}} ><a href={this.getOpenUrl(item.itemNo)}></a></div>
													<div>
														<a href={this.getOpenUrl(item.itemNo)} className="carts-content__cartsList_goods_name">{item.itemName}</a>
														<p className="size">货号 : {item.itemNo}</p>
														<p className="size">规格 : {item.itemSize}</p>
														<div className="carts-content__cartsList_goods__tag">
															<span className="NonReturnable">{(item.enReturnGoods=='0'||item.isProhibit=='1')?"不可退":"可退"}</span>
															{/* {item.BF?<span className="drxg">买满赠</span>:''}
															{item.FS?<span className="drxg">首单特价</span>:''}
															{item.BG?<span className="drxg">买赠</span>:''}
															{item.SD?<span className="drxg">单日限购</span>:''}
															{item.MJ?<span className="drxg">满减</span>:''}
															{item.MQ?<span className="drxg">数量满减</span>:''}
															{item.MS?<span className="drxg">秒杀</span>:''}
															{item.ZK?<span className="drxg">{item.discount}</span>:''}
															{item.discountMoney?<span className="drxg">优惠{item.discountMoney}元</span>:''} */}
															{item.currentPromotionType == 'BF'?<span className="drxg">买满赠</span>:''}
															{item.currentPromotionType == 'FS'?<span className="drxg">首单特价</span>:''}
															{item.currentPromotionType == 'BG'?<span className="drxg">买赠</span>:''}
															{item.currentPromotionType == 'SD'?<span className="drxg">单日限购</span>:''}
															{item.currentPromotionType == 'MJ'?<span className="drxg">满减</span>:''}
															{item.currentPromotionType == 'MQ'?<span className="drxg">数量满减</span>:''}
															{item.currentPromotionType == 'MS'?<span className="drxg">秒杀</span>:''}
															{item.currentPromotionType == 'ZK'?<span className="drxg">{item.discount}</span>:''}
															{
																'promotionCollectionsArr' in item && item.promotionCollectionsArr.length>1 ? t.selectPromoMenu(k ,item, index) : ''
															}
														</div>
													</div>
												</div>
												<div className="carts-content__cartsList_goods_li1 carts-content__cartsList_goods_price">
													<p>¥ {item.price}</p>
													<p style={item.price == item.orgiPrice ? {display: 'none'} : {display: 'block'}}>¥ {item.orgiPrice||0}</p>
												</div>
												<div className="carts-content__cartsList_goods_li2">
													<div className="carts-content__cartsList_goods_changeNum">
														<i onClick={()=>{ t.changeGoodsNum(k,index,1) }}>-</i>
														<input value={item.nowNum} onBlur={(e)=>{t.inputBlur(k,index,e.target.value)}} onChange={(e)=>{t.inputChange(k,index,e.target.value)}}  name="num" />
														<i onClick={()=>{ t.changeGoodsNum(k,index,0) }}>+</i>
													</div>
												</div>
												<div className="carts-content__cartsList_goods_li3 c_t_red carts-content__cartsList_goods_totalMoney">¥ {(item.price*item.realQty).toFixed(2)}</div>
												<div className="carts-content__cartsList_goods_li4 carts-content__cartsList_goods_delete"><a  onClick={()=>{t.deleteGoods(k,index)}}>删除</a></div>
											</li>)
										})
									}
									
								</ul>
								<div className="carts-content__cartsList_btn">
									<div className="c_float_l">
										<input className="carts-content__cartsList_btn_selectAll_input" type="checkbox" checked={list[k].checked} onChange={()=>{t.selectAllGoods(k)}} />
										<a className="carts-content__cartsList_btn_selectAll_text"   onClick={()=>{t.selectAllGoods(k)}} >全选 </a>
										<a className="carts-content__cartsList_btn_deleteAll"  onClick={()=>{t.deleteAllGoods(k)}}> 删除 </a>
									</div>
									<div className="c_float_r">
										<span className="carts-content__cartsList_btn_selectNum">已选：<b className="c_t_red">{list[k].num}</b> 件</span>
										<span className="carts-content__cartsList_btn_money">合计：<b className="c_t_red">¥{list[k].totalMoney}</b></span>
										{
											replenish[k]?
											<a className="carts-content__cartsList_btn_goClearing" style={{"backgroundColor":"cornflowerblue"}} onClick={()=>{ t.goSettlementPage(k,replenish[k]) }}>补货</a>
											:''
										}
										<a className="carts-content__cartsList_btn_goClearing c_bg_red"  onClick={()=>{ t.goSettlementPage(k) }}>结算</a>
									</div>
								</div>
							</li>
							
						))
					}
					
				</ul>
				
				{(!listKey.length&&!loading)?<div className="carts-null">
					<div className="null-box">
						<p>购物车空空的哦~,去看看心仪的商品吧~</p>
						<a href="#">去购物</a>
					</div>
				</div>:''}
			</div>
			<Footer />
		</div>)
	}
}

export default Main;
