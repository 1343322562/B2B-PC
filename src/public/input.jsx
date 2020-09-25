import React, {Component} from 'react'
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state = {}
	}
	componentDidMount(){/* 初次渲染组件 */
	}
	render(){
		let { value,onChange,onBlur,className,data} = this.props
		if(value||value === 0) {
			this.beforeNum = value
		}
		return (<input type="text" value={value||(this.beforeNum||'0')} data-data={JSON.stringify(data)} onChange={onChange} onBlur={onBlur} className={className} />)
	}
}

export default Main;
