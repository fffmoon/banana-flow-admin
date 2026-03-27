/**
 * @description 判断是否是系统角色 admin、user
 * @author Qing
 * @param {string | string[]} roleCodes - 角色标识、系统角色标识数组
 * @return {boolean} 是否是系统角色
 * @date 2026-02-10 11:05:32
 */
export function isSysRole(roleCodes: string | string[]): boolean {
  if (Array.isArray(roleCodes)) {
    return roleCodes.some(item => isSysRole(item))
  }
  return roleCodes === 'admin' || roleCodes === 'user'
}
