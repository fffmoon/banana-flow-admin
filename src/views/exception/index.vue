<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

/**
 * 支持的参数
 * - type: 异常类型 (403/404/500)
 * - msg: 自定义错误描述
 * - redirect: 跳转目标路径 (编码后的 URL)
 */

/**
 * 定义异常类型配置
 */
type ErrorType = '403' | '404' | '500'

interface ExceptionConfig {
  status: '403' | '404' | '500'
  title: string
  description: string
  iconClass: string
}

const configMap: Record<ErrorType, ExceptionConfig> = {
  403: {
    status: '403',
    title: '403 禁止访问',
    description: '抱歉，您没有权限访问该页面',
    iconClass: 'i-mdi-lock-outline',
  },
  404: {
    status: '404',
    title: '404 资源不存在',
    description: '抱歉，您访问的页面已丢失',
    iconClass: 'i-mdi-alert-circle-outline',
  },
  500: {
    status: '500',
    title: '500 服务器错误',
    description: '抱歉，服务器出错了，请稍后再试',
    iconClass: 'i-mdi-bug-outline',
  },
}

// 获取当前错误类型
// 示例： /error/404 (params) 和 /error?type=404 (query)
const type = computed<ErrorType>(() => {
  // 优先 props、params (动态路由 /error/:type)
  if (route.params.type)
    return route.params.type as ErrorType
  if (route.query.type)
    return route.query.type as ErrorType

  // 其次取路径最后一段
  const pathSegments = route.path.split('/')
  const lastSegment = pathSegments[pathSegments.length - 1]
  if (['403', '404', '500'].includes(lastSegment)) {
    return lastSegment as ErrorType
  }

  // 默认404
  return '404' as ErrorType
})

// 获取当前错误配置对象
const currentConfig = computed(() => configMap[type.value])

// 自定义错误信息
const customMessage = computed(() => {
  return (route.query.msg as string) || currentConfig.value.description
})

// 重试/返回逻辑
const redirectPath = computed(() => route.query.redirect as string)

function handleBackHome() {
  router.push('/')
}

function handleRetry() {
  if (redirectPath.value) {
    // 解码 URL 并跳转
    router.push(decodeURIComponent(redirectPath.value))
  }
  else {
    // 如果没有重试路径，默认刷新当前页或回退
    router.go(-1)
  }
}
</script>

<template>
  <div class="h-full w-full flex items-center justify-center">
    <NResult :status="currentConfig.status" :title="currentConfig.title" :description="customMessage" size="large">
      <template #footer>
        <div class="flex justify-center gap-4">
          <NButton @click="handleBackHome">
            返回首页
          </NButton>

          <NButton v-if="redirectPath || type === '500'" type="primary" @click="handleRetry">
            {{ redirectPath ? '重新尝试' : '返回上一页' }}
          </NButton>
        </div>
      </template>
    </NResult>
  </div>
</template>
