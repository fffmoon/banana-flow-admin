<script lang='ts' setup>
import { router } from '@/router'

const { goToShouldConfirm } = usePageJump(router)
const route = useRoute()
const asyncRouteStore = useAsyncRouteStore()

const value = ref('')

onActivated(() => {
  console.log('组件激活:', 'page-cache')
})

onDeactivated(() => {
  console.log('组件休眠:', 'page-cache')
})

onMounted(() => {
  console.log('onMounted')
})

function showRoute() {
  console.log('控制台输出所有路由', router.getRoutes())
}

const isKeep = computed(() => {
  return route.meta.keepAlive
})
</script>

<template>
  <FeatureDemo title="页面缓存" content="切换页面不会丢失页面数据">
    <BSpace vertical>
      <NCard title="测试页面缓存功能">
        <BSpace vertical>
          <div>
            在下面的输入框输入内容，切换到其他页面，再切换回来
          </div>
          <div>
            <NInput v-model:value="value" class="settings-input-box" />
          </div>
          <div>
            <NButton @click="goToShouldConfirm('/')">
              打开主页
            </NButton>
          </div>
        </BSpace>
      </NCard>
      <NCard title="调试区域">
        <BSpace vertical>
          <BSpace align="center">
            <div>当前页面是否支持缓存：</div>
            <NTag :type="isKeep ? 'success' : 'error'">
              {{ isKeep ? '支持' : '不支持' }}
            </NTag>
          </BSpace>
          <div>
            <NButton @click="showRoute">
              控制台输出所有路由
            </NButton>
          </div>
        </BSpace>
      </NCard>
      <NCard title="当前所有缓存的页面名称">
        <BSpace vertical>
          <div v-for="(item, idx) in asyncRouteStore.getKeepAliveRouterList" :key="idx">
            {{ item }}
          </div>
        </BSpace>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>
