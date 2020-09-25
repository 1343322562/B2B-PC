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
import { group , getCookie } from '../../public/utils.js';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			loading: false,
			loadingTitle:'加载中...',
			config:{},
			list:[],
			pageIndex:1,
			pageSize:13,
			pageNum:0,
			integral:0
		}
		this.pageIndexChange = this.pageIndexChange.bind(this)
	}
	pageIndexChange (pageIndex) {
		this.setState({pageIndex})
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.getPageData()
	}
	getPageData () {
		console.log(this.userObj)
		const {dbBranchNo:dbranchNo} = this.userObj
		API.My.findIndexNotice({
			data:{dbranchNo},
			success: ret => {
				console.log(ret)
			}
		})
	}
	getConfig (config) {
		this.setState({config})
	}
	render(){
		const {config,loading,loadingTitle,goodsList,list,pageSize,pageNum,pageIndex,integral} = this.state;
		const lists = list[pageIndex-1]||[]
		const paginationConfig={
			size: pageSize,
			num: pageNum,
			nowIndex: pageIndex,
			change:this.pageIndexChange
		};
		return (<div className="user-message c_min_w">
			<Loading show={loading} title={loadingTitle} />
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="个人中心" href="#/user/my" />
			</div>
			<div className="user-message-content c_w c_flex_l1_r2">
				<Menu action="系统消息" />
				<div className="c_flex_r2_box">
					
					<div className="user-message-box">
						<p className="title">
							<span>系统消息</span>
						</p>
						<p className="ul list_title">
							<span>标题</span>
							<span>时间</span>
							<span>详细说明</span>
						</p>
						<div className="list_box">
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
