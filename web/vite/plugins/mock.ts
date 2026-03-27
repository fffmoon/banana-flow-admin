/*
 * @Author: Qing
 * @Description: mock数据
 * @Date: 2024-06-21 21:04:24
 * @LastEditTime: 2025-10-26 15:14:20
 */
import { viteMockServe } from 'vite-plugin-mock'

export default function setupMockPlugin(env: ImportMetaEnv) {
  const { VITE_MOCK_SW } = env
  return viteMockServe({
    ignore: /^_/,
    mockPath: 'mock', // 明确指定 mock 目录
    localEnabled: VITE_MOCK_SW,
    prodEnabled: false, // 生产环境不开启 mock，遇到了生产环境下上传报错问题：https://blog.csdn.net/qq_45625778/article/details/151858411
    logger: true,
    injectCode: `
      import { setupProdMockServer } from '../mock/_createProductionServer';
      setupProdMockServer();
      `,
  })
}
