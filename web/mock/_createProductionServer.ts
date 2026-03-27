/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-21 20:09:25
 * @LastEditTime: 2025-04-23 16:15:12
 */
import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer'

/*
使用批量导入时，在生产环境会报错，故而手动导入
https://github.com/vbenjs/vite-plugin-mock/issues/108
*/
// const modules = import.meta.glob<Record<string, any>>('./**/*.ts', { eager: true });
/* const mockModules: any[] = [];
Object.keys(modules).forEach((key) => {
  if (key.includes('/_')) {
    return;
  }
  mockModules.push(...modules[key].default);
}); */

import user from './admin/user/index'
import example from './example/index'

const mockModules = [...user, ...example];

export function setupProdMockServer() {
  // console.info('导入mockModules', mockModules);
  createProdMockServer(mockModules)
}
