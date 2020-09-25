import React, {Component} from 'react'
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
	}
	componentDidMount(){/* 初次渲染组件 */
	}
	render(){
		const {show,title}=this.props;
		return (show?<div className="page-loading" >
		<div></div>
		<span>{title}</span>
		</div>:null)
	}
}

export default Main;