/**
 * @Author: Qing
 * @description: 转换VITE的环境变量为正确的类型，不允许在vite.config.ts之外的地方中使用，因为会导致按需引入失效的问题
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
