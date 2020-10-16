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
import { getCookie,getGoodsImgSize,setUrlObj,toast } from '../../public/utils.js';
import API from '../../api'

import WEPAY_LOGO from '../../images/WePayLogo.png'
import SCAN_CODE from '../../images/scanCode.png'
import CODE_INFO from '../../images/codeInfo.png'
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
    const search = props.location.search
		this.state = {
		}
	}
	componentDidMount(){/* 初次渲染组件 */
	}
	render(){
		return (
      <div className="online-pay">
				<div className='pay-container'>
					<div className='pay-content pay-title'>
						收银台
					</div>
					<div className='pay-content pay-info'>
						<div className='pay-sheetno'>订单编号：123456789YH</div>
						<div className='pay-sheetno'>订单金额：<div className='span'>￥89.00</div></div>
					</div>
					<div className='pay-content'>
						<img className='pay-logo' src={WEPAY_LOGO} alt=""/>
						<img className='pay-scancode' src={SCAN_CODE} alt=""/>
						<img className='pay-codeinfo' src={CODE_INFO} alt=""/>
					</div>
				</div>
		  </div>
    )
	}
}

export default Main;
