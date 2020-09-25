import React, {Component} from 'react'
import './page.css';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import TopNav from '../../public/top_nav.jsx';
import Sidebar from '../../public/right_sidebar.jsx';
import Footer from '../../public/footer.jsx';
import  '../../public/swiper.min.css' 
import Swiper from 'swiper';
import API from '../../api'
import { getCookie,getGoodsImgSize } from '../../public/utils.js';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			loginLogo:"",
			lbtList:[],
			roundButton: [],
			config:{},
			goodsList:[],
			moduleList: [],
			pageLoading:true
		}
		window.onkeydown=null;
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.getPageData()
	}
	getPageData () {
		const { dbranchNo } = this.userObj
		var For = (data,arr)=> (arr||[]).forEach(i=>{ data.push(i) });
		API.Index.getIndexSetting({
			data:{dbranchNo},
			success: ret => {
				if (ret.code == 0) {
					let data = ret.data||[]
					let lbtList = []
					let roundButton = []
					let goodsList = []
					let moduleList = []
					data.forEach(item=>{
						const type = item.templetType
						if (type == '1') { // 轮播图
							For(lbtList,item.details)
						} else if (type == '2') { // 圆形按钮
							For(roundButton,item.details)
						} else if (type=='6'||type=='5') { // 商品列表
							(item.details||[]).forEach(i =>{
								i.goodsImgUrl = i.connectionNo + '/' + getGoodsImgSize(i.picUrl,1)
								goodsList.push(i)
							})
						} else {
							moduleList.push(item)
						}
					})
					this.setState({
						lbtList,
						roundButton,
						goodsList,
						moduleList
					})
					let sw = new Swiper('.swiper-container',{
						autoplay:3000,
						speed:1000,
						autoplayDisableOnInteraction:false,
						effect :'fade',
						pagination: {
							el: '.swiper-pagination',
						},
						fade: {
						  crossFade:true,
						}
					})
				}
			}
		})
	}
	openPage (item) {
		const {connectionType,supplierNo,connectionNo,btnName} = item
		console.log(connectionType,connectionNo)
		if(connectionType == '2') { // 商品详情
			this.props.history.replace('/item/details?item_type=0&item_no='+connectionNo)
		} else if (connectionType =='3') { // 活动页
			this.props.history.replace('/activity/search?item_type='+connectionType+'&item_no='+connectionNo)
		} else if (connectionType == '1' && connectionNo == '3') { // 首单特价
			this.props.replace.replace('/activity/search?item_type='+connectionType+'&item_no='+connectionNo)
		} else if (connectionType == '7') { // 外部跳转
			window.location.href = connectionNo
		} else if (connectionType=='8') { // 组合促销
			this.props.history.replace('/activity/search?item_type='+connectionType+'&item_no='+connectionNo)
		} else if (connectionType == '1' && connectionNo == '1') { // 优惠券领取
			this.props.history.replace('/user/couponsReceive')
		} else if (connectionType == '9') { // 秒杀
			this.props.history.replace('/activity/seckill')
		} else if (connectionType == '1' && connectionNo == '2') { // 积分兑换
			this.props.history.replace('/integral/search')
		}
		
	}
	getConfig (config) {
		this.setState({config})
	}
	getModule0 (item) {
		const {config} = this.state;
		return (
			<div className="block0" key={item.id}>
				{
					item.details.map(i => (
						<a key={i.id} className="item"><img onClick={()=>{this.openPage(i)}} src={config.indexImgUrl +i.picUrl} className="icon pointer" /></a>
					))
				}
			</div>
		)
	}
	getModule1 (item) {
		const {config} = this.state;
		const styles = item.templetStyle;
		const details = item.details
		return (
			<div className="block1">
				<div className="d1">
					<img onClick={()=>{this.openPage(details[0])}} className="icon pointer" src={config.indexImgUrl +details[0].picUrl} />
				</div>
				<div className="d1">
					<div className="x2">
						<img className="icon pointer" onClick={()=>{this.openPage(details[1])}} src={config.indexImgUrl +details[1].picUrl} />
					</div>
					{
						styles == '1' ?
						<div className="x2">
							<img className="icon pointer" onClick={()=>{this.openPage(details[2])}} src={config.indexImgUrl +details[2].picUrl} />
						</div> :
						<div className="x2">
							<div className="x3"><img className="icon pointer" onClick={()=>{this.openPage(details[2])}} src={config.indexImgUrl +details[2].picUrl} /></div>
							<div className="x3"><img className="icon pointer" onClick={()=>{this.openPage(details[3])}} src={config.indexImgUrl +details[3].picUrl} /></div>
						</div>
					}
				</div>
			</div>
		)
	
	}
	getModule2 (item) {
		const {config} = this.state;
		return (
			<div className="block2" key={item.id}>
				{item.showName == ''?<div className="title"><span className="text">{item.templetName}</span></div>:''}
				<div className="list">
					{
						item.details.map(i=>(
							<img onClick={()=>{this.openPage(i)}}  key={i.id} className="icon pointer" src={config.indexImgUrl +i.picUrl} />
						))
					}
				</div>
			</div>
		)
	}
	getModule3 () {console.log('未知模块')}
	render(){
		let {config,roundButton,lbtList,goodsList,moduleList} = this.state
		return (<div className="ix c_min_w" style={{"display":this.state.pageLoading?'block':'none'}}>
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} />
			</div>
			<div className="ix-content c_w">
				{lbtList.length?
				<div className="ix-content__slideImg">
					<div className="ix-content__slideImg_left c_float_l">
					
						<div className="swiper-container">
							<div className="swiper-wrapper">
								{
									lbtList.map((item,index)=>(
										<div className="swiper-slide" key={index}>
											<a><img onClick={()=>{this.openPage(item)}} src={config.indexImgUrl +item.picUrl}/></a>
										</div>
									))
								}
							</div>
							<div className="swiper-pagination"></div>
						</div>
						
					</div>
					
					
				</div>:''}
				<div className="ix-content__roundButton">
					{
						roundButton.map(item=>(
							<div className="item" onClick={()=>{this.openPage(item)}}  key={item.id}>
								<div className="icon pointer" style={{'backgroundImage':'url('+config.indexImgUrl +item.picUrl+')'}}></div>
								<span className="name">{item.btnName}</span>
							</div>
						))
					}
				</div>
				
				<div className="ix-content__modular">
					{
						moduleList.map(item => {
							const type = item.templetType
							const styles = item.templetStyle
							return this[type == '3'?(styles=='1'||styles=='3'?'getModule1':'getModule0'):(type == '4'?'getModule2':'getModule3')](item)   
						})
					}
				</div>
				
				<div className="ix-content__goodsList">
					{
						goodsList.map(item => (
							<div className="item" onClick={()=>{this.openPage(item)}} key={item.connectionNo}>
								<div className="img pointer" style={{'backgroundImage':'url('+config.goodsUrl+item.goodsImgUrl+')'}}></div>
								<div className="name pointer">{item.itemName}</div>
								<div className="price">
									<span className="now">￥{item.price}</span>
								</div>
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
