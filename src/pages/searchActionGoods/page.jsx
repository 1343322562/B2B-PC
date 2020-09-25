import React, {Component} from 'react'
import './page.scss';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import Footer from '../../public/footer.jsx';
import TopNav from '../../public/top_nav.jsx';
import Menu from '../../public/my_menu.jsx';
import Loading from '../../public/pageLoading.jsx';
import { getGoodsImgSize,setUrlObj } from '../../public/utils.js';
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
			pageTitle:'',
			goodsList:[]
		}
	}
	componentDidMount(){/* 初次渲染组件 */
		const { type } = this.search
		let pageTitle
		if (type == 'often') { // 常购商品 
			pageTitle = '常购清单'
		} else if (type == 'collection') {
			pageTitle = '收藏商品'
		} else {
			this.props.history.replace('/user/my')
		}
		this.setState({pageTitle,loading: true})
		this.getPageData(type)
	}
	getPageData (type) {
		API.Public[type=='often'?'getHotItem':'searchCollectByBranch']({ // 获取常购商品
			data:{},
			success: ret => {
				if (ret.code == 0) {
					const list = ret.data||[]
					list.length && this.getGoodsList(list)
				}
			},
			complete: () => {
				this.setState({loading: false})
			}
		})
	}
	getConfig (config) {
		this.setState({config})
	}
	getGoodsList (list) {
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
				pageSize:1000,
				searchItemNos:itemNos.join(','),
				itemClsNo: '',
				itemBrandnos: ""// 品牌筛选
			},
			success: ret => {
				const obj = ret.data || {itemData:[],itemClsQty:0}
				let goodsList = obj.itemData
				goodsList.forEach(goods => {
					const itemNo = goods.itemNo
					goods.goodsImgUrl = goods.picUrl?itemNo + '/' + getGoodsImgSize(goods.picUrl,1):''
				})
				this.setState({goodsList})
			},
			complete: () => {
				this.setState({loading: false})
			}
		})
	}
	getOpenUrl (no) {
		return "#/item/details?item_type=0&item_no="+no
	}
	render(){
		const {config,loading,loadingTitle,pageTitle,goodsList} = this.state;
		return (<div className="action-goods c_min_w">
			<Loading show={loading} title={loadingTitle} />
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="个人中心" href="#/user/my" />
			</div>
			<div className="action-goods-content c_w c_flex_l1_r2">
				<Menu action={pageTitle} />
				<div className="c_flex_r2_box">
					<p className="conf"></p>
					<div className="goodsList">
						{
							goodsList.map(goods => (
							<div key={goods.itemNo} className="item">
								<a href={this.getOpenUrl(goods.itemNo)} className="img" style={{'backgroundImage':'url('+config.goodsUrl+goods.goodsImgUrl+')'}}></a>
								<a href={this.getOpenUrl(goods.itemNo)} className="name">{goods.itemName}</a>
								<p className="size">商品规格:{goods.itemSize}</p>
								<p className="price">
									<span className="now">¥{goods.price}{goods.specType =='2'?'起':('/'+goods.unit)}</span>
								</p>
							</div>
							))
						}
					</div>
				</div>
			</div>
			<Footer />
		</div>)
	}
}

export default Main;
