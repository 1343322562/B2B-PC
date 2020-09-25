import React, {Component} from 'react'
class Main extends Component{
	constructor(props){ /* 初次加载 */
		super(props);
		this.state={
			nowIndex:1,
			inputNum:1,
		}
		this.change=this.change.bind(this);
		this.inputChange=this.inputChange.bind(this);
		this.confirm=this.confirm.bind(this);
		let index=this.props.nowIndex;
		this.state.nowIndex=index;
		this.state.inputNum=index;
	}
	componentDidMount(){/* 初次渲染组件 */
	}
	change(e){
		let val=parseInt(e.target.title);
		this.props.change(val);
		this.setState({nowIndex:parseInt(val),inputNum:val})
	}
	inputChange(e){
		let val=e.target.value;
		this.setState({inputNum:val })
	}
	confirm(){
		let val=(this.state.inputNum&&this.state.inputNum!='0')?this.state.inputNum:1;
		((!isNaN(val)&&val)&&val<=this.max)&& this.change({target:{title:parseInt(val)} })
	}
	render(){
		const {num,size} = this.props
		const n = (num/size+'').split('.')
		this.max = Number(n[0])+(n.length>1?1:0)
		let t=this,
		keyArr=new Array(),
		now=t.state.nowIndex,
		max=this.max,
		showNum=5,
		lastShowNum=(showNum-1),
		start=(max>10?((now>=showNum&&(max-now>=lastShowNum))?now-2:(now<showNum?2:max-lastShowNum)):2),
		end=(max>10?((now>=showNum&&(max-now>=lastShowNum))?start+showNum:start+lastShowNum):(max+1));
		for(let i=start;i<end;i++)keyArr.push(i);
		return (<div className="c_pagination">
			<span className="c_pagination__btn" onClick={()=>{ (now-1)&&t.change({target:{title:now-1}}) }}>上一页</span>
			<i onClick={t.change} title="1" className={now==1?'c_pagination__page--action':null}>1</i>
			{
				(now>=showNum&&max>10)?<b>···</b>:null
			}
			{
				keyArr.map((item,index)=>(
					<i onClick={t.change} title={item} className={now==item?'c_pagination__page--action':null} key={item}>{item}</i>
				))
			}
			{
				((max-now)>=(showNum-1)&&max>10)?<b>···</b>:null
			}

			{
				(max>10)?<i onClick={t.change} title={max} className={now==max?'c_pagination__page--action':null}>{max}</i>:null
			}
			<span className="c_pagination__btn" onClick={()=>{ (now<max)&&t.change({target:{title:now+1}}) }}>下一页</span>
			<span>共{max}页 到 第</span>
			<div className="c_pagination__num"><input value={t.state.inputNum} onChange={t.inputChange} type="text" /></div>
			<span>页</span>
			<span className="c_pagination__btn" onClick={t.confirm}>确定</span>
		</div>)
	}
}

export default Main;
