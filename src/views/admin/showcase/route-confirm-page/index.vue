<script lang='ts' setup>
import { router } from '@/router'

const route = useRoute()
const routeConfirmStore = useRouteConfirmStore()

const { goToShouldConfirm } = usePageJump(router)
const value = ref(false)

function valueClick(status: boolean) {
  value.value = status
  if (status) {
    routeConfirmStore.addConfirmRoute(route.meta.id)
  }
  else {
    routeConfirmStore.removeConfirmRoute(route.meta.id)
  }
}
valueClick(true)
</script>

<template>
  <FeatureDemo title="页面离开提醒" content="在页面离开时，增加弹窗二次确认，避免因误操作导致当前页面数据清空">
    <BSpace vertical>
      <NCard title="功能演示">
        <BSpace vertical>
          <BSpace>
            <div>打开页面离开提醒功能</div>
            <div>
              <NSwitch :value="value" @update:value="(status: boolean) => valueClick(status)" />
            </div>
          </BSpace>
          <div>
            <NButton @click="goToShouldConfirm('/')">
              打开主页
            </NButton>
          </div>
        </BSpace>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>
