/*
 * @Author: Qing
 * @Description: 反向代理配置，从vite抽出，方便阅读。目前犹豫要不要将proxy写入到env中
 * @Date: 2024-06-21 20:42:27
 * @LastEditTime: 2026-08-25 17:23:35
 */
export function createProxy() {
  return {
    /* 开发环境 */
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api/, '/api'),
      bypass(req, res, options) {
        if (options.rewrite && req.url) {
          const proxyURL = options.target + options.rewrite(req.url)
          console.log('proxyURL', proxyURL)
          req.headers['x-req-proxyURL'] = proxyURL // 设置未生效
          res.setHeader('x-req-proxyURL', proxyURL) // 设置响应头可以看到
        }
      },
    },
    // 拦截 /static 开头的请求
    '/static': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
    '/ws-api': {
      target: 'ws://localhost:8000',
      ws: true,
      // rewrite: path => path.replace(/^\/ws-api/, '/ws-api'),
    },
  }
}
