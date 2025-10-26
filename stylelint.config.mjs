/*
 * @Author: Qing
 * @Description: stylelint 配置
 * @Date: 2024-06-21 20:09:26
 * @LastEditTime: 2025-04-01 23:36:59
 */

export default {
  // ================== 基础扩展配置 ==================
  extends: [
    // 标准规则集
    'stylelint-config-standard',
    // SCSS 推荐规则
    'stylelint-config-recommended-scss',
    // Vue 单文件组件支持
    'stylelint-config-recommended-vue',
    // HTML/CSS 校验支持
    'stylelint-config-html',
  ],

  // ================== 插件配置 ==================
  plugins: [
    'stylelint-order', // 属性排序插件
    'stylelint-scss', // SCSS 语法增强
  ],

  // ================== 文件覆盖规则 ==================
  overrides: [
    /* SCSS/CSS/Vue/HTML 文件使用 SCSS 解析器 */
    {
      files: ['**/*.(scss|css|vue|html)'],
      customSyntax: 'postcss-scss',
    },
    // 为 Vue 文件单独指定解析器
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
  ],

  // ================== 核心规则配置 ==================
  rules: {
   'media-query-no-invalid': null, // 关闭基础规则
   'scss/media-feature-value-dollar-variable': 'always', // 强制使用变量
   'media-feature-name-no-vendor-prefix': true, // 允许变量替换
   'media-feature-name-no-unknown': [
     true,
     { ignoreMediaFeatureNames: ['/\\$\\w+/'] } // 允许包含 $ 符号的变量名
   ],
    // >>>>>>>>> SCSS 相关规则 <<<<<<<<<
    'scss/no-global-function-names': null, // 允许使用全局函数名
    'scss/function-no-unknown': [
      true,
      {
        ignoreFunctions: [
          'bp', // 自定义断点函数
          'map.get', // Sass 内置函数
          'map-has-key', // Sass 内置函数
          'theme', // 主题函数 (如 UnoCSS)
          'screen', // Tailwind 相关
          'v-bind', // Vue 绑定函数
          'media',// 媒体查询相关函数
        ],
      },
    ],

    // >>>>>>>>> Vue 深度选择器规则 <<<<<<<<<
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: [
          'deep', // ::v-deep 替代方案
          'global', // ::v-global
        ],
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: [
          'v-deep', // Vue2 深度选择器
          'v-global', // Vue3 全局选择器
          'v-slotted', // 插槽选择器
        ],
      },
    ],

    // >>>>>>>>> 代码风格规则 <<<<<<<<<
    'declaration-colon-space-after': 'always-single-line', // 冒号后空格
    'declaration-colon-space-before': 'never', // 冒号前空格
    'rule-empty-line-before': [ // 规则前空行
      'always',
      { ignore: ['after-comment', 'first-nested'] },
    ],
    'order/order': [ // 属性排序规则
      [
        'dollar-variables', // 变量声明
        'at-rules', // @规则
        'custom-properties', // CSS 变量
        'declarations', // CSS 声明
        'rules', // 普通规则
        {
          type: 'at-rule',
          name: 'supports',
        },
        // 媒体查询
        {
          type: 'at-rule',
          name: 'media',
        },
        {
          type: 'at-rule',
          name: 'include',
          parameter: 'media-up',
        },
        {
          type: 'at-rule',
          name: 'include',
          parameter: 'media-down',
        },
      ],
      { severity: 'warning' },
    ],

    // >>>>>>>>> 功能性规则 <<<<<<<<<
    'at-rule-no-unknown': [ // 允许的 @规则
      true,
      {
        ignoreAtRules: [
          'error', // Sass 错误处理
          'return', // Sass 返回值
          'tailwind', // Tailwind 指令
          'apply', // 原子化 CSS 指令
          'variants', // 状态变体
          'responsive', // 响应式
          'screen', // 断点
          'function', // Sass 函数
          'if', // 条件判断
          'each', // 循环
          'include', // Mixin
          'mixin', // Mixin
          'use', // Sass 模块
          'forward', // Sass 模块转发
        ],
      },
    ],
    'unit-no-unknown': [ // 允许的未知单位
      true,
      { ignoreUnits: ['rpx'] }, // 小程序单位
    ],

    // >>>>>>>>> 禁用规则集 <<<<<<<<<
    'selector-class-pattern': null, // 允许任意类名格式
    'no-empty-source': null, // 允许空文件
    'string-quotes': null, // 不强制引号类型
    'named-grid-areas-no-invalid': null, // 允许非常规网格命名
    'unicode-bom': null, // 禁用 BOM 头校验
    'no-descending-specificity': null, // 允许特异性降序
    'font-family-no-missing-generic-family-keyword': null, // 允许省略字体族
    'function-no-unknown': null, // 允许未知函数，交给 scss/function-no-unknown 处理
    'import-notation': null, // 允许任意导入表示法
    'property-no-vendor-prefix': null, // 允许厂商前缀
    'value-no-vendor-prefix': null, // 允许值使用厂商前缀
  },

  // ================== 忽略文件配置 ==================
  ignoreFiles: [
    '**/*.js', // 忽略 JS 文件
    '**/*.jsx', // 忽略 JSX
    '**/*.tsx', // 忽略 TSX
    '**/*.ts', // 忽略 TypeScript
    'node_modules/**', // 忽略 node_modules
    'dist/**', // 忽略构建输出
  ],
}
