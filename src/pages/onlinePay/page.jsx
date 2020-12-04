import React, {Component} from 'react'
import './page.scss';
import QRCode  from 'qrcode.react'
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import Footer from '../../public/footer.jsx';
import TopNav from '../../public/top_nav.jsx';
import Menu from '../../public/my_menu.jsx';
import Pagination from '../../public/pagination.jsx';
import Loading from '../../public/pageLoading.jsx';
import Alert from '../../public/alert.jsx';
import { getCookie,getGoodsImgSize,setUrlObj,toast, decodeUnicode } from '../../public/utils.js';
import API from '../../api'

import WEPAY_LOGO from '../../images/WePayLogo.png'
import SCAN_CODE from '../../images/scanCode.png'
import CODE_INFO from '../../images/codeInfo.png'
import SCAN_CODE_HELP from '../../images/pc-icon-phone-bg.png'
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);

		// console.log(10, this.search, setUrlObj(search.slice(1)))
		// console.log(decodeURI(search.slice(11)))
		this.state = {
			type: '',
			codeUrl: '',
			orderNo: '',
			amt: ''
		}
	}
	componentDidMount(e){/* 初次渲染组件 */
		console.log('全局',e, this)
		let search = this.props.location.search
		search = search ? setUrlObj(search.substr(1)) : {}
		for(let key in search) {
			search[key] = decodeUnicode(search[key])
		}
		console.log(22, search)
		if (search.type == 'zfb') {
			document.querySelector('body').innerHTML = '跳转中。。。。。。' + search.sHtmlText
			document.forms['alipaysubmit'].submit();
			return;
		}
		this.setState({  
			type: search.type, 
			sHtmlText: search.sHtmlText,
			codeUrl: search.wxPayData,
			orderNo: search.orderNo,
			amt: search.amt
		})
	}
	render(){
		const { codeUrl, orderNo, amt, type, sHtmlText } = this.state
		return (
      <div className="online-pay">
				<div className='pay-container'>
					<div className='pay-content pay-title'>
						<div>收银台</div>
						<div className="pay-a-tag">
							<a className="" href="#/user/my">个人中心</a>
							<span />
							<a className="" href="#/">返回首页</a>
						</div> 
					</div>
					<div className='pay-content pay-info'>
						<div className='pay-sheetno'>订单编号：{orderNo}</div>
						<div className='pay-sheetno'>订单金额：<div className='span'>￥{amt}</div></div>
					</div>
					<div className='pay-content'>
						<img className='pay-logo' src={WEPAY_LOGO} alt=""/>
						<div className='code-box'>
							<div className='wxpay-code-box'>
								<QRCode className='pay-scancode' value={codeUrl} size={210} fgColor="#000000" />
								<img className='pay-codeinfo' src={CODE_INFO} alt=""/>
							</div>
							<div className='wxpay-code-help-box'>
								<img className='wxpay-help' src={SCAN_CODE_HELP} alt=""/>
							</div>
						</div>
					</div>
				</div>
		  </div>
    )
	}
}

export default Main;
