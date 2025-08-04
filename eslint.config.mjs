/*
 * @Author: Qing
 * @Description: eslint 配置
 * @Date: 2025-01-27 01:56:27
 * @LastEditTime: 2025-03-19 19:37:30
 */
import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2, // 缩进风格
    quotes: 'single', // 单引号
  },
  typescript: true,
  vue: true,
  prettier: true,
  unocss: true,
  strict: true,
  jsonc: false,
  yaml: false,
  ignores: [
    '*.sh',
    'node_modules',
    '*.md',
    '*.woff',
    '*.ttf',
    '.vscode',
    '.idea',
    'dist',
    'public',
    'docs',
    '.husky',
    '.local',
    'bin',
    'mock/**',
    'Dockerfile',
    'types/auto-import-components.d.ts',
    'types/auto-import.d.ts',
    'log',
    'src/views/pano/**',
    'src/lib/**',
    'src/components/ui/**',
    'src/views/demo/**',
  ],
  // 自定义规则
  rules: {
    'node/prefer-global/process': 'off', // 禁用 全局的 process 变量
    'no-console': ['warn', {
      allow: ['warn', 'error', 'log', 'info'], // 添加允许的 console
    }],
    'no-new': 'off', // 禁用 no-new 规则

    // 强制组件名使用 PascalCase
    'vue/component-name-in-template-casing': ['error', 'PascalCase', {
      registeredComponentsOnly: false,
      ignores: ['/^icon-/', '/^Icon[A-Z]/'], // 允许图标组件例外
    }],
    // 与 antfu 预设的兼容性调整
    'vue/block-order': ['error', {
      order: ['script', 'template', 'style'],
    }],
    // 关闭自闭合强制规则，影响到布局
    'vue/html-self-closing': 'off',
  },
})
