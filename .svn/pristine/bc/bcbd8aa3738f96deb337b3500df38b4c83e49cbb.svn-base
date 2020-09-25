import React, {Component} from 'react'
import './page.scss';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import Footer from '../../public/footer.jsx';
import TopNav from '../../public/top_nav.jsx';
import Menu from '../../public/my_menu.jsx';
import Pagination from '../../public/pagination.jsx';
import Loading from '../../public/pageLoading.jsx';
import Alert from '../../public/alert.jsx';
import { getCookie,getGoodsImgSize,setUrlObj,toast } from '../../public/utils.js';
import API from '../../api'
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		const search = props.location.search
		this.search = search?setUrlObj(search.substr(1)):{}
		this.state = {
			loading: false,
			loadingTitle:'加载中...',
			config:{},
			orderFlowObj:[],
			order:{},
			alertConfig:{},
			orderType:this.search.order_type,
			alertShow:false,
			thOrder:{}
		}
		this.showAlert = this.showAlert.bind(this)
		this.afreshOrder = this.afreshOrder.bind(this)
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.getPageData()
	}
	getConfig (config) {
		this.setState({config})
	}
	showAlert (e) {
		const { type } = e.target.dataset
		const { order } = this.state
		this.setState({
			alertShow: true,
			alertConfig: {
				title:'温馨提示',
				content:(type == '1' ? '确认是否收货?' :'确认是否取消此订单?'),
				btn: [
					{
						name:"取消",
						callback: ()=> {
							this.setState({ alertShow: false})
						}
					},
					{
						name:"确定",
						callback: ()=> {
							this.setState({loading: true,alertShow: false})
							API.Order[type == '1'? 'submitReceiveOrder' : 'cancelOrder']({
								data: {
									sheetNo:order.sheetNo
								},
								success: ret => {
									if (ret.code == 0) {
										toast(type == '1'?'收货成功!':'取消订单成功!')
										 location.reload()
									} else {
										toast(ret.msg)
									}
								},
								error: ()=> {
									toast('操作失败请检查网络是否正常')
								},
								complete: () => {
									this.setState({loading: false})
								}
							})
						}
					}
					
				]
			}
		})
	}
	afreshOrder () {
		const { order } = this.state
		this.setState({
			alertShow: true,
			alertConfig: {
				title:'温馨提示',
				content:'是否把商品加入购物车',
				btn: [
					{
						name:"取消",
						callback: ()=> {
							this.setState({ alertShow: false})
						}
					},
					{
						name:"确定",
						callback: ()=> {
							this.setState({loading: true,alertShow: false})
							API.Order.againOrder({
					            data: {  yhSheetNo:order.sheetNo },
					            success: res => {
					          		if (res.code == 0) {
					          			const list = res.data || []
					          			let items = []
					          			list.forEach(goods => {
					          				items.push({
					          					itemNo: goods.itemNo,
					          					realQty: goods.itemQty,
					          					origPrice: goods.oldPrice,
					          					validPrice: goods.price,
					          					specType: goods.specType,
					          					branchNo: order.dBranchNo,
					          					sourceType: '0',
					          					sourceNo:order.branchNo,
					          					parentItemNo: goods.parentItemNo||''
					          				})
					          			})
					          			
					          			API.Carts.getShoppingCartInfo({
											data: {
												items:JSON.stringify(items)
											},
											success: ret => {
												if (ret.code == '0') {
													this.props.history.replace('/user/carts')
												} else {
													toast(ret.msg)
												}
											},
											error: () => {
												toast('加入购物车失败,请检查网络是否正常!')
											}
										})
					          			
					          			console.log(list)
					          		} else {
					             		toast(res.msg)
					           		}
					            },
					            error: () => {
					              toast('加入购物车失败,请检查网络是否正常')
					            },
					            complete: () => {
					           		this.setState({loading: false})
					            }
					        })
						}
					}
					
				]
			}
		})
	}
	getTHPageData () {
		const { sheet_no,order_type } = this.search
		API.Order.searchReturnOrder({
			data: {
				dbranchNo: this.userObj.dbBranchNo
			},
			success: ret => {
				if (ret.code == 0) {
					let list = ret.data||[]
					let thOrder = {}
					list.forEach(order => {
						if (sheet_no == order.master.sheetNo) {
							thOrder = order
						}
					})
					thOrder.details.forEach(goods => {
						goods.subAmt = Number((goods.avgPrice * goods.realQty).toFixed(2))
					})
					console.log(thOrder)
					this.setState({ thOrder })
				}
			},
			complete: () => {
				this.setState({loading:false})
			}
		})
	}
	getPageData () {
		this.setState({loading: true})
		const { sheet_no,order_type } = this.search
		if(order_type == 'TH') {
			this.getTHPageData()
			return
		}
		API.Order.getOrderDetail({
			data:{
				sheetNo: sheet_no
			},
			success: res => {
				if(res.code == 0) {
					const order = res.data
			        order.orderDetails.forEach(goods => {
			        	goods.goodsImgUrl = goods.itemNo + '/' + getGoodsImgSize(goods.imgName)
			        })
			        order.statusStr = this.getStateStr(order)
			        order.payWayStr = (order.payWay == '0' ? '货到付款' : (order.payWay == '1' ? '在线支付' : (order.payWay == '2' ? '储值支付' : (order.payWay == '3' ? '积分支付' : (order.payWay == '4' ? '混合支付' : (order.payWay == '5' ? '兑换券' : '支付方式错误'))))))
			        order.createDate = order.createDate.split('.')[0]
			        order.sheetAmt = Number(order.sheetAmt)
			        order.couponsAmt = Number(order.couponsAmt)
			        order.codPayAmt = Number(order.codPayAmt)
			        order.realPayAmt = Number(order.realPayAmt || 0)
			        order.orgiSheetAmt = Number(order.orgiSheetAmt || order.realPayAmt)
			        order.discountAmt = Number(order.discountAmt)
							order.discountsTotalAmt = (order.orgiSheetAmt - order.realPayAmt - (order.vouchersAmt || 0)).toFixed(2)
							order.stockoutAmt = (Number(order.realPayAmt) + Number(order.vouchersAmt) - Number(order.doAmt)).toFixed(2)	// 缺货金额 = 支付金额 + 优惠卷金额 - 出库金额

			        /*
			            1、如果payWay 字段 是  0，并且sheetSource 字段为： "yewuyuan"（平台业务员）或者是   "huozhu" （货主业务员）,就是“未付款"
			            2、如果payWay 字段 是  1或者4 ，支付状态取acctFlag 付款状态 字段的值
			            3、如果payWay 字段是 2或3或5，为 “已付款”状态
			            4、其他 情况都为 “未付款”
			          */
			          //  acctFlag 付款标志：0未付款、1无需付款、2已付款  3付款中
			          let acctFlagStr
			          if (order.payWay == '0' && (order.sheetSource == 'yewuyuan' || order.sheetSource == 'huozhu')) {
			            acctFlagStr = '0'
			          } else if (order.payWay == '1' || order.payWay == '4') {
			            acctFlagStr = order.acctFlag
			          } else if (order.payWay == '2' || order.payWay == '3' || order.payWay == '5') {
			            acctFlagStr = '2'
			          } else {
			            acctFlagStr = '0'
			          }
			          /*
			            已付金额：
			            1、如果支付状态为 “已付款” ，值为 realPayAmt - codPayAmt；
			            2、如果支付状态为 “未付款” 并且payWay = 4 混合支付 ，值为 czPayAmt;
			            3、如果supplyFlag 字段为 5 ，值为 realPayAmt
			            4、其他情况为0
			          */
			          let paymentAmtStr
			          if (acctFlagStr == '2') {
			            paymentAmtStr = (order.realPayAmt - order.codPayAmt).toFixed(2)
			          } else if (acctFlagStr == '0' && order.payWay == '4') {
			            paymentAmtStr = order.czPayAmt
			          } else if (order.supplyFlag == '5') {
			            paymentAmtStr = order.realPayAmt
			          } else {
			            paymentAmtStr = 0
			          }
			          order.paymentAmtStr = paymentAmtStr
			          console.log('order::', order)
			          this.setState({ order })
				}
			},
			complete: () => {
				this.setState({loading:false})
			}
		})
		API.Order.getOrderFlow({
			data:{
				sheetNo: sheet_no
			},
			success: ret => {
				if(ret.code == 0) {
					const orderFlowObj = ret.data || []
			        orderFlowObj.forEach(item => {
			        	item.createDateTime = new Date(item.createDate)
			        	item.createDate = item.createDate.split('.')[0].split(' ')
			        })
			        orderFlowObj.sort((a, b) => a.createDateTime > b.createDateTime)
			        this.setState({ orderFlowObj })
				}
			}
		})
	}
  	getStateStr2(status) {
  		return (status == '2' ? '保存' :
      	(status == '3' ? '已提交申请' :
        (status == '4' ? '退货申请打回' :
        (status == '5' ? '同意申请' :
        (status == '6' ? '已指配给司机' :
        (status == '7' ? '退货回收中' :
        (status == '8' ? '退货完成' :
        (status == '9' ? '退货取消' :'状态错误'))))))))
  	}
	getStateStr(order) {
		const status = order.supplyFlag
	    return (status == '1' ?
	    (order.approveFlag == '0' ? '未提交' : '已提交'):
	    (status =='2'?'已拣货':
	    (status=='3'?'配货完成':
	    (status=='4'?'已取消':
	    (status=='5'?'已完成':
	    (status == '6' ?'拣货中':
	    (status=='7'?'退货中':
	    (status=='8'?'退货完成':
	    (status=='9'?'驳回':
	    (status=='31'?'已装车':
	    (status=='32'?'配送中':
	    (status=='51'?'已完成':'状态错误'))))))))))))
	}
	render(){
		const {config,loading,loadingTitle,orderFlowObj,order,alertConfig,alertShow,orderType,thOrder} = this.state;
		console.log('order:', order)
		const goodsList = order.orderDetails || []
		const yhOrderCancelFlag = config.yhOrderCancelFlag || '1'
		const zcOrderCancelFlag = config.zcOrderCancelFlag || '1'
		const thGoodsList = thOrder.details || []
		const thTotalMoney = thOrder.master || {}
		return (<div className="order-details c_min_w">
			<Loading show={loading} title={loadingTitle} />
			<Alert show={alertShow} config={alertConfig} />
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="订单详情" href="#/user/my" />
			</div>
			<div className="order-details-content c_w c_flex_l1_r2">
				<Menu />
				<div className="c_flex_r2_box">
					{orderType!='TH'?
					<React.Fragment>
					
					<div className="head">
					
						<div className="info">
							<p className="title">订单状态</p>
							<p className="no">订单号: {order.sheetNo}</p>
							<p className="status">{order.statusStr}</p>
							<p className="cnt"><span>支付方式:</span><span>{order.payWayStr}</span></p>
							<p className="cnt"><span>提交时间:</span><span>{order.createDate}</span></p>
							<p className="cnt"><span>备注:</span><span>{order.memo||'暂无备注信息'}</span></p>
						</div>
						<div className="statusList">
							<div className="box">
								{
									orderFlowObj.map((item,index) => (
									<div key={index} className="flow_li">
										<div className="l">
											<p>{item.createDate[0]}</p>
											<p>{item.createDate[1]}</p>
										</div>
										<div className="r">
											<p className="title">{item.status}</p>
											<p className="cont">{item.operDesc}</p>
										</div>
									</div>))
								}
							</div>
							
						</div>
						
					</div>
					
					<div className="goodsList">
						<p className="title ul">
							<span className="li0">商品</span>
							<span className="li1">商品编号</span>
							<span className="li2">商品数量</span>
							<span className="li3">商品单价</span>
							<span className="li4">小计</span>
						</p>
						{
							goodsList.map(goods => (
								<div key={goods.itemNo} className="goods ul">
									<div className="li0">
										<img src={config.goodsUrl + goods.goodsImgUrl} className="icon" />
										<div className="msg">
											<a className="name">{goods.itemType == '2'?'[赠品]':''}{goods.itemName}</a>
											<p className="size">规格: {goods.itemSize}</p>
										</div>
									</div>
									<div className="li1">{goods.itemNo}</div>
									<div className="li2">{goods.yhQty}</div>
									<div className="li3">{goods.itemType=='2'?'免费':('￥'+goods.price)}</div>
									<div className="li4">¥{goods.subAmt}</div>
								</div>
							))
						}
						<div className="payInfo">
							<p>
								<span>商品总额:</span>
								<span>¥{order.orgiSheetAmt}</span>
							</p>
							<p>
								<span>优惠金额:</span>
								<span>¥{order.discountsTotalAmt}</span>
							</p>
							{
								order.doAmt?
								<p>
									<span>缺货金额:</span>
									<span>¥{order.stockoutAmt}</span>
								</p>:''
							}
							<p>
								{/* 应付金额 = realPayAmt - vouchersAmt - stockoutAmt */}
								<span>应付金额:</span>
								<span>¥{order.doAmt ? order.realPayAmt - order.vouchersAmt - order.stockoutAmt : order.realPayAmt - order.vouchersAmt}</span>
							</p>
							<p className="redText">
								<span>已付金额:</span>
								<span>¥{order.paymentAmtStr}</span>
							</p>
							<div className="operationBtn">
								{
									(order.supplyFlag=='3'&&(config.wlStatus=='0'||order.transNo!='YH'))?<div className="btn red" data-type="1"  onClick={this.showAlert}>确定收货</div>:''
								}
								{
									(order.supplyFlag=='1'&&(order.transNo=='YH'?(yhOrderCancelFlag=='1'):(zcOrderCancelFlag=='1')))?<div className="btn black" data-type="0" onClick={this.showAlert}>取消订单</div>:''
								}
								{
									(order.transNo=='YH'&&(order.supplyFlag=='4'||order.supplyFlag=='5'))?<div onClick={this.afreshOrder} className="btn red">重下此单</div>:''
								}
								
							</div>
							
						</div>
						
					</div>
					</React.Fragment>:
					<div className="thOrderDetails">
					
					<div className="head">
						<div className="info" style={{'height':	'140px'}}>
						
							<p className="title">订单状态</p>
							<p className="no">退单ID: {thTotalMoney.operId}</p>
							<p className="status">{this.getStateStr2(thTotalMoney.operType)}</p>
							
							
						</div>
						<div className="statusList" style={{'padding-left':'20px'}}>
							<p className="cnt"><span>退货编号:</span><span>{thTotalMoney.sheetNo}</span></p>
							<p className="cnt"><span>创建时间:</span><span>{thTotalMoney.createDate}</span></p>
							<p className="cnt"><span>生成时间:</span><span>{thTotalMoney.modifyDate}</span></p>
							<p className="cnt"><span>退单商品:</span><span>{thTotalMoney.sheetQty}</span></p>
							<p className="cnt"><span>退单金额:</span><span>{thTotalMoney.sheetAmt}</span></p>
						</div>
					</div>
					
					<div className="goodsList">
						<p className="title ul">
							<span className="li0">商品</span>
							<span className="li1">商品编号</span>
							<span className="li2">商品数量</span>
							<span className="li3">商品单价</span>
							<span className="li4">小计</span>
						</p>
						{
							thGoodsList.map(goods => (
								<div key={goods.itemNo} className="goods ul">
									<div className="li0">
										<div className="icon" style={{"width":'0','height':'30px'}}></div>
										<div className="msg">
											<a className="name">{goods.itemType == '2'?'[赠品]':''}{goods.itemName}</a>
											<p className="size">规格: {goods.itemSize}</p>
										</div>
									</div>
									<div className="li1">{goods.itemNo}</div>
									<div className="li2">{goods.realQty}</div>
									<div className="li3">{goods.avgPrice}</div>
									<div className="li4">¥{goods.subAmt}</div>
								</div>
							))
						}
						<div className="payInfo">
							<p>
								<span>退单金额:</span>
								<span>¥{thTotalMoney.sheetAmt}</span>
							</p>
							
						</div>
						
					</div>
					
					</div>
					}
					
				</div>
			</div>
			<Footer />
		</div>)
	}
}

export default Main;
