/*
 * @Author: Qing
 * @Description: 反向代理配置，从vite抽出，方便阅读。目前犹豫要不要将proxy写入到env中
 * @Date: 2024-06-21 20:42:27
 * @LastEditTime: 2025-04-23 14:34:29
 */
export function createProxy() {
  return {
    /* 开发环境 */
    /* '/api': {
      target: 'http://192.168.1.120:6100',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      bypass(req, res, options) {
        if (options.rewrite && req.url) {
          const proxyURL = options.target + options.rewrite(req.url);
          console.log('proxyURL', proxyURL);
          req.headers['x-req-proxyURL'] = proxyURL; // 设置未生效
          res.setHeader('x-req-proxyURL', proxyURL); // 设置响应头可以看到
        }
      },
    }, */
    /* 测试环境 */
    /* '/api': {
      target: 'http://127.0.0.1:3000',
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
    }, */
    /* 测试环境 */
    '/api': {
      target: 'http://24.233.0.92:18201',
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
    /* 本地测试环境 */
    /* '/loc': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/loc/, 'loc/'),
      bypass(req, res, options) {
        if (options.rewrite && req.url) {
          const proxyURL = options.target + options.rewrite(req.url)
          console.log('proxyURL', proxyURL)
          req.headers['x-req-proxyURL'] = proxyURL // 设置未生效
          res.setHeader('x-req-proxyURL', proxyURL) // 设置响应头可以看到
        }
      },
    }, */
  }
}
