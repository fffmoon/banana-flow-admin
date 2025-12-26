<script lang='ts' setup>
import { router } from '@/router'

const route = useRoute()
const tabsViewStore = useTabsViewStore()
const asyncRouteStore = useAsyncRouteStore()

const { goToShouldConfirm } = usePageJump(router)

function closeAndToHome() {
  const id = route.meta.id as string
  goToShouldConfirm('/', {
    successCallback: () => {
      setTimeout(() => {
        tabsViewStore.handleCloseTabsView(id)
      }, 200)
    },
  })
}

function handleCloseCurrentPage() {
  const id = route.meta.id as string
  tabsViewStore.handleCloseTabsView(id)
}

const closeHomePageDisabled = computed(() => {
  const homeRoute = asyncRouteStore.getHomeRoute()
  const list = tabsViewStore.getTabsViewList
  if (homeRoute) {
    const findRes = list.find(item => item.id === homeRoute.meta.id)
    return !!findRes
  }
  return false
})

function handleCloseHomePage() {
  const homeRoute = asyncRouteStore.getHomeRoute()
  if (homeRoute) {
    tabsViewStore.handleCloseTabsView(homeRoute.meta.id as string)
  }
}

function handleCloseOthersTabs() {
  const id = route.meta.id as string
  tabsViewStore.handleBatchCloseTabs(id, 'others')
}

function handleCloseLeftTabs() {
  const id = route.meta.id as string
  tabsViewStore.handleBatchCloseTabs(id, 'left')
}

function handleCloseRightTabs() {
  const id = route.meta.id as string
  tabsViewStore.handleBatchCloseTabs(id, 'right')
}

const checkClosableTabs = reactive({
  left: false,
  right: false,
  others: false,
})

watch(() => tabsViewStore.getTabsViewList, () => {
  checkCloseState()
}, { deep: true, immediate: true })

function checkCloseState() {
  const { left, right, others } = tabsViewStore.checkClosableTabs(route.meta.id as string)
  checkClosableTabs.left = left
  checkClosableTabs.right = right
  checkClosableTabs.others = others
}
</script>

<template>
  <FeatureDemo title="标签栏" content="功能类似于浏览器的标签栏，支持右键操作">
    <BSpace vertical>
      <NCard title="打开新标签页">
        <BSpace vertical>
          <div>
            如果目标地址已在标签栏存在，则直接切换并访问。如果目标地址在标签栏不存在，则会在当前标签页后面插入新的标签页。
          </div>
          <div>
            <NButton @click="goToShouldConfirm('/')">
              打开主页
            </NButton>
          </div>
        </BSpace>
      </NCard>
      <NCard title="关闭当前标签页并跳转">
        <BSpace vertical>
          <div>
            关闭当前标签页，同时跳转到新页面。
          </div>
          <div>
            <NButton @click="closeAndToHome">
              关闭当前标签页，同时跳转到主页
            </NButton>
          </div>
        </BSpace>
      </NCard>
      <NCard title="关闭指定标签页">
        <BSpace vertical>
          <div>
            <div>如果当前只有一个标签时，则无法关闭。</div>
            <div>如果关闭的是当前标签页，则会在关闭后跳转至紧邻的标签页。</div>
            <div>如果关闭的目标页面不存在，则无法关闭。</div>
          </div>
          <BSpace>
            <NButton @click="handleCloseCurrentPage">
              关闭当前标签页
            </NButton>
            <NButton :disabled="!closeHomePageDisabled" @click="handleCloseHomePage">
              关闭主页
            </NButton>
          </BSpace>
        </BSpace>
      </NCard>
      <NCard title="关闭非当前标签页">
        <BSpace vertical>
          <div>除了提供关闭非当前标签页的 API 外，还提供了校验 API 。</div>
          <BSpace>
            <NButton :disabled="!checkClosableTabs.others" @click="handleCloseOthersTabs">
              关闭两侧标签页
            </NButton>
            <NButton :disabled="!checkClosableTabs.left" @click="handleCloseLeftTabs">
              关闭左边标签页
            </NButton>
            <NButton :disabled="!checkClosableTabs.right" @click="handleCloseRightTabs">
              关闭右边标签页
            </NButton>
          </BSpace>
        </BSpace>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>
