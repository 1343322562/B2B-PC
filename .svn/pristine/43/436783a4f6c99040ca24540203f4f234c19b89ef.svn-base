import React, {Component} from 'react'
import './page.scss';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import Footer from '../../public/footer.jsx';
import TopNav from '../../public/top_nav.jsx';
import Loading from '../../public/pageLoading.jsx';
import API from '../../api'
import { toast,getCookie } from '../../public/utils.js';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			loading: false,
			loadingTitle:'加载中...',
			list:[],
			config:{}
		}
		this.getCoupons = this.getCoupons.bind(this)
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.getPageData()
	}
	getCoupons (e) {
		const { no } = e.currentTarget.dataset
		const {branchNo} = this.userObj
		this.setState({loading:true})
		
		API.My.getCouponsByBatchNo({
	    	data: {
	    		giveOutBatch:no,
	    		giveOutNo: branchNo
	    	},
	      	success: res => {
	        	toast(res.msg)
	      	},
	      	error: () => {
	        	toast('领取失败，请检查网络是否正常')
	      	},
	      	complete: ()=> {
	      		this.setState({loading:false})
	      	}
	    })
	}
	getPageData () {
		const { pageSize } = this.state
		this.setState({loading: true})
		API.My.getCouponsBatchNo({
    		data: {
    		},
      		success: res => {
        		if (res.code == 0) {
          			const list = res.data || []
          			this.setState({ list})
        		}
      		},
      		complete: ()=> {
      			this.setState({loading: false})
      		}
    	})
	}
	getConfig (config) {
		this.setState({config})
	}
	render(){
		const {loading,loadingTitle,list,config} = this.state;

		return (<div className="user-couponsReceive c_min_w">
			<Loading show={loading} title={loadingTitle} />
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="优惠券领取" href="#/user/my" />
			</div>
			<div className="user-couponsReceive-content c_w">
				<p className="title">为您推荐好券</p>
				<ul className="list">
					{
						list.map(item =>(
						<li key={item.giveOutBatch} data-no={item.giveOutBatch} onClick={this.getCoupons}>
							<p className="money"><i>¥</i><span>{item.subAmt}</span></p>
							<p className="msg">全场满{item.limitAmt}元可用</p>
							<a className="btn"></a>
						</li>
						))
					}
				</ul>
			</div>
			<Footer />
		</div>)
	}
}

export default Main;
