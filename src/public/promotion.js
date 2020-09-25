export const getAllPromotion = (API, config) => { // 获取全部促销
	let obj = {
		BG: { goods: {}, cls: {}, brand: {}, giftGoods: {} },// 买赠
		BD: { goods: {}, cls: {} },// 捆绑商品
		FS: {},// 首单特价
		MJ: { goods: {}, cls: {}, brand: {} },// 满减
		SD: {},// 单日限购
		ZK: { goods: {}, cls: {}, brand: {} },// 折扣
		MS: {},// 秒杀
		BF: { all: [], goods: {}, cls: {}, brand: {} },// 买满赠      
		MQ: {} // 数量满减
	}
	API.Public.getAllPromotion({
		data: {
			dbranchNo: config.dbBranchNo
		},
		success: ret => {
			if (ret.code == '0') {
				const list = ret.data
				for (let i in list) {
					const item = list[i]
					if (i == 'BG') {
						for (let z in item) {
							let t = z.split('|')
							const k = t[0]
							const l = t[1].split(',')
							const type = (k == '1' ? 'cls' : (k == '2' ? 'brand' : (k == '3' ? 'goods' : '')))
							l.forEach(no => {
								item[z].forEach(goods => {
									const id = goods.id
									const goodsNo = goods.giftNo
									obj.BG[type][no] || (obj.BG[type][no] = {})
									obj.BG[type][no][id] = goodsNo
									obj.BG.giftGoods[goodsNo] || (obj.BG.giftGoods[goodsNo] = {})
									obj.BG.giftGoods[goodsNo][goods.id] = goods
								})
							})
						}
					} else if (i == 'MQ' && Object.keys(item).length) {
						console.log(item)
						for (let index in item) {
							let MQKeys = item[index][0].itemNo.split(',')
							MQKeys.forEach((t, ind) => {
								obj.MQ[t] = {}
								obj.MQ[t].buyQty = item[index][0].buyQty
								obj.MQ[t].subMoney = item[index][0].subMoney
								obj.MQ[t].explain = item[index][0].explain
							})

						}
						console.log(obj.MQ)
						let itemNo = obj[i][item[0]]
					} else if (i == 'SD' || i == 'FS' || i == 'MS') {
						for (let z in item) {
							const goods = item[z]
							obj[i][goods.itemNo] = goods
						}
					} else if (i == 'BD') {
						item.forEach(goods => {
							obj.BD.cls[goods.itemClsno] || (obj.BD.cls[goods.itemClsno] = [])
							obj.BD.cls[goods.itemClsno].push(goods.itemNo)
							goods.isBind = true
							goods.origPrice = goods.bdPsPrice
							goods.unit || (goods.unit = '')
							obj.BD.goods[goods.itemNo] = goods
						})
					} else if (i == 'ZK') {
						item.forEach(goods => {
							const t = goods.filterType
							const type = t == '0' ? 'allDiscount' : (t == '1' ? 'cls' : (t == '2' ? 'brand' : (t == '3' ? 'goods' : 'data')))
							const data = { sheetNo: goods.sheetNo, discount: goods.discount, zkType: type }
							if (t == '0') {
								obj.ZK[type] = data
							} else {
								const value = goods.filterValue.split(',')
								value.forEach(zk => {
									obj.ZK[type][zk] = data
								})
							}
						})
					} else if (i == 'MJ') {
						item.forEach(info => {
							const t = info.filterType
							const type = t == 0 ? 'fullReduction' : (t == '1' ? 'cls' : (t == '2' ? 'brand' : (t == '3' ? 'goods' : 'data')))
							const data = { reachVal: info.reachVal, subMoney: info.subMoney, sheetNo: info.sheetNo }
							if (type == 'fullReduction') {
								obj.MJ[type] || (obj.MJ[type] = [])
								obj.MJ[type].push(data)
							} else {
								const value = info.filterValue.split(',')
								value.forEach(v2 => {
									obj.MJ[type][v2] || (obj.MJ[type][v2] = [])
									obj.MJ[type][v2].push(data)
								})
							}
						})
					} else if (i == 'BF') {
						item.forEach(goods => {
							const t = goods.filterType
							const type = t == '0' ? 'all' : (t == '1' ? 'cls' : (t == '2' ? 'brand' : (t == '3' ? 'goods' : 'data')))
							const itemNos = goods.giftListNo.split('/')
							const num = goods.giftListQty.split('/')
							const name = (goods.giftName || goods.explain).split('/')
							const unit = (goods.giftUnitNo || '个').split('/')
							const itemType = goods.giftType.split('/')
							let data = { sheetNo: goods.sheetNo, explain: goods.explain, data: [], reachVal: goods.reachVal }
							itemNos.forEach((itemNo, i) => {
								data.data.push({ itemNo, num: num[i], itemName: name[i], unit: unit[i], itemType: itemType[i] })
							})
							if (t == '0') {
								obj.BF[type].push(data)
							} else {
								goods.filterValue.split(',').forEach(info => {
									obj.BF[type][info] || (obj.BF[type][info] = [])
									obj.BF[type][info].push(data)
								})
							}
						})
					}
				}
			}
			config.complete && config.complete(obj)
		},
		error: () => {
			config.complete && config.complete(obj)
		}
	})
}

export const getGoodsTag = (goods, promotionObj, type) => { // 获取促销标签
	let obj = {}
	const itemNo = goods.itemNo
	const brandNo = goods.itemBrandno
	const itemClsno = goods.itemClsno
	const BG = promotionObj.BG.cls[itemClsno] ? 'cls' : (promotionObj.BG.brand[brandNo] ? 'brand' : (promotionObj.BG.goods[itemNo] ? 'goods' : false))
	const MJ = promotionObj.MJ.fullReduction ? 'fullReduction' : (promotionObj.MJ.cls[itemClsno] ? 'cls' : (promotionObj.MJ.brand[brandNo] ? 'brand' : (promotionObj.MJ.goods[itemNo] ? 'goods' : false)))
	const ZK = promotionObj.ZK.allDiscount || (promotionObj.ZK.cls[itemClsno] || (promotionObj.ZK.brand[brandNo] || promotionObj.ZK.goods[itemNo] || false))
	const BF = promotionObj.BF.all.length || (promotionObj.BF.cls[itemClsno] || (promotionObj.BF.brand[brandNo] || promotionObj.BF.goods[itemNo] || false))
	if (MJ) obj.MJ = MJ
	if (BG) obj.BG = BG
	if (BF) obj.BF = true

	if (promotionObj.FS[itemNo]) {
		obj.FS = true
		obj.promotionSheetNo = promotionObj.FS[itemNo].sheetNo
		obj.sdMaxQty = promotionObj.FS[itemNo].limitedQty
		const price = promotionObj.FS[itemNo].price
		obj.sdPrice = price
		type || (obj.price = price)
	} else if (promotionObj.MQ[itemNo]) {
		console.log(promotionObj.MQ)
		obj['MQ'] = {}
		obj['MQ'].buyQty = promotionObj.MQ[itemNo].buyQty
		obj['MQ'].subMoney = promotionObj.MQ[itemNo].subMoney
		obj['MQ'].explain = promotionObj.MQ[itemNo].explain
	} else if (promotionObj.SD[itemNo]) {
		obj.SD = true
		obj.promotionSheetNo = promotionObj.SD[itemNo].sheetNo
		const limitedQty = promotionObj.SD[itemNo].limitedQty
		const orderedQty = promotionObj.SD[itemNo].orderedQty
		const price = promotionObj.SD[itemNo].price
		obj.drPrice = price
		obj.limitedQty = limitedQty
		obj.drMaxQty = (limitedQty - orderedQty)
		type || (obj.price = price)
	} else if (ZK) {
		obj.ZK = true
		const price = Number((ZK.discount * (goods.carstBasePrice || goods.price)).toFixed(2))
		type || (obj.price = price)
		obj.zkPrice = price
		obj.zkMaxQty = 99999
		obj.discount = Number((ZK.discount * 10).toFixed(2)) + '折'
		obj.discountNum = ZK.discount
		obj.zkType = ZK.zkType == 'allDiscount' ? '全场' : (ZK.zkType == 'cls' ? '类别' : (ZK.zkType == 'brand' ? '品牌' : '商品'))
		obj.promotionSheetNo = ZK.sheetNo
	}
	if (promotionObj.MS[itemNo]) {
		obj.MS = true
		const price = promotionObj.MS[itemNo].price
		obj.msPrice = price
		obj.promotionSheetNo = promotionObj.MS[itemNo].sheetNo
		const buyQty = promotionObj.MS[itemNo].buyQty
		const limitedQty = promotionObj.MS[itemNo].limitedQty
		obj.msMaxQty = limitedQty > buyQty ? buyQty : limitedQty
		type || (obj.price = price)
	}
	return obj
}
