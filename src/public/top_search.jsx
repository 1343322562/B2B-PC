import React, {Component} from 'react'
import API from '../api'
import { getCookie } from './utils.js';
import { createHashHistory } from 'history';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			searchType:props.defaultType||"0",
			hotKey:[],
			searchCnt:'',
			isChange: false,
			btnList:[],
			list:{},
			listKey:[],
			goodsTotalNum: 0,
			msgTotalNum: 0,
		}
		this.selected = this.selected.bind(this)
		this.getInput = this.getInput.bind(this)
		this.getOpenUrl = this.getOpenUrl.bind(this)
		this.keydown = this.keydown.bind(this)
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.getCartsGoods()
		this.getMsgNum()
	}
	getCartsGoods(){
		const getCarts = this.props.getCarts
		API.Carts.getShoppingCartInfo({
			data: {},
			success: ret => {
				let arr=ret.data||[],
				list=new Object(),
				listKey=new Array();
				let goodsTotalNum = 0
				if(ret.code=='0'){
					let goodsObj = {}
					arr.forEach((shop,i) => {
						shop.datas.forEach((item,z) => {
							let type = shop.sourceType == '0' ? (item.stockType == '0' ? 'cw' : 'dw') : shop.sourceNo ,
							subtotal =Number( (item.realQty * item.price).toFixed(2) );
							item.checked=true;
							item.nowNum=item.realQty;
							goodsTotalNum += item.realQty
							goodsObj[item.itemNo] = item
//							item.imgUrl = item.itemNo+'/'+ getGoodsImgSize(item.picUrl)
							if(list[type]){
								list[type].item.push(item);
				                list[type].totalMoney = Number((list[type].totalMoney + subtotal).toFixed(2));
				                list[type].totalNum += item.realQty;
				                list[type].num++;
							}else{
                				let startPrice =(type == 'cw' ? arr[i].normalTemperature : (type == 'dw' ? arr[i].refrigeration : arr[i].startPrice))||0;
            					list[type] = {
            						sourceName: arr[i].sourceName,
            						startPrice: startPrice,
            						item:[item],
            						totalMoney:subtotal,
            						totalNum: item.realQty,
            						num: 1,
            						index:listKey.length,
            						checked:true
            					};
            					listKey.push(type);
							}
						})
					})
					getCarts && getCarts(goodsObj,this)
				}
				this.setState({goodsTotalNum})
			}
		})
	}
	selected (type) {
		this.setState({
			searchType: type
		})
	}
	getInput (e) {
		let val=e.target.value.trim();
		this.setState({searchCnt:val,isChange: true})
	}
	getMsgNum () {
		return
		const {dbBranchNo: dbranchNo} = this.userObj
		API.My.getCount({
			data:{dbranchNo},
			success: ret => {
				const msgTotalNum = ret.data || 0
				this.setState({msgTotalNum})
			}
		})
	}
	keydown (e) {
		if(e.keyCode==13) {
			const History = createHashHistory()
			let page = this.getOpenUrl()
			History.replace(page.substring(1))
		}
	}
	getOpenUrl (str) {
		const {searchCnt, searchType} = this.state
		return "#/item/search?keyword="+ encodeURI(str||searchCnt)
	}
	render(){
		const {btnList,searchCnt,searchType,goodsTotalNum,msgTotalNum,isChange} = this.state
		const keys = this.props.keys || []
		const defaultContent = searchCnt ||(isChange?'':this.props.defaultContent)
		
		return (<div className="c_top_search">
			{
				btnList.map((item,index)=>(
					<a key={index} className={"c_float_l btnList"+(searchType==index?' c_top_search__searchType--action':'')} onClick={() => this.selected(index)}>{item}</a>
				))
			}
			<div className="c_top_search__box">
				<input name="search"  type="txt" value={defaultContent} onChange={this.getInput} onKeyDown={this.keydown} />
				<a href={this.getOpenUrl()}>搜索</a>
			</div>
			<p className="c_top_search__hotKey">
				{
					keys.map((item,index)=>(
						<a href={this.getOpenUrl(item)} key={index} title={item}>{item}</a>
					))
				}
				
			</p>
			
			<a href="#/user/carts" className="c_top_search__right_carts">
				<span className="text">我的购物车</span>
				{goodsTotalNum?<span className="num">{goodsTotalNum}</span>:''}
				
			</a>
			
			<a href="#/user/message" className="c_top_search__right_msg">
				<span>消息中心</span>
				{msgTotalNum?<span className="num">{msgTotalNum}</span>:''}
			</a>
		</div>)
	}
}

export default Main;
