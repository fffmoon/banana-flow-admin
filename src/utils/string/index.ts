/**
 * 转换驼峰格式为短横线格式（支持数字前加连字符）
 * @example textColor1 → text-color-1
 * @example color2Text → color-2-text
 * @example backgroundColor → background-color
 * @example fontSize2Xl → font-size-2-xl
 * @example 1stColor → -1st-color
 */
export function toKebabCase(str: string): string {
  return str
    // 处理大写字母和数字前加连字符
    .replace(/([A-Z0-9])/g, '-$1')
    // 转换为全小写
    .toLowerCase()
    // 移除开头多余的连字符
    .replace(/^-/, '')
    // 将连续数字间的连字符标准化
    .replace(/(\d)-(\d)/g, '$1$2')
}
