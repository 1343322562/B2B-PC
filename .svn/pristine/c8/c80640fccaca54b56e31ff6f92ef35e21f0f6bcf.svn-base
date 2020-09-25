import React, {Component} from 'react'
import './page.scss';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import Footer from '../../public/footer.jsx';
import TopNav from '../../public/top_nav.jsx';
import Menu from '../../public/my_menu.jsx';
import Pagination from '../../public/pagination.jsx';
import Loading from '../../public/pageLoading.jsx';
import API from '../../api'
import { group } from '../../public/utils.js';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			loading: false,
			loadingTitle:'加载中...',
			config:{},
			list:[],
			selectedIndex:0, // 储值记录, 授信明细
			pageIndex:1,
			pageSize:13,
			pageNum:0,
			btnList: [
				'储值记录',
				'授信明细'
			],
			
			
			availableCzAmt:0, // 可订货额度
			minCzAmt:0, // 信用额度
			rebateAmt:0, // 待返利
			czAmt:0, // 账户余额
		}
		this.pageIndexChange = this.pageIndexChange.bind(this)
	}
	pageIndexChange (pageIndex) {
		this.setState({pageIndex})
	}
	componentDidMount(){/* 初次渲染组件 */
		this.getAccBranchInfoAmt()
		this.getPageData(this.state.selectedIndex)
	}
	getPageData (selectedIndex) {
		const {pageSize} = this.state
  		this.setState({loading: true})
  		API.My[selectedIndex?'getAccountFrozenFlow':'getAccountFlow']({
  			data:{},
  			success: ret => {
  				if (ret.code == 0 && ret.data) {
  					let data = ret.data
				    data = data.filter(item => {
				    	const money = (item.busiAmt - (item.busiFrozenAmt||0))
				    	item.busiFrozenAmt =(money > 0?'+':'') + money
				    	item.createDate = item.createDate.split('.')[0]
				    	return money != 0
				    })
					this.setState({ pageNum:data.length, list: group(data,pageSize),selectedIndex,pageIndex:1 })
		        }
  			},
  			complete: ()=> {
  				this.setState({	loading: false  })
  			}
  		})
	}
	getAccBranchInfoAmt () {
		API.Public.getAccBranchInfoAmt({
    		data: {},
    		success: res => {
    			if (res.code == 0 && res.data) {
        			let { availableCzAmt, minCzAmt, rebateAmt, czAmt} = res.data
        			czAmt < 0 && (czAmt = 0)
        			this.setState({ availableCzAmt, minCzAmt, rebateAmt, czAmt})
    			}
    		}
		})
    }
	getConfig (config) {
		this.setState({config})
	}
	render(){
		const {config,loading,loadingTitle,goodsList,list,pageSize,pageNum,pageIndex,availableCzAmt,minCzAmt,rebateAmt,czAmt,btnList,selectedIndex} = this.state;
		const lists = list[pageIndex-1]||[]
		const paginationConfig={
			size: pageSize,
			num: pageNum,
			nowIndex: pageIndex,
			change:this.pageIndexChange
		};
		return (<div className="user-balance c_min_w">
			<Loading show={loading} title={loadingTitle} />
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="个人中心" href="#/user/my" />
			</div>
			<div className="user-balance-content c_w c_flex_l1_r2">
				<Menu action="账户余额" />
				<div className="c_flex_r2_box">
					
					<div className="user-balance-box">
						<div className="head">
							<div className="l">
								<p className="title">我的可用余额</p>
								<span className="money">{czAmt}</span>
							</div>
							<div className="r">
								<div className="item">
									<span>可订货额度(元)</span>
									<span>{availableCzAmt}</span>
								</div>
								<div className="item">
									<span>信用额度(元)</span>
									<span>{minCzAmt}</span>
								</div>
								<div className="item">
									<span>待返利(元)</span>
									<span>{rebateAmt}</span>
								</div>
							</div>
						</div>
						<p className="titleBtn">
							{
								btnList.map((item,index) => (
									<span key={index} onClick={()=>{this.getPageData(index)}} className={"item"+(selectedIndex==index?' action':'')}>{item}</span>
								))
							}
						</p>
						<p className="ul list_title">
							<span>时间</span>
							<span className="center">收入/支出</span>
							<span>单号</span>
							<span>详细说明</span>
						</p>
						<div className="list_box">
						{
							lists.map(item => (
							<div key={item.id} className="liBlock ul">
								<span>{item.createDate}</span>
								<span className="center">{item.busiFrozenAmt}</span>
								<span>{item.subOrderNo}</span>
								<span>{item.memo}</span>
							</div>
							))
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
