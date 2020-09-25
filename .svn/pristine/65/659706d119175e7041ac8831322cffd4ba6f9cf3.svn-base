export const deepCopy = (p, c) => { // 深拷贝
	var c = c || {};　
	for(var i in p) {
		if(p[i] && typeof p[i] === 'object') {
			c[i] = (p[i].constructor === Array) ? [] : {};　
			deepCopy(p[i], c[i]);　
		} else {　
			c[i] = p[i];　
		}
	}　
	return c;　
};
export const setCookie = (cname, cvalue, exdays) => { // 设置 cookie缓存 
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}
export const getCookie = (cname) => { // 获取 cookie缓存 
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while(c.charAt(0) == ' ') c = c.substring(1);
		if(c.indexOf(name) != -1) {
			var y = c.substring(name.length, c.length)
			return  (y?((y=='undefined'||y=='null')?'':y):'')
		};
	}
	return "";
}
export const clearCookie = (name) => { // 清除 cookie缓存 
	setCookie(name, null, -1);
}
export const backLogin = (hashHistory) => { // 返回登录页
	const page = '/user/login'
	if (page != hashHistory.location.pathname) {
		clearCookie('USER_INFO')
		hashHistory.replace(page)
	}
}
export const getGoodsImgSize = (url,type = 0) => { // 获取多规格的图片名称
  if (!url)  return ''
  const name = url.indexOf(',') != -1 ? url.split(',')[0] : url
  return name.substring(0,name.indexOf('-')+1) + type + name.substr(name.indexOf('.'))
}
export const setUrlObj = (str) => { // url转obj
  const arr = str.split('&')
  let obj = {}
  arr.map(item => {
    let data = item.split('=')
    obj[data[0]] = data[1]
  })
  return obj
}
export const refreshNowPage = (props,loading) => { // 判断本页面URL改变刷新页面
	props.history.listen((r) => {
		const now = window.beforePagePath||props.location.pathname
		window.beforePagePath =r.pathname
		if(now == r.pathname){
			location.reload()
		}
	})
}
export const toast = (str) => { // 弹出提示框
	var is = document.getElementById('c_toast')
	if (is) return 
	var DIV =document.createElement('div')
	DIV.innerHTML = '<span>'+str+'</span>'
	DIV.id = 'c_toast'
	document.body.appendChild(DIV)
	setTimeout(()=>{
		document.getElementById('c_toast').remove()
	},1800)
}
export const group = (arr, length) => { // 单数组变多数组
	let index = 0
  let newArray = [];
  while(index < arr.length) {
    newArray.push(arr.slice(index, index += length));
  }
  return newArray;
}
export const setNumSize = (num) => { // 0 =》 00
  return (num > 9 ? '' : '0') + num
}
export const getRemainTime = (endTime, deviceTime, serverTime) => { // 获取倒计时
  let t = endTime - Date.parse(new Date()) - serverTime + deviceTime
  let seconds = Math.floor((t / 1000) % 60)
  let minutes = Math.floor((t / 1000 / 60) % 60)
  let hours = Math.floor((t / (1000 * 60 * 60)) % 24)
  let days = Math.floor(t / (1000 * 60 * 60 * 24))
  if ((hours + minutes + seconds) <= 0) {
    return false
  }
  hours += (days * 24)
  return [ setNumSize(hours),setNumSize(minutes),setNumSize(seconds)]
}

// 将日期往前退 currentDay 天
export function tim(currentDay) {
  var time = (new Date).getTime() - currentDay * 24 * 60 * 60 * 1000;
  var tragetTime = new Date(time);
  var month = tragetTime.getMonth();
  var day = tragetTime.getDate();
  tragetTime = tragetTime.getFullYear() + "-" + (tragetTime.getMonth() > 9 ? (tragetTime.getMonth() + 1) : "0" + (tragetTime.getMonth() + 1)) + "-" + (tragetTime.getDate() > 9 ? (tragetTime.getDate()) : "0" + (tragetTime.getDate()));
  console.log(tragetTime, '这是一周前日期，格式为2010-01-01')
  return tragetTime;
}
