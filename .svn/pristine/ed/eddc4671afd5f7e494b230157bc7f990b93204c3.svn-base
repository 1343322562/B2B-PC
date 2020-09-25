import React, {Component} from 'react'
import Fun from './utils.js';
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state={
			bottomDetail:""
		}
	}
	getPageData(){
		let t=this;
//		Fun.ajax(
//			baseUrl+"getLoginSetting.do",
//			"POST",
//			{},
//			(obj)=>{
//				if(obj.code=='0'){
//					var detail=obj.data.bottomDetail||'',
//					loginLogo=obj.data.loginLogo,
//					loginPhoto=obj.data.loginPhoto;
//					window.baseImgUrl=loginPhoto.substring(0,loginPhoto.indexOf('images')+7);
//					detail=detail.replace(new RegExp(/(&lt;)/g),'<').replace(new RegExp(/(&gt;)/g),'>');
//					t.setState({bottomDetail:detail})
//					t.props.getData({loginLogo:loginLogo,loginPhoto:loginPhoto});
//				}
//			},
//			(e)=>{
//				console.log('请求错误')
//			}
//		)
	}
	componentDidMount(){/* 初次渲染组件 */
		this.getPageData();
	}
	render(){
		let t=this;
		return (<div></div>)
	}
}

export default Main;
//return (<div className={"c_footer"+(t.props.showBorder?" c_footer--login":"")} dangerouslySetInnerHTML={{__html: t.state.bottomDetail}} ></div>)
