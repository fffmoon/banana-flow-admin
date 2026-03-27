/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-06-21 20:42:27
 * @LastEditTime: 2025-04-08 17:20:31
 */
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { resolvers } from '../../src/ui/BetterUI/resolvers'

export default function autoImport(): any {
  return [
    AutoImport({
      // 包含指定文件类型进行自动导入
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      // 定义要自动导入的模块
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          'naive-ui': ['useDialog', 'useNotification', 'useLoadingBar'],
        },
      ],

      // 自动加载指定目录下的文件
      dirs: [
        'src/hooks/**/index.ts', // react 后遗症，可用 composables 替代
        'src/components/**/index.ts', // 对于组件只导入 index.ts
        'src/store/**/*.ts',
        'src/utils/**/index.ts',
        'src/api/**/index.ts',
        'src/router/**/index.ts',
        'src/constants/**/index.ts',
        'i18n/**/*.ts',
        'src/ui/BetterUI/**/index.ts',
      ],
      defaultExportByFilename: false, // 是否包含文件夹名称，避免命名冲突
      dts: 'types/auto-import.d.ts', // 类型提示文件
    }),

    Components({
      // 自动加载组件
      resolvers: [
        NaiveUiResolver(),
        resolvers,
      ],
      dirs: ['src/components', 'src/layout/ContentLayout'], // 要自动引入组件的目录
      directoryAsNamespace: true, // 是否包含文件夹名称，避免命名冲突
      dts: 'types/auto-import-components.d.ts', // 类型提示文件
    }),
  ]
}
