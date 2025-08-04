/**
 * @Author: Qing
 * @description: 调整HEX颜色亮度
 * @param {string} color 需要调整的颜色值（支持带#号或不带#号的6位HEX）
 * @param {number} amount 亮度调整百分比（0-100）
 * @returns {string} 调整后的HEX颜色值（带#号）
 */
export function lighten(color: string, amount: number) {
  color = color.includes('#')
    ? color.substring(1, color.length)
    : color
  amount = Math.trunc((255 * amount) / 100)

  return `#${addLight(color.substring(0, 2), amount)}${addLight(
    color.substring(2, 4),
    amount,
  )}${addLight(color.substring(4, 6), amount)}`
}

/**
 * @Author: Qing
 * @description: 调整单个颜色通道亮度
 * @param {string} color 2位HEX颜色通道值
 * @param {number} amount 要增加的亮度值
 * @returns {string} 调整后的2位HEX通道值
 */
function addLight(color: string, amount: number) {
  const cc = Number.parseInt(color, 16) + amount
  const c = cc > 255
    ? 255
    : cc

  return c.toString(16).length > 1
    ? c.toString(16)
    : `0${c.toString(16)}`
}

/**
 * @Author: Qing
 * @description: 验证颜色格式合法性
 * @param {string} bgVal 需要验证的颜色字符串
 * @returns {boolean} 是否为合法颜色格式（支持RGB/RGBA/HEX/HSL/HSLA）
 */
export function CheckIsColor(bgVal) {
  let type = ''
  if (/^rgb\(/.test(bgVal)) {
    // 如果是rgb开头，200-249，250-255，0-199
    type = '^[rR][gG][Bb][\(]([\\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\\s]*,){2}[\\s]*(2[0-4]\\d|25[0-5]|[01]?\\d\\d?)[\\s]*[\)]{1}$'
  }
  else if (/^rgba\(/.test(bgVal)) {
    // 如果是rgba开头，判断0-255:200-249，250-255，0-199 判断0-1：0 1 1.0 0.0-0.9
    type = '^[rR][gG][Bb][Aa][\(]([\\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\\s]*,){3}[\\s]*(1|1.0|0|0.[0-9])[\\s]*[\)]{1}$'
  }
  else if (bgVal.startsWith('#')) {
    // 六位或者三位
    type = '^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$'
  }
  else if (/^hsl\(/.test(bgVal)) {
    // 判断0-360 判断0-100%(0可以没有百分号)
    type = '^[hH][Ss][Ll][\(]([\\s]*(2[0-9][0-9]|360｜3[0-5][0-9]|[01]?[0-9][0-9]?)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*)[\)]$'
  }
  else if (/^hsla\(/.test(bgVal)) {
    type = '^[hH][Ss][Ll][Aa][\(]([\\s]*(2[0-9][0-9]|360｜3[0-5][0-9]|[01]?[0-9][0-9]?)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*,){2}([\\s]*(1|1.0|0|0.[0-9])[\\s]*)[\)]$'
  }
  const re = new RegExp(type)
  return !bgVal.match(re) == null
}
