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
		this.getPageData()
	}
	getPageData () {
		const { pageSize } = this.state
		this.setState({loading: true})
		API.My.findSupplyAcclist({
			data:{},
			success: ret => {
				if (ret.code == 0 && ret.data) {
		        	const list = ret.data
		        	list.forEach(item => {
		        		item.createDate = item.createDate.split('.')[0]
		        		item.accNum = item.accNum > 0 ? ('+' + item.accNum) : item.accNum
		    		})
		    		this.setState({pageNum:list.length, list:group(list,pageSize)})
		        }
			},
			complete: () => {
				this.setState({loading: false})
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
		return (<div className="user-integral c_min_w">
			<Loading show={loading} title={loadingTitle} />
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="个人中心" href="#/user/my" />
			</div>
			<div className="user-integral-content c_w c_flex_l1_r2">
				<Menu action="积分" />
				<div className="c_flex_r2_box">
					
					<div className="user-integral-box">
						<p className="title">
							<span>最近积分明细</span>
							<span className="total">当前积分: <b>{integral}</b></span>
						</p>
						<p className="ul list_title">
							<span>时间</span>
							<span>收入/支出</span>
							<span>详细说明</span>
						</p>
						<div className="list_box">
						{
							lists.map(item => (
							<div key={item.id} className="liBlock ul">
								<span>{item.createDate}</span>
								<span>{item.accNum}</span>
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
