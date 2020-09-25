import React, {Component} from 'react'
import { setCookie,clearCookie } from '../../public/utils.js';
import './page.css';
import API from '../../api'
class App extends Component{
	
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {
			changeArr:[false,false],
			msg:"公共场所请注意密码保护，以防造成损失",
			msgType:0,
			user:"",
			pwd:"",
			loginLogo:""
		}
		this.focusStyle=this.focusStyle.bind(this);
		this.getData=this.getData.bind(this);
		this.getLogo=this.getLogo.bind(this);/*获取logo地址*/
		this.login=this.login.bind(this);
		window.onkeydown=function(e){
			e.keyCode=='13'&&this.login();
		}.bind(this)
	}
	componentDidMount(){/* 初次渲染组件 */
		console.log('登录页')
	}
	getLogo(obj){this.setState({loginLogo:obj.loginLogo})}
	focusStyle(e){
		let type=e.type,
		name=e.target.name,
		arr=this.state.changeArr;
		arr[name=='user'?0:1]=type=='focus';
		this.setState({changeArr:arr});
	}
	getData(e) {
		let obj=new Object(),
		name=e.target.name,
		val=e.target.value;
		obj[name]=val;
		this.setState(obj);
	}
	login(){
		let {user, pwd} = this.state
		if(!user.length||!pwd.length){
			this.setState({msgType:1,msg:!user.length?'账号不能为空':'密码不能为空'});
			return;
		}
		clearCookie('USER_INFO')
		API.Login.supplyLoginPwd({
			data:{
				username:user,
				password:pwd
			},
			success: ret => {
				if(ret.code=='0'){
					setCookie('USER_INFO',JSON.stringify(ret.data),(60*24*30))
					this.props.history.replace('/')
				}else{
					this.setState({msgType:1,msg:ret.msg});
				}
			},
			error: err => {
				this.setState({msgType:1,msg:'请求失败，请稍后再试'});
			}
		})
		
		
//		Fun.ajax(
//			baseUrl+"supplymini/supplyLoginPwd.do",
//			"POST",
//			{
//				username:user,
//				password:pwd,
//			},
//			(obj)=>{
//				if(obj.code=='0'){
//					Fun.setCookie('USER_INFO',JSON.stringify(obj.data),(60*24))
//				}else{
//					t.setState({msgType:1,msg:obj.msg});
//				}
//			},
//			(e)=>{
//				t.setState({msgType:1,msg:'请求失败，请稍后再试'});
//			}
//		)
	}
	render(){
		let t=this;
		return (<div className="lg">
			<div className="lg-head c_min_w">
				<p className="c_w">
					<a className="lg-head__logo"></a>
				</p>
			</div>
			<div className="lg-content c_max_w">
			
				<div className="lg-content__right">
					<p className="lg-content__right_title c_t_red">欢迎登录</p>
					<p className={"lg-content__right_msg lg-content__right_msg--"+(t.state.msgType?"error":"warn")}>
						<i>&nbsp;</i>
						<span>{t.state.msg}</span>
					</p>
					<div className={"lg-content__right_form lg-content__right_user"+(t.state.changeArr[0]?" lg-content__right_form--action":"")}>
						<span>&nbsp;</span>
						<div>
							<input onFocus={t.focusStyle} onBlur={t.focusStyle} onChange={t.getData}  name="user" value={t.state.user} placeholder="用户名" type="txt" />
						</div>
					</div>
					<div className={"lg-content__right_form lg-content__right_password"+(t.state.changeArr[1]?" lg-content__right_form--action":"")}>
						<span>&nbsp;</span>
						<div>
							<input onFocus={t.focusStyle} onBlur={t.focusStyle} onChange={t.getData} name="pwd" value={t.state.pwd} placeholder="密码" type="password" />
						</div>
					</div>
					<span className="lg-content__right_submit c_bg_red" onClick={t.login}  style={{'marginTop':'20px'}}>登录</span>
				</div>
			</div>
		</div>)
	}
}

export default App;
