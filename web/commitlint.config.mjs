/*
 * @Author: Qing
 * @Description: 提交格式
 * @Date: 2024-06-21 20:09:26
 * @LastEditTime: 2025-01-28 15:08:43
 */
export default {
  ignores: [commit => commit.includes('init')],
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 108],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复
        'perf', // 性能优化
        'style', // 代码格式（不影响代码运行的变动）
        'docs', // 文档变更
        'test', // 增加测试
        'refactor', // 重构（既不是新增功能，也不是修改bug的代码变动）
        'build', // 构建相关的修改
        'ci', // CI 配置相关变更
        'chore', // 其他修改
        'revert', // 回滚到上一个版本
        'wip', // 开发中
        'workflow', // 工作流改进
        'types', // 类型定义文件更改
        'release', // 发布新版本
      ],
    ],
  },
}
