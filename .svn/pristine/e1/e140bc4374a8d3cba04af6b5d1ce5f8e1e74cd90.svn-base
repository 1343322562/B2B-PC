import React, {Component} from 'react'
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {}
	}
	componentDidMount(){/* 初次渲染组件 */
	}
	render(){
		const { show, config } = this.props
		return (show?<div className="c_alert_mask"><div className="c_alert">
			{
				config.title?<p className="title">{config.title}</p>:''
			}
			<div className="content">{config.content}</div>
			<div className="btn">
				{
					config.btn.map((item,index) => <div key={index} onClick={item.callback}>{item.name}</div>)
				}
			</div>
		</div></div>:'')
	}
}

export default Main;
