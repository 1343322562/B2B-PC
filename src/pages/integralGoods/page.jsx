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
import API from '../../api'
import { group,getCookie,getGoodsImgSize,toast } from '../../public/utils.js';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			loading: false,
			loadingTitle:'加载中...',
			config:{},
			list:[],
			alertConfig:{},
			pageIndex:1,
			pageSize:13,
			pageNum:0,
			integral:0,
			alertShow:false,
		}
		this.pageIndexChange = this.pageIndexChange.bind(this)
		this.integralGoods = this.integralGoods.bind(this)
	}
	pageIndexChange (pageIndex) {
		this.setState({pageIndex})
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.getPageData()
		this.getIntegral()
	}
	integralGoods (e) {
		const {dbBranchNo: dbranchNo} = this.userObj
		const index = e.currentTarget.dataset.index
		const goods = this.state.list[index]
		if (goods.residueQty <= 0) return
		this.setState({
			alertShow: true,
			alertConfig: {
				title:'温馨提示',
				content:'您确定兑换此商品吗?',
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
							this.setState({loading: true,alertShow:false})
							API.My.submitIntegralStoreGoods({
				            	data: {
				            		data:JSON.stringify([{itemNo:goods.itemNo,size:'1'}]),
				            		itemNos:goods.itemNo,
				            		dbranchNo
				            	},
				            	success: res => {
				              		toast(res.msg)
				              		if (res.code == 0) {
				                		this.getIntegral()
				              		}
				            	},
				            	error: () => {
				              		toast('兑换商品失败，请检查网络是否正常')
				            	},
				            	complete: () => {
				              		this.setState({loading:false})
				            	}
				          	})
						}
					}
				]
			}
		})
	}
	getPageData () {
		const {dbBranchNo: dbranchNo} = this.userObj
		API.My.searchIntegralStoreGoods({
			data:{dbranchNo},
			success: ret => {
				if(ret.code == 0) {
					let list = ret.data||[]
					list.forEach(goods => {
			            goods.goodsImgUrl = goods.itemNo + '/' + getGoodsImgSize(goods.picUrl)
			            if (goods.type == '1' && goods.couponsOutVo) {
			            	let startTime = goods.couponsOutVo.startDate
			              	let endTime = goods.couponsOutVo.endDate
			              	startTime && (goods.couponsOutVo.startTime = startTime.split(' ')[0])
			              	endTime && (goods.couponsOutVo.endTime = endTime.split(' ')[0])
			              	const filterType = goods.couponsOutVo.filterType
			              	goods.cupType = (filterType == '0' ? '商品' : (filterType == '1' ? '类别' : (filterType == '2' ? '品牌' : '全场')))
			            }
			        })
					this.setState({ list })
				}
			}
		})
	}
	getIntegral () {
		const {dbBranchNo: dbranchNo} = this.userObj
		API.My.getBranchPoint({ // 获取积分
			data:{dbranchNo},
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
		const {config,loading,loadingTitle,goodsList,list,pageSize,pageNum,pageIndex,integral,alertConfig,alertShow} = this.state;
		const paginationConfig={
			size: pageSize,
			num: pageNum,
			nowIndex: pageIndex,
			change:this.pageIndexChange
		};
		return (<div className="integral-goods c_min_w">
			<Loading show={loading} title={loadingTitle} />
			<Alert show={alertShow} config={alertConfig} />
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="个人中心" href="#/user/my" />
			</div>
			<div className="integral-goods-content c_w">
				<div className="head">
					<span>剩余积分:</span>
					<span className="money">{integral}</span>
				</div>
				
				<div className="goodsList">
					{
						list.map((item,index) => (
							<div key={item.itemSubno} className="li">
								<div className="img" style={{'backgroundImage':'url('+config.goodsUrl+item.goodsImgUrl+')'}}></div>
								<div className="info">
									<div className="name">{item.itemName}</div>
									<div className="size">规格:{item.itemSize}</div>
									<div className="price">
										<span className="now">{item.salePoint}积分</span>
										<span className="before">￥{item.oldPrice}</span>
									</div>
								</div>
								<div className={"btn"+(item.residueQty>0?'':' null')} onClick={this.integralGoods} data-index={index} >{item.residueQty>0?'兑换':'兑完了'}</div>
							</div>
						))
					}
					
				</div>
			</div>
			<Footer />
		</div>)
	}
}

export default Main;
