/**
 * 店铺名称脱敏：第二个字替换为 *
 * 如 "景澄玩具专营店" → "景*玩具专营店"
 */
export function maskShopName(name) {
  if (!name) return ''
  const str = String(name)
  if (str.length <= 1) return str
  return str[0] + '*' + str.slice(2)
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
