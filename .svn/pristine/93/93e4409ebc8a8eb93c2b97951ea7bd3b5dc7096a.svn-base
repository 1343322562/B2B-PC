import React, {Component} from 'react'
import './page.scss';
import Header from '../../public/header.jsx';
import TopSearch from '../../public/top_search.jsx';
import Footer from '../../public/footer.jsx';
import TopNav from '../../public/top_nav.jsx';
import Menu from '../../public/my_menu.jsx';
import { getCookie,getGoodsImgSize } from '../../public/utils.js';
import API from '../../api'
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			config:{}
		}
	}
	componentDidMount(){/* 初次渲染组件 */
	}
	getConfig (config) {
		this.setState({config})
	}
	render(){
		const { config } = this.state
		return (<div className="order-success c_min_w">
			<div style={{"backgroundColor":"#fff"}}>
				<Header getConfig={this.getConfig.bind(this)} />
				<div className="c_top c_w">
					<a className="c_logo" href="#"></a>
					<span className="c_logo_title">下单成功</span>
				</div>
				<TopNav showBorder={false} contTitle="结算" href="#/user/my" />
			</div>
			<div className="order-success-content c_w">
			111
			</div>
			<Footer />
		</div>)
	}
}

export default Main;
