import React, {Component} from 'react'
import Header from '../../public/header.jsx';
import TopNav from '../../public/top_nav.jsx';
import Footer from '../../public/footer.jsx';
import TopSearch from '../../public/top_search.jsx';
import Loading from '../../public/pageLoading.jsx';
import './page.css';
import { deepCopy,getGoodsImgSize,setUrlObj,getCookie,toast, getIP } from '../../public/utils.js';
import { getAllPromotion,getGoodsTag } from '../../public/promotion.js';
import API from '../../api'

class App extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		const search = props.location.search
		this.search = search?setUrlObj(search.substr(1)):{}
		this.state = {
			payWayList: [ // 支付方式列表
				{name:'余额支付', type:'ye', show:false},
				{name:'微信支付', type:'wx', show:false},
				// {name:'支付宝', type:'zfb', show:false},   // 目前支付宝和微信没做
				{name:'货到付款', type:'hdfk', show:false}
			],
			pageLoading: true, // 是否显示页面
			loading:false,
			loadingTitle:'',
			config:{},// 系统配置
			nowPayWay:'', // 支付方式  ye zfb wx hdfk 
			accountBalance:0, // 账户余额
			orderTotalAmt:0, // 商品总金额
			orderTotalNum:0, // 商品总数量
			goodsList: [], // 商品列表
			realPayAmt:0, // 支付金额
			memo:'', // 备注
			pageType:'0', // 0 计算页  1 成功页  2 失败页
			orderNo:'',
			mzShowIndex: 0,
			mzObj:[],
			mzSelectedObj:{},
			mjObj: [],
			couponsObj: { keys:[]},
			cupSelected: '',
			showActivity:false,
			activityType: '', // mm 满减满赠   yh 优惠券  dh 兑换券
			activityBtn: [
				{name:'买满(赠/减)',type:'mm',show:false},
				{name:'可用优惠券',type:'yh',show:false},
				{name:'兑换券',type:'dh',show:false}
			],
			userIp: '120.228.1.183'  // 用户 IP 地址
		}
		
		this.getConfig = this.getConfig.bind(this)
		this.getMemo = this.getMemo.bind(this)
		this.selectedMz = this.selectedMz.bind(this)
		this.selectCup = this.selectCup.bind(this)
	}
	componentDidMount() { /* 初次渲染组件 */
		// this.data.userIp = getIP() // 获取用户 IP 地址
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		const selected = this.search.selected
		if (selected) {
			const itemNos = JSON.parse(unescape(selected))
			this.getPageData(itemNos)
			this.getUserInfo();
		} else {
			this.props.history.replace('/user/carts')
		}
		
	}
	getCoupons (itemList) {
		const { dbBranchNo: dbranchNo } = this.userObj
		API.Public.searchSupplyCoupons({
			data: {dbranchNo,data:itemList},
			success: ret => {
				if (ret.code == 0) {
					let couponsObj = {keys:[]}
					ret.data.forEach(item => {
						if (item.status == '2') {
							const no = item.couponsNo
							item.endDate = item.endDate.split(' ')[0]
							couponsObj.keys.push(no)
							couponsObj[no] = item
						}
					})
					couponsObj.keys.sort((a,b)=>couponsObj[b].subAmt -couponsObj[a].subAmt  )
					this.setState({
						couponsObj
					})
					console.log(couponsObj)
				}
			},
			complete: () => {
				this.couponsLoading = true
				this.successLoader()
			}
		})
	}
	getMjMz (itemList) {
		const {dbBranchNo:dbranchNo} = this.userObj
		API.Settlement.getSettlementPromotion({
			data:{
				dbranchNo,
				data:itemList,
			},
			success: ret => {
				if (ret.code == 0) { // BF 买满赠 SZ 首赠  MJ  买满减  BG 买赠
					let obj = {mq:[],mj:[],mz:[],gift:[]}
					ret.data.forEach(item => {
						const type = item.promotionType
						if (type == 'MJ' || type == 'MQ') {
							obj.mj.push(item)
						} else if (type =='BG') {
							item.items.forEach(n => {
								n.items.forEach(goods => {
									goods.sheetNo = item.promotionSheetNo
									obj.gift.push(goods)
								})
							})
						} else if (type == 'SZ' || type == 'BF') {
							obj.mz.push(item)
						}
					})
					this.MjMzObj = obj
					console.log('mjList,obj',mjList,obj)
				}
				
			},
			complete: ()=> {
				this.MjMzLoading = true
				this.successLoader()
			}
		})
	}
	getAllPromotion() {
		const {dbBranchNo} = this.userObj
		getAllPromotion(API,{
			dbBranchNo,
			complete: res=> {
				this.promotionObj = res
				this.promotionLoading = true
				this.successLoader()
			}
		})
	}
	successLoader (active) {
		if (this.promotionLoading && this.MjMzLoading && this.configLoading&& this.couponsLoading) {
			let {
				config,
				nowPayWay,
				activityBtn,
				couponsObj
			} = this.state
			const {
				codPayMjFlag, // 货到付款是否支持满减 1:支持
	      		autoCoupons, // 货到付款是否支持优惠券 1:支持
	      		codPayMzFlag, // 货到付款是否支持满赠 1:支持
			} = config
			const MjMzObj = this.MjMzObj
			let nowCarts = deepCopy(this.baseCartsObj)
			let mzObj = []
			let mjObj = []
			let activityType = ''
			let showActivity = false
			let cupSelected = ''
			if (MjMzObj) { // 满赠满减
				for(let i in MjMzObj) {
					let item = MjMzObj[i]
					if (i == 'mz'&&(codPayMjFlag=='1'||nowPayWay!='hdfk')) {
						mzObj = item
					} else if (i == 'mj'&&(codPayMzFlag=='1'||nowPayWay!='hdfk')) {
						mjObj = item
					} else if (i == 'gift') {
						
						const promotion = this.promotionObj
						item.forEach(i => {
							const goods = promotion.BG.giftGoods[i.itemNo][i.id]
							nowCarts.goodsList.push({
								itemNo: i.itemNo,
								itemName: i.itemName,
								promotionSheetNo: goods.sheetNo,
								promotionType:'BG',
								realQty:i.qty,
								price: 0,
								itemSize: goods.itemSize,
								isGift: true,
								preNo:i.parentItemNoSet.join(','),
								itemType: '2',
								parentItemQty: (goods.buyQty + ':' + goods.giftQty),
								id: i.id,
								subtotal: 0,
								goodsImgUrl: i.itemNo+'/'+ getGoodsImgSize(goods.giftImgName)
							})
						})
						
					}
				}
			}
			if(couponsObj.keys.length&&(autoCoupons=='1'||nowPayWay!='hdfk')) {
				cupSelected = this.basecupSelected|| couponsObj.keys[0]
				this.basecupSelected = cupSelected
			}
			
			activityBtn[0].show = mzObj.length || mjObj.length  // 买满(赠/减)
			activityBtn[1].show = couponsObj.keys.length // 优惠券
			activityBtn[2].show = false  // 兑换券
			nowCarts.loading = false
			nowCarts.mzObj = mzObj
			nowCarts.mjObj = mjObj
			activityBtn.forEach(item => {
				if(!activityType&&item.show) {
					activityType = item.type
					showActivity = true
				}
			})
			nowCarts.activityType = activityType
			nowCarts.activityBtn = activityBtn
			nowCarts.showActivity = showActivity
			nowCarts.cupSelected = cupSelected
			console.log(nowCarts)
			this.setState(nowCarts)
		}
	}
	getPageData (itemNos) {
		this.setState({loading: true})
		API.Settlement.getSettlementPageInfo({
			data:{
				items:"[]",
				itemNos:itemNos.join(',')
			},
			success: ret => {
				const data = ret.data
				if(!data.items) {
					this.props.history.replace('/user/carts')
					return
				}
				if (ret.code ==0 && data) {
					let goodsList = [];
					let carts = data.items[0]
					let requestItemList = []
					carts.datas.forEach(goods => {
						const itemNo = goods.itemNo
						// 获取促销的商品数据
						let data = { itemNo, qty: String(goods.realQty), price: String(goods.price) }
					    if (goods.itemType=='0') {
					    	data.clsNo = goods.itemClsno
					        data.brandNo = goods.itemBrandno || ''
					    }
      					requestItemList.push(data)
      					goodsList.push(goods)
					})
					this.cartsInfo = {
						supcustNo: carts.sourceNo,
						stockType: carts.sourceType == '0'?(carts.datas[0].stockType == '0'?'0':'1'):'2',
						transNo: carts.sourceType == '0'?'YH':'ZC'
					}
					let obj = {
						orderTotalAmt: data.sheetAmt,
						orderTotalNum: data.sheetQty,
						goodsList,
						realPayAmt: data.sheetAmt
					}
					this.baseCartsObj = deepCopy(obj)
					this.setState(obj,()=> {
						requestItemList = JSON.stringify(requestItemList)
						this.getMjMz(requestItemList)
						this.getCoupons(requestItemList)
						this.getAllPromotion()
					})
				} else {
					toast(ret.msg)
				}
			},
			complete: () => {
				this.setState({loading: false})
			}
		})
	}
	getConfig (config) {/*获取系统配置*/
		let {payWayList} = this.state;
		const {
	      defaultPayWay, // 默认为空   0货到付款   1储值支付    2微信支付  3支付宝支付  4易宝支付   --- 0货到付款 1在线支付 2储值支付 4混合支付
	      codPay, // 货到付款
	      czPay, // 储值支付
	      wxPay, // 微信支付
	      zfbPay, // 支付宝支付
	    } = config;
	    payWayList[0].show = czPay == '1' 
	    payWayList[1].show = wxPay == '1'
	    payWayList[2].show = zfbPay == '1'
	    payWayList[3].show = codPay == '1'
	    
	    const nowPayWay = (defaultPayWay?(
        (defaultPayWay == '1' && payWayList[0].show) ? 'ye':
        ((defaultPayWay == '2' && payWayList[1].show) ? 'wx' :
        ((defaultPayWay == '3' && payWayList[2].show) ? 'zfb' :
        ((defaultPayWay == '0' && payWayList[3].show)?'hdfk':'')))):'')
	    this.setState({ payWayList,config,nowPayWay },()=>{
	    	this.configLoading = true
	    	this.successLoader()
	    })
	    
	}
	getUserInfo(){
		
		API.Public.getAccBranchInfoAmt({
	      data: {},
	      success: res => {
	        if (res.code == 0 && res.data){
	          const money = res.data.czAmt
	          this.setState({ accountBalance: money < 0 ? 0 : money   })
	        }
	      }
	    })
	}
	changePayWay(type){
		this.setState({nowPayWay: type},()=>{
			this.successLoader(true)
		})
	}
	
	countDiscountsAmt(){ // 获取优惠金额
		const { mjObj ,cupSelected,couponsObj }=this.state;
		let money = 0
		// 满减
		mjObj.forEach(item => {
			money+=item.bonousAmt
		})
		// 优惠券
		if (cupSelected&&couponsObj[cupSelected]) {
			money+=couponsObj[cupSelected].subAmt
		}
		return Number(money.toFixed(2));
	}
	countRealPayAmt(){ // 获取应付金额
		const { realPayAmt }=this.state;
		let money= realPayAmt-this.countDiscountsAmt();
		return Number((money<0?0:money).toFixed(2));
	}
	ordersSubmit(){
		const _this = this
		const { goodsList,orderTotalAmt,nowPayWay,config ,memo, accountBalance,mjObj,mzObj,mzSelectedObj,couponsObj,cupSelected} = this.state
		const { replenishNo } = this.search
		const { dbBranchNo } = this.userObj
		const {supcustNo,stockType,transNo} = this.cartsInfo
		let itemNos = []
		let goodsData = []
		let realPayAmt = this.countRealPayAmt()
		let request = {
			codPayAmtString: '0', // 货到付款金额
			czPayAmtString: '0', // 储值支付金额
			onlinePayAmtString: '0', //线上支付金额
			onlinePayway: '', // 在线支付方式  WX微信支付ZFB支付宝YEE易宝支付TL通联支付UN银联支付
			payWay: '', //  支付方式  0货到付款1在线支付2储值支付4混合支付
			realPayAmt,// 实际支付金额
			shouldPayAmt:String(orderTotalAmt), // 商品金额
			memo, // 备注
			data: '', // 商品数据(包含买赠)
			dbranchNo: dbBranchNo, // 配送中心编号
			itemNos: '', // 所有商品编号 逗号分隔
			stockType, // 常温低温
			supcustNo, // 供应商编号
			ticketType: '0', // 发票类型 0 不开发票  1 个人 2增值税普通发票
			transNo, // ZC ,YH 直配和统配
			version: '9.0.191216', // 配合APP配合版本
		}
		if (replenishNo) {
			request.isReplenishment='1'
			if (config.replenishSheet == '1') request.replenishSheet = replenishNo
		}
		// 支付方式
		if (nowPayWay) {
			let amt = String(realPayAmt)
			if(nowPayWay == 'ye') { // 余额
				request.czPayAmtString = amt
				request.payWay = '2'
				if(accountBalance<realPayAmt) {
					toast('当前余额不足')
					return
				}
			} else if (nowPayWay == 'wx' || nowPayWay == 'zfb') { // 微信 和 支付宝 
				request.onlinePayAmtString = amt
				request.onlinePayway = nowPayWay.toUpperCase()
				request.payWay = '1'
			} else if (nowPayWay == 'hdfk') { // 货到付款
				request.codPayAmtString = amt
				request.payWay = '0'
			}
			request.realPayAmt = amt
			
		} else {
			toast('请选择支付方式')
			return
		}
		// 优惠券
		if(cupSelected&&couponsObj[cupSelected]) {
			const cup = couponsObj[cupSelected]
			request.couponsAmt = String(cup.subAmt)
      		request.couponsNo = cup.couponsNo
		}
		// 普通商品 
		goodsList.forEach(goods => {
			itemNos.push(goods.itemNo)
			let data = {
				itemNo:goods.itemNo,
				isGift: '0', // 0 不是赠品 1 是赠品
				qty: goods.realQty, // 购买数量
				price: goods.price, // 商品价格
				itemType: '1', // 0组合商品 1 普通商品 2 赠品
			}
			if (goods.isGift) { // 赠品
				data.isGift = '1'
				data.itemType = '2'
				data.preNo = goods.preNo
		        data.promotionSheetNo = goods.promotionSheetNo
		        data.parentItemQty = goods.parentItemQty
		        data.id = goods.id
			} else {
				const orgiPrice = String(goods.orgiPrice)
		        const tag = getGoodsTag(goods, this.promotionObj)
		        if (goods.promotionType == 'MS') {
		        	data.oldPrice = orgiPrice
		            data.limitedQty = String(goods.maxSupplyQty)
		            data.promotionSheetNo = goods.promotionSheetNo
		        } else if (tag.SD && goods.realQty<=tag.drMaxQty) { // 单日限购
		            data.promotionSheetNo = goods.promotionSheetNo
		            data.oldPrice = orgiPrice
		            data.limitedQty = String(tag.limitedQty)
		        } else if (tag.FS && goods.realQty <= tag.sdMaxQty){
		            data.fsPromotionSheetNo = goods.promotionSheetNo
		            data.oldPrice = orgiPrice
		        } else if (tag.ZK) {
		            data.promotionSheetNo = goods.promotionSheetNo
		            data.discount = String(tag.discountNum)
		        }
			}
			goodsData.push(data)
		})
		if (mjObj.length) { // 买满减
			let mjData = []
		    mjObj.forEach(item => {
		    	mjData.push({
		      		sheetNo: item.promotionSheetNo,
		          	promotionId: item.promotionId,
		          	mjAmt: String(item.bonousAmt),
		          	mjReachVal: String(item.bonousAmt) ,
		          	orderAmt: String(item.orderAmt),
		          	promotionItemNo: item.promotionItemNo || ''
		        })
		    })
		    request.mjData = JSON.stringify(mjData)
		}
		
		
		if (mzObj.length && Object.keys(mzSelectedObj).length) { // 选择了满赠或首赠
			mzObj.forEach(item => {
				const groupNo = mzSelectedObj[item.promotionSheetNo]
				if(groupNo) {
					item.items.forEach(z => {
						if (z.groupNo == groupNo) {
							z.items.forEach(x => {
								itemNos.push(x.itemNo)
								let zdata = {
									isGift: '1',
									itemNo: x.itemNo,
									itemType: '2',
									qty: String(x.qty),
									groupNo,
									reachVal: String(z.reachVal),
									price: '0',
									id: x.id,
									giftType: x.giftType||''
								}
								zdata[item.promotionType == 'BF' ? 'promotionSheetNo' : 'szPromotionSheetNo'] = item.promotionSheetNo
								goodsData.push(zdata)
							})
						}
					})
				}
			})
		}
		// 更新数据
		request.data = JSON.stringify(goodsData)
		request.itemNos = itemNos.join(',')
		
		console.log(request)
		this.setState({loading: true,loadingTitle:'提交订单...'})
		
		API.Settlement.saveOrder({
			data: request,
			success: res => {
				console.log(491, res, request.payWay)
				const orderNo = res.data
				if (res.code == 0 && orderNo) {
					this.setState({orderNo,pageType:'1'})
					if (request.payWay == '1') { // 在线支付
						console.log(10, this, )
            _this.onlinePay(orderNo)
          }
				} else {
					toast(res.msg || '下单请求失败,请与管理员联系。')
				}
			},
			error: ()=>{
				toast('提交订单失败，请检查网络是否正常。')
			},
			complete: ()=> {
				this.setState({ loading: false })
			}
		})
	}
	// 保存订单后在线支付(获取二维码 url)
  onlinePay (orderNo) {
	console.log(10000)
    const { userIp } = this.state
    let requestObj = {
      out_trade_no: orderNo,     // 订单号
      body: '具体看微信支付文档',  // 商品描述
      spbillIp: userIp           // 用户当前 IP 地址 
    }
    API.Settlement.getWxPayShopParameters({
      data: requestObj,
      success(res) {
        console.log(542, res)
      },
			error(res) {
				console.log(526, res)
			}
    })
  }
	getMemo (e) {
		const memo = e.target.value.trim()
		this.setState({memo})
	}
	selectedMz (e) {
		const { mzShowIndex,mzObj,mzSelectedObj } = this.state
		const { no } = e.currentTarget.dataset
		const promotionSheetNo = mzObj[mzShowIndex].promotionSheetNo
		mzSelectedObj[promotionSheetNo] = no
		this.setState({ mzSelectedObj })
	}
	selectCup (e) {
		const { no } = e.currentTarget.dataset
		this.setState({cupSelected:no})
		this.basecupSelected = no
	}
	render(){
		let t=this;
		const {
			payWayList,
			loading,
			loadingTitle,
			pageLoading,
			accountBalance,
			goodsList,
			orderTotalAmt,
			config,
			nowPayWay,
			pageType,
			orderNo,
			mzShowIndex,
			mzSelectedObj,
			mzObj,
			mjObj,
			showActivity,
			activityType,
			couponsObj,
			activityBtn,
			cupSelected,
		}=t.state;
		const mzItem = mzObj[mzShowIndex]
		const promotionSheetNo = mzItem?mzItem.promotionSheetNo:''
		const mzGroupList = mzItem?mzItem.items:[]
		let mzGoodsList = []
		let nowSelected = mzSelectedObj[promotionSheetNo]
		if (mzItem && nowSelected) {
			mzItem.items.forEach(i => {
				if (nowSelected == i.groupNo) {
					mzGoodsList = i.items
				}
			})
		}
		
		return (<div className="settle" style={{display:pageLoading?'block':'none'}}>
			<Loading show={loading} title={loadingTitle} />
			<Header getConfig={this.getConfig} />
			<div className="c_top c_w">
				<a className="c_logo" href="#"></a>
				<TopSearch keys={config.hotSearchKey} />
			</div>
			<TopNav showBorder={false} contTitle="核对订单信息" href={"#/order/settlement"+this.props.location.search} />
			{pageType=='0'?<div>
			<div className="settle-content c_w">
				
				<p className="settle-content__title">支付方式选择</p>
				
				<ul className="settle-content__payWayList">
					{
						payWayList.map(item => {
							const type = item.type;
							return (item.show?<li key={type} className={"settle-content__payWayList--"+type}>
								<i></i>
								<span>{item.name}</span>
								<div>
									{type=='ye'?<span>我的余额 ¥{accountBalance}</span>:''}
									<i className={nowPayWay==type?'act':''} onClick={()=>{t.changePayWay(type)}}></i>
								</div>
							</li>:'')
						})
					}
				</ul>
				{
				showActivity?
				<React.Fragment>
				<p className="settle-content__title">
					<span>活动详情</span>
					<span className="discount">已优惠{this.countDiscountsAmt()}元</span>
				</p>
				<div className="settle-promotion__box">
				
					<ol className="settle-promotion__title">
						{
							activityBtn.map(item => (item.show?<li key={item.type} onClick={()=>{this.setState({activityType:item.type})}} className={activityType == item.type?'act':''} >
								<span>{item.name}</span>
								{(item.type == 'yh'&&activityType!='yh')?<span className="num">{couponsObj.keys.length}</span>:''}
								
							</li>:''))
						}
					</ol>
					{activityType=='yh'?
					<React.Fragment>
					<div className="settle-promotion__coupons--clear" onClick={this.selectCup} data-no="">不使用优惠券</div>
					<ul className="settle-promotion__coupons" >
						{
							couponsObj.keys.map(item => (
								<li key={item} className={cupSelected == item?'act':''} onClick={this.selectCup} data-no={item} >
									<p className="price"><span>¥{couponsObj[item].subAmt}</span><span>满{couponsObj[item].limitAmt}</span></p>
									<p className="date">有效期至{couponsObj[item].endDate}</p>
								</li>
							))
						}
						
					</ul>
					</React.Fragment>:''}
					{activityType == 'mm'?
					<div className="settle-promotion__mzAndMj" >
						{
							mjObj.map((item,index) => {return(
								<p key={index} className="mj mjmzTitle">
									{item.promotionType == 'MQ'? <i>金额满减</i> : <i>数量满减</i>}
									{item.promotionType == 'MQ'? `数量满${item.reachQty}减${item.bonousAmt}元` : `金额满￥${item.reachVal}减${item.bonousAmt}元。`}
								</p>
							)})
						}
						{
						mzObj.length?
						<div>
							<p className="mz mjmzTitle"><i></i> 您已参与满买赠活动，请选择赠品套餐。</p>
							<ul className="settle-promotion__mz_title">
								{
									mzObj.map((item,index) => <li key={index} className={mzShowIndex==index?'act':''}>活动{index+1}<i className={mzSelectedObj[item.promotionSheetNo]?'act':''}>{mzSelectedObj[item.promotionSheetNo]?'已选':'未选'}</i></li>)
								}
							</ul>
							<div className="settle-promotion__mz_box">
								{
									Object.keys(mzSelectedObj).length?<div className="settle-promotion__mz_Null" onClick={()=>{ this.setState({mzSelectedObj:{}}) }}>不要赠品</div>:''
								}
								<ul className="settle-promotion__mz_Group">
									{
										mzGroupList.map((item,index) => (
										<li key={index} className={ mzSelectedObj[promotionSheetNo] == item.groupNo?'act':''} onClick={this.selectedMz} data-no={item.groupNo} >
											<span>套餐{index+1}</span>
											<span>满{item.reachVal}元赠</span>
										</li>
										))
									}
								</ul>
								
								<p className="msg">赠品列表,请先选择套餐.</p>
								{
									mzGoodsList.length?
									<ol className="settle-promotion__mz_goodsList">
										<li className="title">
											<span className="li0">品名</span>
											<span className="li1">货号</span>
											<span className="li2">赠送数量</span>
											<span className="li3">价格</span>
										</li>
										{
											mzGoodsList.map(goods=>(
											<li key={goods.itemNo}>
												<span className="li0">{goods.itemName}</span>
												<span className="li1">{goods.itemNo}</span>
												<span className="li2">{goods.qty}</span>
												<span className="li3">免费</span>
											</li>
											))
										}
									</ol>:''
								}
							</div>
						</div>:''
						}
							
					</div>:''}
				</div>
				</React.Fragment>:''
				}
				<p className="settle-content__title">订单详情</p>
				<ol className="settle-content__goodsListTitle settle-content__list">
					<li className="li0">品名</li>
					<li className="li1">规格</li>
					<li className="li2">商品条码</li>
					<li className="li3">商品单价</li>
					<li className="li4">要货数量</li>
					<li className="li5">金额小计</li>
				</ol>
				<ul className="settle-content__goodsList settle-content__list">
					{
						goodsList.map(goods=>(
							<li key={goods.itemNo}>
								<span className="li0">
									{
										goods.isGift?
										<b className="gift">[赠品]</b>
										:''
									}
									{goods.itemName}
								</span>
								<span className="li1">{goods.itemSize}</span>
								<span className="li2">{goods.itemNo}</span>
								<span className="li3">{goods.isGift?'免费':('¥'+goods.price)}</span>
								<span className="li4">{goods.realQty}</span>
								<span className="li5">¥{(goods.realQty*goods.price).toFixed(2)}</span>
							</li>
						))
					}
				</ul>
				
				<p className="settle-content__orderTitle">
					<span>商品总计:</span>
					<span className="textB">¥{orderTotalAmt}</span>
				</p>
			
				<p className="settle-content__orderTitle">
					<span>优惠金额:</span>
					<span className="textB">¥{this.countDiscountsAmt()}</span>
				</p>
				
				<p className="settle-content__title">备注:</p>
				<textarea onChange={this.getMemo} className="settle-content__remarks"></textarea>
			</div>
			<div className="settle-footer"> <div className="c_w"> <span>应付:<i className="c_t_red">¥ {this.countRealPayAmt()}</i></span> <a onClick={this.ordersSubmit.bind(t)}>付款</a> </div> </div>
			</div>:<div>
			
				<div className="order-success">
					<p className="title">您已成功下单,感谢您的购买!</p>
					<p className="cnt">订单编号: {orderNo}</p>
					<div className="btn">
						<a href="#">再去逛逛</a>
						<a href="#/user/order?type=0">订单中心</a>
					</div>
				</div>
			
			</div>}
			<Footer />
		</div>)
	}
}

export default App;