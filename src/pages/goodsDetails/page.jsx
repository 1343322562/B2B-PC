import React, {Component} from 'react'
import './page.css';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import TopNav from '../../public/top_nav.jsx';
import Footer from '../../public/footer.jsx';
import Sidebar from '../../public/right_sidebar.jsx';
import Loading from '../../public/pageLoading.jsx';
import API from '../../api'
import { getGoodsImgSize,setUrlObj,toast,getCookie } from '../../public/utils.js';
import { addCarts, changeCarsNumUpdatePrice } from '../../public/cartsChange.js';
import { getAllPromotion,getGoodsTag } from '../../public/promotion.js';


class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		const search = props.location.search
		this.search = search?setUrlObj(search.substr(1)):{}
		this.state = {
			config:{},
			itemObj:{},
			itemDetails:'',
			selected:0,
			cartsGoods: {},
			loading: true,
			loadingTitle:'加载中...',
			num: 0,
			goodsList: [],
			promotionList:[]
		}
		this.getCarts = this.getCarts.bind(this)
		this.changeNum = this.changeNum.bind(this)
		this.inputChnage = this.inputChnage.bind(this)
		this.inputBlur = this.inputBlur.bind(this)
		this.addCarts = this.addCarts.bind(this)
		this.selectedItem = this.selectedItem.bind(this)
		this.getImgUrl = this.getImgUrl.bind(this)
		this.openGoodsDetails = this.openGoodsDetails.bind(this)
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.getPageData()
		setTimeout(() => {console.log(this.state)}, 500)
		
	}
	getPageData(){
		const {item_no,item_type,parent_no} = this.search
		if (item_no.indexOf('Z')!=-1) {
			this.getAllPromotion(item_no)
			return
		}
		let request = {
			condition:'',
			pageIndex:1,
			pageSize:10,
			itemClsNo:'',
		}
		if (parent_no) { // 多规格商品
			request.parentItemNo = parent_no
		} else {
			request.searchItemNos = item_no
		}
		API.Goods.itemSearch({
			data:request,
			success: ret => {
				if(ret.code == '0' && ret.data) {
					let goodsList = ret.data.itemData		
					goodsList.forEach(goods => {
						const picUrl = goods.picUrl?goods.picUrl.split(','):[]
						let imgList = []
						picUrl.forEach(item => {
							imgList.push({
								d:goods.itemNo+'/'+getGoodsImgSize(item,2),
								x:goods.itemNo+'/'+getGoodsImgSize(item)
							})
						})
						goods.stockNull = goods.deliveryType=='3'?false:(!goods.stockQty || (goods.stockQty<goods.minSupplyQty))
						goods.imgList = imgList
					})
					this.setState({
						itemObj:goodsList[0],
						goodsList
					},()=>{
						this.getAllPromotion()
					})
				}
			}
		})
	}
	getAllPromotion(zhItemNo) {
		
		getAllPromotion(API,{
			dbBranchNo: this.userObj.dbBranchNo,
			complete: res=> {
				let nowGoods = this.state.itemObj
				const tag = zhItemNo?{}:getGoodsTag(nowGoods, res)
				let promotionList = []
				if(zhItemNo) { // 捆绑商品
					let itemObj = res.BD.goods[zhItemNo]
					itemObj.stockNull = !itemObj.stockQty || (itemObj.stockQty<itemObj.minSupplyQty)
					const picUrl = itemObj.picUrl?itemObj.picUrl.split(','):[]
					let imgList = []
					picUrl.forEach(item => {
						imgList.push({
							d:itemObj.itemNo+'/'+getGoodsImgSize(item,2),
							x:itemObj.itemNo+'/'+getGoodsImgSize(item)
						})
					})
					itemObj.itemDetails.forEach(goods => {
						goods.goodsImgUrl=goods.picUrl?(goods.itemNo + '/' + getGoodsImgSize(goods.picUrl,1)):''
					})
					itemObj.imgList = imgList
					this.setState({itemObj})
				} else if (Object.keys(tag).length) {
					const itemNo = nowGoods.itemNo
       				const brandNo = nowGoods.itemBrandno || nowGoods.itemBrandNo
        			const itemClsno = nowGoods.itemClsno
        			
          			if (tag.FS || tag.SD || tag.ZK) {
			            nowGoods.orgiPrice = nowGoods.price
			            nowGoods.price = tag.price
			            promotionList.push({
			            	name: tag.FS ? '首单特价' : (tag.SD ? '单日限购' : (tag.zkType + '折扣')),
			            	msg: [(tag.FS ? ('活动期间,首次下单且购买数量不超过 '+tag.sdMaxQty+' 享受优惠价格￥'+tag.sdPrice) : (tag.SD ? ('购买数量不超过 ' + tag.drMaxQty + ' 参与促销活动，特价￥' + tag.drPrice) : ('当前' + tag.zkType + '下单立即享受' + tag.discount + '优惠')))]
			            })
						}
						if('MQ' in tag) {
							const msg = `购买数量满${tag.MQ['buyQty'] + nowGoods.unit}减${tag.MQ['subMoney']}元`
							promotionList.push({
								name: '数量满减',
								msg: [msg]
							})
						}
			    	if (tag.MS) {
			  			promotionList.push({
			            	name: '秒杀促销',
			            	msg: [('购买数量不超过 ' + tag.msMaxQty + ' 参与秒杀活动，特价￥' + tag.msPrice)]
			            })
			   		}
			   		if(tag.BG) {
			      		let msg = { name: ((tag.BG == 'cls' ? '类别' : (tag.BG == 'brand' ? '品牌' : '')) + '买赠'),msg:[] }
			            const arr = res.BG[tag.BG][tag.BG == 'cls' ? itemClsno : (tag.BG == 'brand' ? brandNo : itemNo)]
			            for (let i in arr) {
			           		const giftInfo = res.BG.giftGoods[arr[i]][i]
			          		msg.msg.push('满 ' + giftInfo.buyQty + ' 送' + giftInfo.giftQty + ' [' + giftInfo.giftName +']')
			            }
			            promotionList.push(msg)
			  		}
			    	if (tag.MJ) {
			            let msg = { name: (tag.MJ == 'fullReduction' ? '全场' : (tag.MJ == 'cls' ? '类别' : (tag.MJ == 'brand' ? '品牌' : '商品'))) + '满减',msg:[] }
			            const arr = tag.MJ == 'fullReduction' ? res.MJ[tag.MJ] : res.MJ[tag.MJ][tag.MJ == 'cls' ? itemClsno : (tag.MJ == 'brand' ? brandNo : itemNo)]
			            arr.forEach(info => {
			            	msg.msg.push('满'+info.reachVal +'减'+info.subMoney)
			            })
			            msg.msg = [msg.msg.join('，')]
			            promotionList.push(msg)
			   		}
			   		if (tag.BF) {
			            
			            const infoArr = [res.BF.all, res.BF.cls[itemClsno], res.BF.brand[brandNo], res.BF.goods[itemNo]]
			            infoArr.forEach((item,i) => {
			            	if (item && item.length) {
			             		let name = (i==0?'全场':(i==1?'类别':(i==2?'品牌':'单品')))+'满赠'
			            		item.forEach(info => {
			                		promotionList.push({
			                			name,
			                			msg: [info.explain || ('满￥' + info.reachVal+',赠'+info.data.length+'样赠品')],
			                			data: info.data
			              			})
			            		})
			           		}
			            })
			   		}
			  		nowGoods = Object.assign(nowGoods, tag)
			  		
			  		this.setState({ itemObj:nowGoods,promotionList})
				}
				if (nowGoods.rewardPoint>0) {
			  		promotionList.push({
			  			name:'积分',
			  			msg:['每买'+nowGoods.buyQty+nowGoods.unit+'获得'+nowGoods.rewardPoint+'积分']
			  		})
			  		this.setState({ promotionList })
			  	}
				this.setState({loading:false})
				
			}
		})
	}
	getDetails(){
		const {item_no} = this.search
		const {config} = this.state;
		API.Goods.searchItemDetail({
			data:{
				itemNo: item_no
			},
			success: ret => {
				let det = ret.data;
				if(ret.code=='0'&& det){
					det =det.replace(new RegExp(/(&lt;)/g),'<')
					.replace(new RegExp(/(&gt;)/g),'>')
					.replace(new RegExp(/(\/n)/g),'<br/>')
					.replace(new RegExp(/(width)/g),'data-value')
					.replace(new RegExp(/(height)/g),'data-value2');
					var arr = det.split("src='")
					arr.map((item,index)=>{
						if(item.indexOf('http')==-1 && index){
							arr[index] = config.picUrl+ "/"+item;
						}
					})
					this.setState({itemDetails:arr.join("src='")})
				}
			}
		})
	}
	getConfig (config) {
		this.setState({config})
		this.getDetails()
	}
	getCarts (cartsGoods,root) {
		this.setState({cartsGoods})
		this.cartsRoot = root
	}
	addCarts () {
		const {cartsGoods,itemObj ,num} = this.state
		const { branchNo,dbBranchNo } = this.userObj
		if (!num) {
			toast('请输入购买数量')
			return
		}
		this.setState({loading: true})
		addCarts(API,{
			goods:itemObj,
			num,
			cartsGoods,
			branchNo,
			dbBranchNo,
			success: ret => {
				toast('加入购物车成功')
				this.setState({ cartsGoods:ret })
				this.cartsRoot.getCartsGoods()
			},
			error: msg =>  {
				toast(msg)
			},
			complete: () => {
				this.setState({loading: false})
			}
		})
	}
	changeNum (type) {
		let { num , itemObj} = this.state
		if(!num&&type =='0')return
		const stockQty = itemObj.stockQty || 0
		const maxSupplyQty = itemObj.maxSupplyQty || 9999
		const minSupplyQty = itemObj.minSupplyQty ||1
		const supplySpec = itemObj.supplySpec || 1
		const qty = num?supplySpec:minSupplyQty
		itemObj.realQty = num 
		num += (type =='0'?-(num==minSupplyQty?minSupplyQty:qty):qty)

		// 若有秒杀限购, 则根据限购数量判断是否更新 price 
		if ('MS' in itemObj && itemObj.MS && 'msMaxQty' in itemObj) {
			itemObj.price = changeCarsNumUpdatePrice(itemObj, num, !type)	
		}
		if(num > maxSupplyQty|| num>stockQty) {
			toast(itemObj.stockNull?'库存不足':'已达到最大购买数量['+(maxSupplyQty>stockQty?stockQty:maxSupplyQty)+']')
			return
		}
		this.setState({num})
	}
	inputChnage (e) {
		var num = Number(e.target.value.trim())||0
		this.setState({num})
	}
	inputBlur (e) {
		const {itemObj} = this.state;
		var num = Number(e.target.value.trim())||0
		if(num) {
			const stockQty = itemObj.stockQty || 0
			const maxSupplyQty = itemObj.maxSupplyQty || 9999
			const minSupplyQty = itemObj.minSupplyQty || 1
			const supplySpec = itemObj.supplySpec || 1
			let num2 = num - minSupplyQty;
	    num = num2 <= 0 ? minSupplyQty : (minSupplyQty + (num2 <= supplySpec ? supplySpec : supplySpec * parseInt(num2 / supplySpec)))
			maxSupplyQty<num && (num = maxSupplyQty)
			if ('MS' in itemObj && itemObj.MS && 'msMaxQty' in itemObj) {
				itemObj.price = changeCarsNumUpdatePrice(itemObj, num, 'input')	
			}
		}
		this.setState({num})
	}
	selectedItem (goods) {
		this.setState({itemObj:goods, num:0})
	}
	getImgUrl () {
		const {itemObj,config}  = this.state
		const itemNo = itemObj.itemNo
		let urls = ''
		if (itemNo&&itemNo.indexOf('Z')!=-1) {
			urls = config.zhGoodsUrl
			
		} else {
			urls = config.goodsUrl
		}
		return urls
	}
	openGoodsDetails (e) {
		const {no} = e.target.dataset
		this.props.history.push('/item/details?item_type=0&item_no='+no)
		location.reload()
	}
	render(){
		const {selected ,itemObj,config,itemDetails,num,goodsList,promotionList,loading, loadingTitle} = this.state;
		return (<div className="details">
			<Loading show={loading} title={loadingTitle} />
			<Header getConfig={this.getConfig.bind(this)} />
			<div className="c_top c_w">
				<a className="c_logo" href="#"></a>
				<TopSearch  keys={config.hotSearchKey} getCarts={this.getCarts} />
			</div>
			<TopNav showBorder={false} />
			
			<div className={"details-content c_w"+(itemObj.itemNo?' show':'')}>
			
				<div className="details-content__info">
					<div className="details-content__info_left">
						<div className="details-content__info_left_maxImg" style={{'backgroundImage':"url("+this.getImgUrl()+((itemObj.imgList&&itemObj.imgList[selected])&&itemObj.imgList[selected].d)+")"}} ></div>
						<ul className="details-content__info_left_minImg">
							{
								(itemObj.imgList||[]).map((item,index) => (
									<li key={index} style={{'backgroundImage':"url("+this.getImgUrl()+item.x+")"}} className={selected == index?"details-content__info_left_minImg--action":''}></li>
								))
							}
						</ul>
					</div>
					
					<div className="details-content__info_right">
						<div className="details-content__info_right_goods">
						 	<p className="details-content__info_right_goods_name">{itemObj.itemName}</p>
						 	<div className="details-content__tag">
						 		<span className="NonReturnable">{(itemObj.enReturnGoods=='0'||itemObj.isProhibit=='1')?"不可退":"可退"}</span>
						 	</div>
						 	<p>货号: {itemObj.itemNo}</p>
						 	<p>条形码: {itemObj.itemSubno||'无'}</p>
						 	<div className="details-content__info_right_goods_price">
						 		<p>
						 			<span>
						 				<b>批发价 :</b>
						 				<i className="c_t_red">¥{itemObj.price}</i>
						 				
						 			</span>
						 		</p>
								 <p style={itemObj.price == itemObj.orgiPrice ? {display: 'none'} : {display: 'block'}}>原价：¥ {itemObj.orgiPrice}</p>
						 		{
						 			(itemObj.salePrice&&config.referencePriceFlag=='1')?<p>零售指导价 : ¥{itemObj.salePrice}</p>:''
						 		}
						 	</div>
						 	<p><b>规格 :</b> {itemObj.itemSize}</p>
						 	<p><b>保质期 :</b> {itemObj.validDay?(itemObj.validDay+'天'):'见产品包装'}</p>
						 	<p className="details-content__info_right_goods_buySize">
						 		<span>起订 : {itemObj.minSupplyQty||1}{itemObj.unit}</span>
						 		<span>订货规格 : {itemObj.supplySpec||1}{itemObj.unit}</span>
						 		<span>限购 : {itemObj.maxSupplyQty||9999}</span>
						 	</p>
						 	<p className="details-content__info_right_goods_buySize" style={{'borderTop':"none","paddingTop":"0"}}>
						 		<span>单位 : {itemObj.unit||itemObj.smallestUnit}</span>
						 		<span>品牌 : {itemObj.itemBrandname||'未分类'}</span>
						 		<span>库存 : {itemObj.stockQty>0?itemObj.stockQty:0}</span>
						 	</p>
						 	
						 	{
						 		goodsList.length>1?
								<div className="details-content__info_right_goods_children">
							 		<b>种类 :</b>
							 		<div>
							 			{
							 				goodsList.map((item,index)=>{
									 			return (<a key={index} className={itemObj.itemNo==item.itemNo?'act':''} title={item.itemName} onClick={()=>{this.selectedItem(item)}}>
									 				<i style={{'backgroundImage':"url("+config.goodsUrl+(item.imgList[0]&&item.imgList[0].x)+")"}}></i>
									 			</a>)
							 				})
							 			}
							 		</div>
							 	</div>:null
						 	}
						 	{
						 	promotionList.length?
						 	<div className="details-content__info_right_goods_promotionInfo" >
							 	<b>促销 :</b>
							 	<div>
							 		{
							 			promotionList.map((item,index) => (
								 		<div key={index} className="list" >
									 		<span className="name">{item.name}</span>
									 		<div className="cnt">
									 			{
									 				item.msg.map((zItem,zIndex)=>(
									 					<div key={zIndex}>
									 						<span>{zItem}</span>
									 						{
									 							item.data?
										 						<div className="look">
										 							<span className="text">[查看]</span>
										 							<div className="giftBox">
											 							<p className="t">赠品信息</p>
											 							{
											 								item.data.map((xItem,xIndex)=>(
												 							<div key={xIndex} className={"item "+(xItem.itemType=='0'?'icon-c':'icon-g')}>
												 								<span>{xItem.itemName}</span>
												 								<span>x{xItem.num} /{xItem.unit}</span>
												 							</div>
											 								))
											 							}
											 						</div>
										 						</div>:""
									 						}
									 						
									 					</div>
									 				))
									 			}
									 		</div>
									 	</div>
							 			))
							 		}
							 	</div>
							</div>:''
						 	}
						 	
						 	<div className="details-content__info_right_goods_btn">
						 		<b>数量 :</b>
						 		<div>
						 			<div className="details-content__info_right_goods_btn_changeNum c_float_l">
						 				<span onClick={() => this.changeNum(0)} data-type="0" >-</span>
						 				<input name="num" value={num} onBlur={this.inputBlur} onChange={this.inputChnage}/>
						 				<span onClick={() => this.changeNum(1)} data-type="1">+</span>
						 			</div>
						 			<a className={"details-content__info_right_goods_btn_addCarts c_bg_red c_float_l"+(itemObj.stockNull?' null':'')}  onClick={this.addCarts}>{itemObj.stockNull?'补货中':'加入购物车'}</a>
						 		</div>
						 	</div>
						 	
						</div>
						
					</div>
					
				</div>
				
				{
				itemObj.itemDetails?
				<div className="item-groupList">
					<p className="item-groupList__title">
						<span>套餐内容</span>
					</p>
					<ul className="item-groupList__goods">
						{
							itemObj.itemDetails.map(goods => (
								<li key={goods.itemNo}>
									<a data-no={goods.itemNo} onClick={this.openGoodsDetails}  className="item-groupList__goods_img" style={{'backgroundImage':"url("+config.goodsUrl+goods.goodsImgUrl+")"}}></a>
									<div className="item-groupList__goods_info">
										<p className="item-groupList__goods_info_name"><a data-no={goods.itemNo} onClick={this.openGoodsDetails}>{goods.itemName}</a></p>
										<p className="item-groupList__goods_info_price">¥{goods.schemePrice}</p>
										<p>规格 : {goods.itemSize}</p>
										<p>数量 : <span>{goods.itemQty}</span></p>
									</div>
								</li>
							))
						}
					</ul>
				</div>:''
				}
		
			</div>
			<div className="details-itemList c_w" dangerouslySetInnerHTML={{__html: itemDetails}}></div>
			<Footer />
		</div>)
	}
}

export default Main;
