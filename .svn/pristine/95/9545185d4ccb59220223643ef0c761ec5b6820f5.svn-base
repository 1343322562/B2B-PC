import React, {Component} from 'react'
import './page.scss';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import Footer from '../../public/footer.jsx';
import TopNav from '../../public/top_nav.jsx';
import Menu from '../../public/my_menu.jsx';
import Pagination from '../../public/pagination.jsx';
import Loading from '../../public/pageLoading.jsx';
import { getCookie,getGoodsImgSize,setUrlObj,group } from '../../public/utils.js';
import API from '../../api'
import { message } from 'antd';

class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		const search = props.location.search
		this.search = search?setUrlObj(search.substr(1)):{}
		const { type ,keyword } = this.search
		console.log(search)
		const selected = type || '0'
		const searchText = keyword?decodeURI(keyword):'';
		this.state = {
			selected,
			searchText,
			loading: false,
			loadingTitle:'加载中...',
			btnList:[
				{name:'全部订单',type:'0'},
				{name:'待付款',type:'1'},
				{name:'待收货',type:'2'},
				{name:'已完成',type:'3'},
				{name:'已取消',type:'4'},
				{name:'退货',type:'6'},
			],  // 7：在途单 8：到货单 9：退款单    
			orderList: [],
			config:{},
			pageIndex:1,
			pageSize:13,
			pageNum:0,
			// 当月订单查询所用数据
			type: type,
			startDate: '',
			endDate: '',
		}
		this.getInput = this.getInput.bind(this)
		this.changeType = this.changeType.bind(this)
		this.pageIndexChange = this.pageIndexChange.bind(this)
	}
	componentDidMount(){/* 初次渲染组件 */
		const { type } = this.search
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		// 当月订单
		if (type == 6 || type == 7 || type == 8) {
			const { startDate, endDate } = this.search
			this.getCurrentMonthOrderData(startDate, endDate)
			return
		}
		this.getPageData()
	}

	// 获取当月订单数据
	getCurrentMonthOrderData(startDate, endDate) {
		const { username, token, branchNo, branchName, dbBranchNo } = this.userObj
		const _this = this
		let { type } = this.search
		type = type == 6 ? 1 : (type == 7 ? 2 : 3)
		API.Order.sheetSearch({
			data: { username, token, branchNo, branchName, dbBranchNo, startDate, endDate, type },
			success(res) {
				console.log(res)
				if (res.code == 0) _this.setState({ orderList: res.data })
			}
		})
	}
	getConfig (config) {
		this.setState({config})
	}
	getInput (e) {
		let searchText = e.target.value.trim()
		this.setState({searchText})
	}
	changeType (e) {
		const {type} = e.target.dataset
		this.setState({selected: type,searchText:''},()=>{
			this.getPageData()
		})
	}
	getPageData () {
		const {selected, searchText,pageSize} = this.state
		this.setState({loading: true,pageIndex:1,pageNum:0})
		API.Order[selected=='6'?'searchReturnOrder':'getOrderList' ]({
			data:{
				supplyFlag:selected,
				condition:searchText,
				dbranchNo:this.userObj.dbBranchNo
			},
			success: ret => {
				console.log(ret)
				if(ret.code == 0) {
					let list = ret.data || []
					this.setState({pageNum: list.length,orderList:group(list,pageSize)})
				} else {
					this.setState({orderList:[] })
				}
			},
			error: ()=> {
				this.setState({orderList:[] })
			},
			complete: () => {
				this.setState({loading: false})
			}
		})
	}
	pageIndexChange (pageIndex) {
		this.setState({pageIndex})
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
	// 搜索当月（当前选择）订单
	searchCurrentOrder () {
		const { searchText, orderList } = this.state
		console.log(146,searchText ,orderList)
		if (!searchText) return message.warning('请输入搜索内容')
		console.log(1)
		let searchList = []
		orderList.sheet.forEach((item, index) => {
			if (searchText == item.sheetNo) searchList.push(item)
		})
		orderList.sheet = searchList 
		this.setState({ orderList })
	}
	getOpenUrl (order) {
		const sheetNo = order.sheetNo||order.master.sheetNo;
		const type = order.sheetNo?"YH":"TH"
		return "#/order/details?sheet_no="+sheetNo+"&order_type="+type;
	}
	render(){
		const {type,config,btnList,selected,searchText,loading,loadingTitle,orderList,pageIndex,pageSize,pageNum} = this.state;
		const { startDate, endDate } = this.search
		let list = []
		if (type == 6 || type == 7 || type == 8) {
			list = orderList.sheet || []
		} else {
			list = orderList[pageIndex-1]||[]
		}
		
		console.log(149,list, orderList, type)
		const paginationConfig={
			size: pageSize,
			num: pageNum,
			nowIndex: pageIndex,
			change:this.pageIndexChange
		};
		return (<div className="order-list c_min_w">
			<Loading show={loading} title={loadingTitle} />
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="个人中心" href="#/user/my" />
			</div>
			<div className="order-list-content c_w c_flex_l1_r2">
				<Menu action="我的订单" />
				<div className="c_flex_r2_box">
				
					<div className="box">
						<div className="head">
							{
								(type == 6 || type == 7 || type == 8) ? (
									<div className='column'>
										<p className="btn item action">{type == 6 ? '未到货' : (type == 7 ? '已到货' : '已退款')}</p>
										<p className="item">开始时间: {startDate}</p>
										<p className="item">结束时间: {endDate}</p>
									</div>
								) : (		
									<p className="btn">
										{
											btnList.map(item => <a onClick={this.changeType} data-type={item.type}  href={"#/user/order?type="+item.type} key={item.name} className={"item"+(item.type==selected?' action':'')}>{item.name}</a>)
										}
									</p>
								)
							}
							<div className="search">
								<div className="form"><input value={searchText} onChange={this.getInput} placeholder="请输入关键词"  /></div>
								{
									(type == 6 || type == 7 || type == 8) ? (
										<a onClick={()=>{this.searchCurrentOrder()}} className="submit"></a>
									) : (
										<a onClick={()=>{this.getPageData()}} href={"#/user/order?keyword="+encodeURI(searchText)+'&type='+selected} className="submit"></a>		
									)
								}
							</div>
						</div>
						<p className="title ul">
							<span className="li0">订单号</span>
							<span className="li1">下单时间</span>
							<span className="li2">状态</span>
							<span className="li3">数量</span>
							<span className="li4">合计</span>
							<span className="li5">操作</span>
						</p>
						<div className="listBox">
							{
								list.length && list.map(order => {
									const sheetNo = order.sheetNo||order.master.sheetNo;
									const amt = order.sheetNo?order.realPayAmt:order.master.sheetAmt
									const sheetQty = order.sheetNo?order.sheetQty:order.master.sheetQty
									let stateStr
									if (type == 6 || type == 7 || type == 8) {
										stateStr = type == 6 ? '未到货' : (type == 7 ? '已到货' : '已退款')
									} else {
										stateStr = order.sheetNo?this.getStateStr(order):this.getStateStr2(order.master.operType)
									}							
									const createDate = (order.createDate||order.master.createDate).split('.')[0]
									return (<div key={sheetNo} className="item ul">
										<div className="li0"><a href={this.getOpenUrl(order)}>{sheetNo}</a></div>
										<div className="li1">{createDate}</div>
										<div className="li2">{stateStr}</div>
										<div className="li3">{sheetQty}</div>
										<div className="li4">¥{amt}</div>
										<div className="li5"><a href={this.getOpenUrl(order)}>查看详情</a></div>
									</div>)
								})
							}
							
						</div>
						{paginationConfig.size<paginationConfig.num?<Pagination {...paginationConfig}  />:''}
						
					</div>
					
					
				</div>
			</div>
			<Footer />
		</div>)
	}
}

export default Main;
