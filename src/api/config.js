import axios from 'axios';
import qs from 'qs';
import { getCookie,backLogin } from '../public/utils.js';
import { createHashHistory } from 'history';
export default {
	post(url, param) {
		this.ajax('post', url, param)
	},
	get(url, param) {
		this.ajax('get', url, param)
	},
	ajax(type, url, param) {
		param.data.platform = '3'
		let userInfo =  JSON.parse(getCookie('USER_INFO')||'{}')
		const hashHistory = createHashHistory()
		if (userInfo.token) {
			param.data.branchNo = userInfo.branchNo
			param.data.token = userInfo.token
			param.data.username = userInfo.username
		} else {
			hashHistory.location.pathname.indexOf('user')==-1 && backLogin(hashHistory)
		}
//		url = (url.substring(url.indexOf('/'))).replace(new RegExp(/(.do)/g),'.json')
		axios({
//			baseURL: 'http://localhost:9000/json/',
			// baseURL: window.location.origin + '/zksrb2b-web',
			// baseURL: 'https://xcx.wgjnh.com/zksrb2b-web',
			baseURL: 'https://mmj.zksr.cn/zksrb2b-web/',
			// baseURL: 'http://192.168.2.7:8082/zksrb2b-web/',
			// baseURL: 'http://192.168.1.113:8091/zksrb2b-web/',
			url,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			method: type,
			data: qs.stringify(param.data||{}),
		}).then(ret => {
			if(ret.status == 200) {
				let data = ret.data
				if(data && data.code == 2) {
					backLogin(hashHistory)
					return
				} else {
					param.success && param.success(data)
				}
			} else {
				param.error && param.error()
			}
			param.complete && param.complete()
		}).catch(err => {
			param.error && param.error(err)
			param.complete && param.complete()
		})

	}
}