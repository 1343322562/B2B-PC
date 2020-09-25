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
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			loading: false,
			loadingTitle:'加载中...',
			btnList:[ '未使用','已使用','已过期'],
			selected:0,
			datas:[],
			config:{},
			pageIndex:1,
			pageSize:18,
			pageNum:0
			
		}
		this.pageIndexChange = this.pageIndexChange.bind(this)
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.getPageData()
	}
	getConfig (config) {
		this.setState({config})
	}
	getMsgInfo (item) {
		let msg = []
		if(!item.filterType&&item.filterType!='0') {
			msg.push('全场可享用优惠券。')
		} else {
			msg.push('仅限已下'+(item.filterType=='0'?'商品':(item.filterType=='1'?'类别':'品牌')+'使用:'))
			let list = item.filterData||[]
			let n = []
			list.forEach(i => n.push(i.filterName))
			n.length&&msg.push(n.join(','))
		}
		return msg.join('')
	}
	getPageData () {
		const { dbBranchNo: dbranchNo} = this.userObj
		const {pageSize} = this.state
    	API.Public.searchSupplyCoupons({
      		data: { data: '', dbranchNo},
      		success: res => {
        		if (res.code == 0) {
          			let list = [[],[],[]]
          			const data = res.data || []
          			const nowTime = +new Date()
          			data.forEach(item => {
            			const status = item.status // 0 作废  1 未发送 2 已发送 3已使用
            			item.startDateStr = item.startDate.split(' ')[0].replace(new RegExp(/(-)/g), '.');
            			item.endDateStr = item.endDate.split(' ')[0].replace(new RegExp(/(-)/g), '.');
            			item.msgInfo = item.instructions || this.getMsgInfo(item)
            			list[status == '3' ? 1 : (status == '2' && nowTime < (+new Date(item.endDate))) ? 0 : 2].push(item)
          			})
          			let datas = []
          			list.forEach(item => {
          				datas.push({
          					pageNum: item.length,
          					list: group(item,pageSize)
          				})
          			})
          			this.setState({ datas  })
          			console.log(datas)
        		}
      		}
    	})
	}
	pageIndexChange (pageIndex) {
		this.setState({pageIndex})
	}
	render(){
		const {config,btnList,loading,loadingTitle,pageIndex,pageSize,selected,datas} = this.state;
		const ul = datas[selected]
		const list = ul?ul.list[pageIndex-1]:[]
		const paginationConfig={
			size: pageSize,
			num: ul?ul.pageNum:0,
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
			<div className="coupon-list-content c_w c_flex_l1_r2">
				<Menu action="优惠券" />
				<div className="c_flex_r2_box">
				
					<div className="box">
						<div className="head">
							<p className="btn">
								{
									btnList.map((item,index) => <a onClick={()=>{this.setState({selected:index,pageIndex:1})  }} key={index} className={"item"+(index==selected?' action':'')}>{item}</a>)
								}
							</p>
						</div>
						<div className="list">
							{
								list.map(item => (
								<div key={item.couponsNo} className={"li"+((item.status=='2'&&!selected)?' act':'')}>
									<div className="info">
										<p className="money"><i>¥</i><span>{item.subAmt}</span></p>
										<p className="msg">满{item.limitAmt}可用</p>
									</div>
									<div className="explain">
										<p className="name">满{item.limitAmt}元减{item.subAmt}元</p>
										<p className="date">{item.startDateStr}-{item.endDateStr}</p>
										<p className="msg"><span>使用说明</span><i title={item.msgInfo}></i></p>
										{(item.status=='2'&&!selected)?<a href="#" className="btn">去使用</a>:''}
									</div>
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
