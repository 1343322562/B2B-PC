import React, {Component} from 'react'
import API from '../api'
import { getCookie ,backLogin } from '../public/utils.js';
import { createHashHistory } from 'history';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			ywyName:'',
			shopName:'',
			tel:'',
		}
	}
	componentDidMount(){/* 初次渲染组件 */
		this.userObj = JSON.parse(getCookie('USER_INFO')||'{}')
		this.setState({
			shopName: this.userObj.branchName
		})
		this.getConfig()
		this.getPageData();
	}
	quit () {
		backLogin(createHashHistory())
	}
	getConfig () {
		API.Public.getCommonSetting({
			data:{},
			success: ret => {
				if(ret.code==0) {
					let data = ret.data
					let hotSearch =[]
					for(let i=1;i<7;i++){
						const keys = data['searchHotWord'+i]
						keys && hotSearch.push(keys)
					}
					data.hotSearchKey = hotSearch 
					data.goodsUrl = data.picUrl + '/upload/images/bdItemInfo/'
				    data.tgGoodsUrl = data.picUrl + '/upload/images/supplyTeam/'
				    data.zcGoodsUrl = data.picUrl + '/upload/images/bdSupplierItem/'
				    data.zhGoodsUrl = data.picUrl + '/upload/images/spBindItemMaster/'
				    data.indexImgUrl = data.picUrl + '/upload/images/SupplyTemplet/'
					this.props.getConfig(data)
				}
			}
		})
	}
	getPageData(){
		const dbranchNo =  this.userObj.dbBranchNo
		API.Public.findSalesManInfo({
			data:{
				dbranchNo
			},
			success: ret => {
				if(ret.code==0) {
					const data = ret.data
					let obj = {
						ywyName: data.name,
						tel: data.phone,
						shopName: this.userObj.branchName
					}
					this.setState(obj)
				}
			}
		})
	}
	render(){
		const {ywyName,tel,shopName} = this.state
		return (<div className="c_header">
			<div className="c_w c_header__box">
				<span>
					<i className="c_header__box_icon c_header__box_icon--user">&nbsp;</i>
					<a>您的专属服务经理: {ywyName||'无'}</a>
				</span>
				<span>
					<i className="c_header__box_icon c_header__box_icon--tel">&nbsp;</i>
					<a>服务电话: {tel||'无'}</a>
				</span>
				<b>|</b>
				<span>你好</span>
				<span><a className="c_t_red">{shopName}</a></span>
				<b>|</b>
				<span><a href="#/user/my">个人中心</a></span>
				<b>|</b>
				<span><a onClick={this.quit}>退出</a></span>
			</div>
		</div>)
	}
}

export default Main;
