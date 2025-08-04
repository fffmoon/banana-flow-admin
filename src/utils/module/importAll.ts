/*
 * @Author: Qing
 * @Description: 批量导入文件
 * @Date: 2024-06-21 20:09:25
 * @LastEditTime: 2025-01-26 23:40:00
 */
/**
 * @description 按照一定路径规则批量导入文件
 * @param pathRule eg: pathRule =  './modules/*.ts'
 */
export function importAll(pathRule: string) {
  const allModules = import.meta.glob<Record<string, any>>(pathRule, { eager: true })
  const modules = {} as any
  Object.keys(allModules).forEach((path) => {
    const fileName = path.replace(/(.*\/)*([^.]+).*/g, '$2')
    modules[fileName] = allModules[path].default
  })

  return modules
}
