/**
 * 店铺名称脱敏：第二三个字替换为 **
 * 如 "景成玩具专营店" → "景**具专营店"
 */
export function maskShopName(name) {
  if (!name) return '-'
  const len = name.length
  if (len === 1) return name
  if (len === 2) return name[0] + '*'
  return name[0] + '**' + name.substring(3)
}


/**
 * 店铺ID脱敏：保留前4位和后2位，中间用***
 */
export function maskShopId(id) {
  if (!id) return ''
  const str = String(id)
  if (str.length <= 6) return str
  return str.slice(0, 4) + '***' + str.slice(-2)
}

/**
 * 商品名称脱敏：前15个字替换为 *
 */
export function maskGoodsName(name) {
  if (!name) return ''
  const str = String(name)
  if (str.length <= 15) return '*'.repeat(str.length)
  return '*'.repeat(15) + str.slice(15)
}

export default {
  maskShopName,
  maskShopId,
  maskGoodsName
}
