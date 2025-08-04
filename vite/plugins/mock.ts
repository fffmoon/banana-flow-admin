/*
 * @Author: Qing
 * @Description: mock数据
 * @Date: 2024-06-21 21:04:24
 * @LastEditTime: 2025-04-23 15:52:57
 */
import { viteMockServe } from 'vite-plugin-mock'

export default function setupMockPlugin(env: ImportMetaEnv) {
  const { VITE_MOCK_SW } = env
  return viteMockServe({
    ignore: /^_/,
    mockPath: 'mock', // 明确指定 mock 目录
    localEnabled: VITE_MOCK_SW,
    prodEnabled: VITE_MOCK_SW,
    logger: true,
    injectCode: `
      import { setupProdMockServer } from '../mock/_createProductionServer';
      setupProdMockServer();
      `,
  })
}
