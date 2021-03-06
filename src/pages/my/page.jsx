import React, {Component} from 'react'
import './page.scss';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import Footer from '../../public/footer.jsx';
import TopNav from '../../public/top_nav.jsx';
import Menu from '../../public/my_menu.jsx';
import { getCookie,getGoodsImgSize } from '../../public/utils.js';
import API from '../../api'
import { tim } from '../../public/utils.js'
import { DatePicker, Space } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import 'antd/dist/antd.css';

class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		const userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.state = {
			config:{},
			account:0, // 账户余额
			integral: 0, // 积分
			coupon: 0, // 优惠券
			oftenGoods:[], // 常购商品
			collectionGoods:[], // 收藏商品
			userObj:userObj,
			orderBtn: [
				{name:"代付款",path:"#/user/order?type=1",icon:"dfk"},
				{name:"代收货",path:"#/user/order?type=2",icon:"dsh"},
				{name:"已完成",path:"#/user/order?type=3",icon:"ywc"},
				{name:"已取消",path:"#/user/order?type=4",icon:"yqx"},
				{name:"退货",path:"#/user/order?type=6",icon:"th"},
				{name:"全部订单",path:"#/user/order?type=0",icon:"qb"},
			],
			// 当月订单默认日期
			pickerDate: {
				startDate: tim(0).slice(0,8) + '01',
				endDate: tim(0)
			},
			// 当月订单金额
			currentMonthData: {
				diAmt: 0.0, // 在途
				doAmt: 0.0, // 到货
				drAmt: 0.0, // 退货
			}
		}
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		console.log(this)
		console.log(this.userObj)
		this.getUserInfo()
		this.getOftenGoods()
		this.getCollectionGoods()
		this.getCurrentMonthData()
	}
	// 获取当月订单数据
	getCurrentMonthData(startDate = this.state.pickerDate.startDate, endDate = this.state.pickerDate.endDate) {
		const { username, token, branchNo, branchName, dbBranchNo } = this.userObj
		const _this = this
		API.Order.sheetAmtSearch({
			data: { username, token, branchNo, branchName, dbBranchNo, startDate, endDate },
			success(res) {
				console.log(65,res)
				if(res.code == 0) _this.setState({ currentMonthData: res.data })
			}
		})
	}
	// 改变日期选择框
	onChangePicker(e, dateStrings) {
		console.log(e, dateStrings)
		let pickerDate = { startDate: dateStrings[0], endDate: dateStrings[1] }
		this.setState({ pickerDate })
		this.getCurrentMonthData(dateStrings[0], dateStrings[1])
	}
	getOftenGoods () {
		API.Public.getHotItem({ // 获取常购商品
			data:{},
			success: ret => {
				if (ret.code == 0) {
					const list = ret.data||[]
					list.length && this.getGoodsList(list,'oftenGoods')
				}
			}
		})
	}
	getCollectionGoods() {
		API.Public.searchCollectByBranch({ // 获取收藏商品
			data:{},
			success: ret => {
				if (ret.code == 0) {
					const list = ret.data||[]
					list.length && this.getGoodsList(list,'collectionGoods')
				}
			}
		})
	}
	getGoodsList (list,type) {
		let itemNos = []
		list.forEach(item => {
			itemNos.push(item.itemNo)
		})
		API.Goods.itemSearch({
			data:{
				condition: '',
				modifyDate:'',
				supcustNo:'',
				pageIndex: 1,
				pageSize:2,
				searchItemNos:itemNos.join(','),
				itemClsNo: '',
				itemBrandnos: ""// 品牌筛选
			},
			success: ret => {
				const obj = ret.data || {itemData:[],itemClsQty:0}
				let list = obj.itemData
				let data = {}
				list.forEach(goods => {
					const itemNo = goods.itemNo
					goods.goodsImgUrl = goods.picUrl?itemNo + '/' + getGoodsImgSize(goods.picUrl,1):''
				})
				data[type] = list
				this.setState(data)
			}
		})
	}
	getUserInfo () {
		const {userObj} = this.state
		API.Public.getAccBranchInfoAmt({ // 获取账户余额
			data:{},
			success: ret => {
				if (ret.code == 0) {
					const money = ret.data.czAmt
					this.setState({account:money < 0 ? 0 : money})
				}
			}
		})
		API.My.getBranchPoint({ // 获取积分
			data:{},
			success: ret => {
				if (ret.code==0) {
					this.setState({integral:ret.data||0})
				}
			}
		})
		API.My.getUnusedCouponsSum({ // 优惠券数量
			data:{dbranchNo:userObj.dbBranchNo},
			success: ret => {
				if(ret.code==0) {
					this.setState({coupon:ret.data.couponsCount||0})
				}
			}
		})
	}
	getConfig (config) {
		this.setState({config})
	}
	getOpenUrl (no) {
		return "#/item/details?item_type=0&item_no="+no
	}
	// 跳转当月订单页
	toCOrderClick(e) {
		console.log(e)
	}
	render(){
		const { RangePicker } = DatePicker;
		const {config,orderBtn,userObj,account,integral,coupon,oftenGoods,collectionGoods,pickerDate,currentMonthData} = this.state
		console.log(168,'时间', pickerDate)
		return (<div className="my c_min_w">
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="个人中心" href="#/user/my" />
			</div>
			<div className="my-content c_w c_flex_l1_r2">
				<Menu />
				<div className="c_flex_r2_box">
				
					<div className="head block">
						<p className="title blockTitle">我的钱包</p>
						<div className="info">
							<div className="item">
								<a className="num">{coupon}</a>
								<span className="name">优惠券</span>
							</div>
							<div className="item">
								<a className="num">{account}</a>
								<span className="name">账户余额</span>
							</div>
							<div className="item">
								<a className="num">{integral}</a>
								<span className="name">积分</span>
							</div>
						</div>
						<div className="user">
							<div className="img"></div>
							<p className="name">{userObj.branchName}</p>
							<div className="addr">
								<p>编号: {userObj.dbBranchNo}-{userObj.branchNo}</p>
								<p>地址: {userObj.address}</p>
							</div>
						</div>
					</div>
					
					<div className="l2">
						<div className="order block">
							<div className="blockTitle">
								当月订单
								<Space direction="vertical" size={12}>
									<RangePicker 
										locale={locale}
										defaultValue={[moment(pickerDate.startDate, 'YYYY-MM-DD'), moment(pickerDate.endDate, 'YYYY-MM-DD')]}
										onChange={(e, dateStrings) => this.onChangePicker(e, dateStrings)} 
									/>
								</Space>
							</div>
							<ul className="btn1">
								<li className="item">
									<a href={`#/user/order?type=6&startDate=${pickerDate.startDate}&endDate=${pickerDate.endDate}`}>
										<div className="price">{currentMonthData.doAmt}</div>
										<div>在途金额</div>
									</a>
								</li>
								<li className="item">
									<a href={`#/user/order?type=7&startDate=${pickerDate.startDate}&endDate=${pickerDate.endDate}`}>
										<div className="price">{currentMonthData.diAmt}</div>
										<div>到货金额</div>
									</a>
								</li>
								<li className="item">
									<a href={`#/user/order?type=8&startDate=${pickerDate.startDate}&endDate=${pickerDate.endDate}`}>
										<div className="price">{currentMonthData.drAmt}</div>
										<div>退货金额</div>
									</a>
							</li>
								
							</ul>
						</div>
					</div>

					<div className="l2">
						<div className="order block">
							<p className="blockTitle">我的订单</p>
							<ul className="btn">
								{
									orderBtn.map(item => (
										<li key={item.name} className="item">
											<a href={item.path}>
											<div className={"icon "+item.icon}></div>
											<span className="name">{item.name}</span>
											</a>
										</li>
									))
								}
								
							</ul>
						</div>
					</div>
					<div className="r1">
						{
							collectionGoods.length?
							<div className="collection block">
								<p className="blockTitle">
									<span>收藏商品</span>
									<a href="#/search/actionGoods?type=collection" className="blockMore">更多></a>
								</p>
								<div className="list">
									{
										collectionGoods.map(goods => (
											<div key={goods.itemNo} className="item">
												<a href={this.getOpenUrl(goods.itemNo)}><img src={config.goodsUrl+goods.goodsImgUrl}  className="icon" /></a>
												<p className="goodsName"><a href={this.getOpenUrl(goods.itemNo)}>{goods.itemName}</a></p>
											</div>
										))
									}
									
								</div>
							</div>
							:''
						}
						{
							oftenGoods.length?
							<div className="collection block">
								<p className="blockTitle">
									<span>常购清单</span>
									<a href="#/search/actionGoods?type=often" className="blockMore">更多></a>
								</p>
								<div className="list">
									{
										oftenGoods.map(goods => (
											<div key={goods.itemNo} className="item">
												<a href={this.getOpenUrl(goods.itemNo)}><img src={config.goodsUrl+goods.goodsImgUrl}  className="icon" /></a>
												<p className="goodsName"><a href={this.getOpenUrl(goods.itemNo)}>{goods.itemName}</a></p>
											</div>
										))
									}
									
								</div>
							</div>
							:''
						}
					</div>
				</div>
			</div>
			<Footer />
		</div>)
	}
}

export default Main;
