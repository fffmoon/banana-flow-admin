<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-16 13:50:23
 * @LastEditTime: 2025-05-21 14:54:25
-->

<script setup lang="ts">
import JsBridgeData from './components/JsBridgeData.vue'
import NaiveuiData from './components/NaiveuiData.vue'
import TableData from './components/TableData.vue'

const tabHeader = [
  { label: '自定义数据', name: 'tab1', component: TableData },
  { label: 'JS桥数据', name: 'tab2', component: JsBridgeData },
  { label: 'naive-ui数据', name: 'tab3', component: NaiveuiData },
]
const tabValue = ref(tabHeader[0].name)

const getCompoent = computed(() => {
  const findRes = tabHeader.find(item => item.name === tabValue.value)
  if (findRes) {
    return findRes.component
  }
  return tabHeader[0].component
})
</script>

<template>
  <FeatureDemo title="主题数据展示" content="方便的使用主题数据" :is-fixed-header="true">
    <NCard class="wh-full" content-class="wh-full">
      <div class="wh-full flex flex-col gap-2">
        <NTabs type="line" :value="tabValue" :on-update:value="(e) => tabValue = e">
          <NTab v-for="tab in tabHeader" :key="tab.name" :name="tab.name">
            {{ tab.label }}
          </NTab>
        </NTabs>
        <div class="flex-1 overflow-hidden">
          <div class="wh-full">
            <component :is="getCompoent" />
          </div>
        </div>
      </div>
    </NCard>
  </FeatureDemo>
</template>
