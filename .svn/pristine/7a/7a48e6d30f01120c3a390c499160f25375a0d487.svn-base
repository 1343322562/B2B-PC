import React, {Component} from 'react'
import './page.css';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import TopNav from '../../public/top_nav.jsx';
import Pagination from '../../public/pagination.jsx';
import Loading from '../../public/pageLoading.jsx';
import Footer from '../../public/footer.jsx';
import Sidebar from '../../public/right_sidebar.jsx';
import Input from '../../public/input.jsx';
import API from '../../api'
import { getCookie,getGoodsImgSize,setUrlObj,refreshNowPage,toast,group } from '../../public/utils.js';
import { addCarts,contrastStock,changeItemNum, changeCarsNumUpdatePrice } from '../../public/cartsChange.js';
import { getAllPromotion,getGoodsTag } from '../../public/promotion.js';


class App extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		refreshNowPage(props)
		const search = props.location.search
		this.search = search?setUrlObj(search.substr(1)):{}
		this.state = {
			goodsList: [],
			goodsObj: {},
			pageIndex:1,
			positions:[],
			totalNum:0,
			config:{},
			nowClsNo:"",
			keyword:"",
			loading: true,
			loadingTitle:'加载中...',
			cartsGoods:{},
			clsTitle:'',
			clsList:[],
			bindGoods:[],
			selectBindGoods:0,
			bindGoodsSheetNo:""
		}
		this.pageIndexChange=this.pageIndexChange.bind(this)
		this.getCls=this.getCls.bind(this);
		this.getCarts = this.getCarts.bind(this)
		this.addCarts = this.addCarts.bind(this)
		this.inputChange = this.inputChange.bind(this)
		this.inputBlur = this.inputBlur.bind(this)
		this.changeGoodsNum = this.changeGoodsNum.bind(this)
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
	}
	getPromotion () { // 获取全部促销
		getAllPromotion(API,{
			dbBranchNo: this.userObj.dbBranchNo,
			complete: (obj)=> {
				this.promotionObj = obj
				if(obj.BD) {
					let bindGoods = []
					let bindGoodsSheetNo = []
					for(let i in obj.BD.goods) {
						let goods = obj.BD.goods[i]
						const sheetNo = goods.promotionSheetNo
						goods.goodsImgUrl = goods.picUrl?(goods.itemNo + '/' + getGoodsImgSize(goods.picUrl,1)):''
						bindGoods.push(goods)
						if(bindGoodsSheetNo.indexOf(sheetNo)==-1) bindGoodsSheetNo.push(sheetNo)
					}
					this.setState({bindGoods:group(bindGoods,8),bindGoodsSheetNo:bindGoodsSheetNo.join(',')})
				}
				this.getPageData()
			}
		})
	}
	getPageData(index){
		let {nowClsNo,keyword,pageIndex} = this.state;
		const pageSize = 40
		index && (pageIndex = index)
		API.Goods.itemSearch({
			data:{
				condition: keyword,
				modifyDate:'',
				supcustNo:'',
				pageIndex: pageIndex,
				pageSize:40,
				itemClsNo: nowClsNo,
				itemBrandnos: ""// 品牌筛选
			},
			success: ret => {
				const obj = ret.data || {itemData:[],itemClsQty:0}
				let list = obj.itemData
				let goodsList = [];
				let goodsObj = {};
				list.forEach(goods => {
					const itemNo = goods.itemNo
					goods.goodsImgUrl = goods.picUrl?itemNo + '/' + getGoodsImgSize(goods.picUrl,1):''
					goodsList.push(itemNo)
					const specType = goods.specType
					goods.stockNull = (specType == '2'||goods.deliveryType=='3')?false:(!goods.stockQty || goods.stockQty<goods.minSupplyQty)
					const tag = getGoodsTag(goods,this.promotionObj)
		            if (Object.keys(tag).length) { // 促销商品
		              if (tag.FS || tag.SD || tag.ZK|| tag.MS) {
		              	goods.orgiPrice = goods.price
		              	goods.price
		              }
		              goods = Object.assign(goods, tag)
		            }
					let carsObj = this.state.cartsGoods
					if (itemNo in carsObj) goods.realQty = carsObj[itemNo].nowNum
					goodsObj[itemNo] = goods
					// 若有秒杀限购, 则根据限购数量判断是否更新 price 
					if ('MS' in goods && goods.MS && 'msMaxQty' in goods) {
						goodsObj[itemNo].price = changeCarsNumUpdatePrice(goods, goods.realQty, 'onload')	
					}
				})
				this.setState({
					goodsObj,
					goodsList,
					totalNum: obj.itemClsQty,
					pageIndex,
					loading: false
				})
				window.scrollTo(0,0)
			},
			error:  err => {
			}
		})
	}
	pageIndexChange(val){
		let now = this.state.pageIndex;
		if(val==now) return;
		this.setState({loading: true})
		this.getPageData(val);
	}
	getCls(obj){
		let { cls_no,keyword } = this.search
		let positions = []
		keyword = keyword?decodeURI(keyword):''
		if(cls_no) {
			const l = cls_no.substr(0,2)
			const y = obj.list[l]
			if(y) {
				positions.push(y.clsName)
				if(cls_no.length==4) {
					(y.children||[]).forEach(i=> {
						if(i.clsNo == cls_no) {
							positions.push(i.clsName)	
						}
					})
				} else {
					cls_no = obj.list[cls_no].children[0].clsNo
				}
			} else {
				cls_no = ""
			}
		}
		keyword && positions.push(keyword)
		this.setState({
			nowClsNo: cls_no,
			positions,
			keyword
		})
		this.clsObj = obj
		this.setClsCnt(cls_no)
		this.getPromotion()
		
	}
	setClsCnt (clsNo) {
		let clsTitle = ''
		let clsList = []
		if(clsNo) {
			const l = clsNo.substr(0,2)
			const item = this.clsObj.list[l]
			clsList = item.children||[]
			clsTitle = item.clsName
		} else {
			this.clsObj.listKey.forEach(no => {
				const item  = this.clsObj.list[no]
				clsList.push({clsName:item.clsName,clsNo:no})
			})
		}
		this.setState({
			clsTitle,
			clsList
		})
		
	}
	getConfig (config) {
		this.setState({config})
	}
	getOpenUrl (no) {
		return "#/item/details?item_type=0&item_no="+no
	}
	getCarts (cartsGoods,root) {
		this.setState({cartsGoods})
		this.cartsRoot = root
	}
	inputChange(e){ /* input 改变数据 */
		let {goodsObj, cartsGoods} = this.state
		const itemNo = JSON.parse(e.target.dataset.data).no
		const value = parseInt(e.target.value.trim())
		cartsGoods[itemNo].nowNum = isNaN(value)?0:value
		this.setState({cartsGoods})
	}
	inputBlur (e) {
		let {goodsObj, cartsGoods} = this.state
		const itemNo = JSON.parse(e.target.dataset.data).no
		const value = parseInt(e.target.value.trim())||0
		const goods = goodsObj[itemNo]
		if(cartsGoods[itemNo].realQty ==value ) return
		let msg=contrastStock(goods,value)
		let n=msg?(goods.stockQty>goods.maxSupplyQty?goods.maxSupplyQty:goods.stockQty):value;
		
		if ('MS' in goods && goods.MS && 'msMaxQty' in goods) {
			goods.price = changeCarsNumUpdatePrice(goods, n, 'input')	
		}
		if(msg)toast(msg);
		this.addCarts(itemNo,{
			changeNum:n,
			changeType:'one'
		})
	}
	// changeCarsNumUpdatePrice (item, realQty) { /* 根据秒杀限购数量判断是否更新 price  */ 
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
	changeGoodsNum(e){ /* 商品数量改变  */
		const {no,type} = e.target.dataset
		let {goodsObj, cartsGoods} = this.state
		const goods = goodsObj[no]
		let n = changeItemNum(goods,cartsGoods[no].realQty||0,type);
		const msg = type ==1?'':contrastStock(goods,n)
		let qty=msg?cartsGoods[no].realQty:n;
		// 若有秒杀限购, 则根据限购数量判断是否更新 price 
		if ('MS' in goods && goods.MS && 'msMaxQty' in goods) {
			goods.price = changeCarsNumUpdatePrice(goods, qty, type)	
		}
		if(msg)toast(msg);
		this.addCarts(no,{
			changeNum:n,
			changeType:'one'
		})
	}
	addCarts (e,change) {
		const {goodsObj,cartsGoods} = this.state
		const { branchNo,dbBranchNo } = this.userObj
		const itemNo = change?e:e.target.dataset.no
		const itemObj = goodsObj[itemNo]
		if(itemObj.specType == '2') { // 多规格商品
			this.props.history.push("/item/details?item_type=0&parent_no="+itemNo+"&item_no="+itemNo)
		} else {
			let config = {
				goods:itemObj,
				cartsGoods,
				branchNo,
				dbBranchNo,
				success: ret => {
					change || toast('加入购物车成功')
					this.setState({ cartsGoods:ret })
					this.cartsRoot.getCartsGoods()
				},
				error: msg =>  {
					toast(msg)
				},
				complete: () => {
					this.setState({loading: false})
				}
			}
			if(change) {
				for (let i in change) {
					config[i] = change[i]
				}
			}
			this.setState({loading: true})
			addCarts(API,config)
		}
	}
	render(){
		let t=this;
		const {
			pageIndex,
			config,
			goodsList,
			goodsObj,
			positions,
			keyword,
			loadingTitle,
			totalNum,
			loading,
			cartsGoods,
			clsList,
			nowClsNo,
			bindGoods,
			selectBindGoods,
			bindGoodsSheetNo,
			clsTitle
		} = this.state;
		const paginationConfig={
			size: 40,
			num: totalNum,
			nowIndex:pageIndex,
			change:t.pageIndexChange
		};
		return (<div className="item">
			<Loading show={loading} title={loadingTitle} />
			<Header getConfig={this.getConfig.bind(this)} />
			<div className="c_top c_w">
				<a className="c_logo" href="#"></a>
				<TopSearch getCarts={this.getCarts}  keys={config.hotSearchKey} defaultContent={keyword} defaultType="0" />
			</div>
			<TopNav showBorder={false} getData={t.getCls}/>
			
			<div className="item-content c_w">
				{
					clsList.length?
					<div className="c_clsBox">
						<span className="c_clsBox__title c_bg_red">{clsTitle||'全部分类'}</span>
						
						<div className="c_clsBox__list">
						
							<a  className={!nowClsNo?'act':''} href="#/item/search">全部</a>
							{
								clsList.map((item,index)=>(
									
									<a key={index} className={nowClsNo==item.clsNo?'act':''} href={"#/item/search?cls_no="+item.clsNo}>{item.clsName}</a>
									
								))
							}
						</div>
					</div>:''
				}
				
				{
					bindGoods.length?
					<div className="item-groupList">
						<p className="item-groupList__title">
							<span>组合商品促销</span>
							{bindGoods.length>1?<a href={'#/activity/search?item_type=8&item_no='+bindGoodsSheetNo}>查看更多</a>:''}
						</p>
						<ul className="item-groupList__goods">
							{
								(bindGoods[selectBindGoods]||[]).map(goods => (
								<li key={goods.itemNo}>
									<a href={this.getOpenUrl(goods.itemNo)} className="item-groupList__goods_img" style={{"backgroundImage":"url("+config.zhGoodsUrl+goods.goodsImgUrl+")"}}></a>
									<div className="item-groupList__goods_info">
										<p className="item-groupList__goods_info_name"><a href={this.getOpenUrl(goods.itemNo)}  >{goods.itemName}</a></p>
										<p className="item-groupList__goods_info_price">特价: <span>¥{goods.price}</span></p>
										{goods.bdPsPrice?<p className="item-groupList__goods_info_salePrice">原价: <span>¥{goods.bdPsPrice}</span></p>:''}
										<a href={this.getOpenUrl(goods.itemNo)} className="item-groupList__goods_btn">立即抢购</a>
									</div>
								</li>
								))
							}
						</ul>
						{bindGoods.length>1?
						<p className="item-groupList__bottomBtn">
							{
								bindGoods.map((item,index)=><span key={index} onClick={()=>{this.setState({selectBindGoods:index})}} className={selectBindGoods==index?'act':''}>{index+1}</span>)
							}
						</p>:''
						}
					</div>:''
				}
				<div className="c_listMaxNum">
					<span className="c_float_l">商品筛选</span>
					{
						(!loading||goodsList.length)?<span className="c_float_r">共{totalNum}件商品</span>:''
					}
				</div>
				
				<ul className="item-content__list">
					{
						goodsList.map((itemNo,index)=>{
							return (<li key={index}>
								<div className="item-content__list_goods">
									<a href={this.getOpenUrl(itemNo)} className="item-content__list_goods_img" >
										<img src={config.goodsUrl+goodsObj[itemNo].goodsImgUrl} />
										{
											goodsObj[itemNo].rewardPoint>0?<span className="integralTag">积分</span>:''
										}
									</a>
									<p className="item-content__list_goods_price">
										<span>
											<b className="c_t_red">¥</b>
											<i className="c_t_red">{goodsObj[itemNo].price}{goodsObj[itemNo].specType =='2'?'起':('/'+goodsObj[itemNo].unit)}</i>
											<span className="oldPrice">
												<b className='textPrice' style={goodsObj[itemNo].price == goodsObj[itemNo].orgiPrice ? {display: 'none'} : {display: 'block'}}>¥ {goodsObj[itemNo].orgiPrice||0}</b>
												{
													goodsObj[itemNo].salePrice&&config.referencePriceFlag=='1'?<b>零售指导价:¥{goodsObj[itemNo].salePrice}</b>:''
												}
											</span>
										</span>
									</p>
									<p className="item-content__list_goods_name">
										<a href={this.getOpenUrl(itemNo)}>
											<span title={goodsObj[itemNo].itemName}>{goodsObj[itemNo].itemName}</span>
										</a>
									</p>
									<div className="item-content__list_goods_size">
										<p>商品规格:{goodsObj[itemNo].itemSize}</p>
									</div>
									<div className="item-content__list_goods_tag">
										{
											<span className="NonReturnable">{(goodsObj[itemNo].enReturnGoods=='0'||goodsObj[itemNo].isProhibit=='1')?"不可退":"可退"}</span>
										}
										{goodsObj[itemNo].BF?<span className="drxg">买满赠</span>:''}
										{goodsObj[itemNo].FS?<span className="drxg">首单特价</span>:''}
								        {goodsObj[itemNo].BG?<span className="drxg">买赠</span>:''}
								        {goodsObj[itemNo].SD?<span className="drxg">单日限购</span>:''}
								        {goodsObj[itemNo].MJ?<span className="drxg">满减</span>:''}
												{goodsObj[itemNo].MQ?<span className="drxg">数量满减</span>:''}
								        {goodsObj[itemNo].MS?<span className="drxg">秒杀</span>:''}
								        {goodsObj[itemNo].ZK?<span className="drxg">{goodsObj[itemNo].discount}</span>:''}
								        {goodsObj[itemNo].discountMoney?<span className="drxg">优惠{goodsObj[itemNo].discountMoney}元</span>:''}
									</div>
									<div className="item-content__list_goods_bottom">
										<div className="item-content__list_goods_bottom_info">

											<div className="item">
												<span className="l2">起订</span>
												<span className="l4">订货规格</span>
												<span className="l2">限购</span>
											</div>
											<div className="item">
												<span className="l2">{goodsObj[itemNo].minSupplyQty}{goodsObj[itemNo].unit}</span>
												<span className="l4">{goodsObj[itemNo].supplySpec}{goodsObj[itemNo].unit}</span>
												<span className="l2">{goodsObj[itemNo].maxSupplyQty}</span>
											</div>
										</div>
										{
											cartsGoods[itemNo]?
											<div className="form">
												<Input type="text" onBlur={this.inputBlur} onChange={this.inputChange} data={{no:itemNo}} value={cartsGoods[itemNo].nowNum} className="input" />
												<div className="changeBtn">
													<span className="add" data-type="0" data-no={itemNo} onClick={this.changeGoodsNum}></span>
													<span className="minus" data-type="1" data-no={itemNo} onClick={this.changeGoodsNum}></span>
												</div>
											</div>:
											<div className={"item-content__list_goods_bottom_addCarts"+(goodsObj[itemNo].stockNull?' null':'')} onClick= {this.addCarts} data-no={itemNo}>{goodsObj[itemNo].stockNull?'补货中':(goodsObj[itemNo].specType=='2'?'立即选购':'加入购物车')}</div>
										}
									</div>
								</div>
							</li>)
							}
						)
					}
				</ul>
				<div className="c_clear"></div>
			</div>
			{paginationConfig.size<paginationConfig.num?<Pagination {...paginationConfig}  />:''}
			
			<Footer />
		</div>)
	}
}

export default App;

