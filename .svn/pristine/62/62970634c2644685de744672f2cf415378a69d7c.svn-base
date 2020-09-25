import React, {Component} from 'react'
import './page.scss';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import Footer from '../../public/footer.jsx';
import TopNav from '../../public/top_nav.jsx';
import Loading from '../../public/pageLoading.jsx';
import Input from '../../public/input.jsx';
import API from '../../api'
import { toast,getCookie,getGoodsImgSize,setNumSize ,getRemainTime ,deepCopy} from '../../public/utils.js';
import { addCarts,contrastStock,changeItemNum } from '../../public/cartsChange.js';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			loading: false,
			loadingTitle:'加载中...',
			list:[],
			config:{},
			selected: 0,
			countDown:{},
			cartsGoods:{}
		}
		this.getCarts = this.getCarts.bind(this)
		this.addCarts = this.addCarts.bind(this)
		this.inputChange = this.inputChange.bind(this)
		this.inputBlur = this.inputBlur.bind(this)
		this.changeGoodsNum = this.changeGoodsNum.bind(this)
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.getPageData()
	}
	getCarts (cartsGoods,root) {
		this.setState({cartsGoods})
		this.cartsRoot = root
	}
	inputChange(e){ /* input 改变数据 */
		let { cartsGoods} = this.state
		const { no } = JSON.parse(e.target.dataset.data)
		const value = parseInt(e.target.value.trim())
		cartsGoods[no].nowNum = isNaN(value)?0:value
		this.setState({cartsGoods})
	}
	inputBlur (e) {
		let {selected,list, cartsGoods} = this.state
		const { no,index } = JSON.parse(e.target.dataset.data)
		const value = parseInt(e.target.value.trim())||0
		const goods = list[selected].item[index]
		if(cartsGoods[no].realQty ==value ) return
		let msg=contrastStock(goods,value)
		let n=msg?(goods.stockQty>goods.maxSupplyQty?goods.maxSupplyQty:goods.stockQty):value;
		if(msg)toast(msg);
		this.addCarts(index,{
			changeNum:n,
			changeType:'one'
		})
	}
	changeGoodsNum(e){ /* 商品数量改变  */
		const {index,type} = e.target.dataset
		let { cartsGoods,selected,list} = this.state
		const goods = list[selected].item[index]
		const no = goods.itemNo
		let n = changeItemNum(goods,cartsGoods[no].realQty||0,type);
		const msg = type ==1?'':contrastStock(goods,n)
		let qty=msg?cartsGoods[no].realQty:n;
		if(msg)toast(msg);
		this.addCarts(index,{
			changeNum:n,
			changeType:'one'
		})
	}
	addCarts (e,change) {
		const {cartsGoods,selected,list} = this.state
		const { branchNo,dbBranchNo } = this.userObj
		const index = change?e:e.target.dataset.index
		const itemObj = deepCopy(list[selected].item[index])
		if (itemObj.stockQty<=0) return
//		||cartsGoods[itemObj.itemNo].>itemObj.stockQty
		console.log(cartsGoods)
		itemObj.origPrice = itemObj.price
		itemObj.price = itemObj.promotionPrice
		let config = {
			goods:itemObj,
			cartsGoods,
			branchNo,
			dbBranchNo,
			success: ret => {
				change || toast('加入购物车成功')
				this.setState({ cartsGoods:ret })
				this.cartsRoot.getCartsGoods()
			},
			error: msg =>  {
				toast(msg)
			},
			complete: () => {
				this.setState({loading: false})
			}
		}
		if(change) {
			for (let i in change) {
				config[i] = change[i]
			}
		}
		this.setState({loading: true})
		addCarts(API,config)
		
	}
	getPageData () {
		this.setState({loading: true})
		API.My.getMsData({
      		data: {},
      		success: res => {
        		if (res.code == 0 && res.data) {
          			this.setListData(res.data)
        		}
      		},
      		complete: () => {
        		this.setState({ loading: false})
      		}
    	})
	}
	setListData (list) {
		const nowTime = +new Date()
    	let nowSelectDate
    	list.forEach((info,index) => {/* tyle 0 已結束   1 開始 2 未開始  */
      		let startTime = info.startDate.split(' ')
      		info.time = [startTime[0].split('-'), startTime[1].split(':')]
      		info.startTime = +new Date(info.startDate)
      		info.endTime = +new Date(info.endDate)
      		info.type = this.getTimeType(info.startTime, info.endTime)
      		if (nowTime < info.endTime && (!nowSelectDate && nowSelectDate != 0)) nowSelectDate = index;
      		const dates = (info.startDate.split('.')[0]).split(' ')
      		const n = dates[0].split('-')
      		const d = dates[1].split(':')
      		info.startDateStr = [(n[1]+'月'+n[2]+'日'),(d[0]+':'+d[1])]
      		info.item.forEach(item => {
        		item.itemImgUrls = item.itemNo + '/' + getGoodsImgSize(item.picUrl)
      		})
    	})
    	console.log(list)
    	this.setState({ list, nowSelectDate:nowSelectDate||0})
    	list.length && this.changeTime()
	}
	getTimeType (start, end) {
		let nowTime = +new Date()
		return (nowTime > end ? '0' : (nowTime > start && nowTime < end ? '1' : '2'))
	}
	changeTime (i) {
		let { list } = this.state
    	this.Time && clearInterval(this.Time);
    	let nowTime = +new Date()
    	this.Time = setInterval(() => {
    		let obj = {}
    		list.forEach((item,index) => {
    			const dateTime = (item.type == '1' ? item.endTime : item.startTime)
    			if (item.type != '0') {
    				const countDown = getRemainTime(dateTime,nowTime,nowTime)
    				obj[index]=countDown
		      		if (!countDown) {
		        		clearInterval(this.Time);
		        		setTimeout(() => {
		          			this.getPageData()
		        		}, 1000)
		      		}
    			}
    		})
    		this.setState({countDown:obj})
    	}, 800)
	}
	getConfig (config) {
		this.setState({config})
	}
	getOpenUrl (no) {
		return "#/item/details?item_type=0&item_no="+no
	}
	render(){
		const {loading,loadingTitle,list,config,countDown,selected,cartsGoods} = this.state;
		const lists = list[selected]?list[selected].item  : []
		return (<div className="activity-seckill c_min_w">
			<Loading show={loading} title={loadingTitle} />
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<TopSearch getCarts={this.getCarts} keys={config.hotSearchKey} />
				</div>
				<TopNav showBorder={false} contTitle="优惠券领取" href="#/user/my" />
			</div>
			<div className="activity-seckill-content c_w">
				<p className="title">秒杀专区</p>
				<div className="dateList">
					{
						list.map((item,index) => ( // type 0 已結束   1 開始 2 未開始 
							<div onClick={()=>{this.setState({selected:index})}} key={index} className={"item"+(selected == index?' act':'')+(item.type!='1'?' null':'')}>
								<div className="l">
									<span className="t">{item.startDateStr[1]}</span>
									<span className="d">{item.startDateStr[0]}</span>
								</div>
								<div className="r">
									{
										item.type !='1'?<span>{item.type == '2'?'即将开始':'已结束'}</span>:
										<React.Fragment>
											<span>正在秒杀</span>
											<span>距结束 {countDown[index]?countDown[index].join(':'):''}</span>
										</React.Fragment>
									}
								</div>
							</div>
						))
					}
					
					
				</div>
				
				<div className="goodsList">
					{
						lists.map((goods,index) => (
						<div className="item" key={goods.itemNo}>
							<a href={this.getOpenUrl(goods.itemNo)} className="img" style={{"backgroundImage":"url("+config.goodsUrl+goods.itemImgUrls+")"}}></a>
							<p className="name">{goods.itemName}</p>
							<p className="price">
								<span className="now">¥{goods.promotionPrice}/{goods.unit}</span>
								<span className="before">¥{goods.price}</span>
							</p>
							<p className="stock"><span>仅剩:</span><span>{goods.buyQty}</span></p>
							
							{
								cartsGoods[goods.itemNo]?
								<div className="form">
									<Input type="text" onBlur={this.inputBlur} onChange={this.inputChange} data={{no:goods.itemNo,index:index}} value={cartsGoods[goods.itemNo].nowNum} className="input" />
									<div className="changeBtn">
										<span className="add" data-type="0" data-index={index} onClick={this.changeGoodsNum}></span>
										<span className="minus" data-type="1" data-index={index} onClick={this.changeGoodsNum}></span>
									</div>
								</div>:
								<a onClick={this.addCarts} data-index={index} className={"btn"+(goods.stockQty>0?' act':'')}>{goods.stockQty<=0?"抢光了":"立即抢购"}</a>
							}
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
