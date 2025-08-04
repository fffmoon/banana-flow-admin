/**
 * @Author: Qing
 * @description: 转换VITE的环境变量为正确的类型
 * @param env 原来的环境
 * @return 正确类型的环境
 */
export function useEnv(env: Recordable): ImportMetaEnv {
  const ret: any = {}

  for (const envKey of Object.keys(env)) {
    let envValue = env[envKey]

    // 转成正确的布尔类型
    envValue = envValue === 'true'
      ? true
      : envValue === 'false'
        ? false
        : envValue

    // VITE_PORT 转成 number
    if (envKey === 'VITE_PORT') {
      envValue = Number.parseInt(envValue)
    }

    ret[envKey] = envValue
  }

  return ret
}
