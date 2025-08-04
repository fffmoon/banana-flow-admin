/*
 * @Author: Qing
 * @Description: 依赖注入提取器
 * - 用于在组件的 setup 阶段触发回调
 * - 确保在正确的 Provider 上下文中执行 API 初始化
 * @Date: 2025-05-23 14:38:12
 * @LastEditTime: 2025-05-23 16:55:11
 */
import { useMessage } from '@ui/BetterUI'
import { defineComponent } from 'vue'

export default defineComponent({
  setup(_, { emit }) {
    const messageApi = useMessage()
    emit('init', messageApi)
    return () => h('div', { style: 'display: none;' })
  },
})
