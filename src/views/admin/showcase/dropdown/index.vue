<script lang='ts' setup>
import type { CustomDropdownOption, Placement } from '@ui/BetterUI'
// 逻辑，处理

const menuItems = ref([
  { label: '选项1', key: '1' },
  { label: '选项2', key: '2' },
  { label: '选项3', key: '3' },
  {
    label: '选项4',
    key: '4',
    children: [
      {
        label: '选项4-1',
        key: '4-1',
        children: [
          { label: '选项4-1-1', key: '4-1-1' },
          { label: '选项4-1-1', key: '4-1-2' },
          { label: '选项4-1-3', key: '4-1-3' },
          {
            label: '选项4-1-4',
            key: '4-1-4',
            children: [
              {
                label: '选项4-1-4-1',
                key: '4-1-4-1',
                children: [
                  {
                    label: '选项4-1-4-1-1',
                    key: '4-1-4-1-1',
                    children: [
                      { label: '选项4-1-4-1-1-1', key: '4-1-4-1-1-1' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { label: '选项4-2', key: '4-2' },
      { label: '选项4-3', key: '4-3' },
      { label: '选项4-4', key: '4-4' },
    ],
  },
  { label: '选项5', key: '5' },
])

const placement: (Placement | '')[] = ['top-start', 'top', 'top-end', 'left-start', '', 'right-start', 'left', '', 'right', 'left-end', '', 'right-end', 'bottom-start', 'bottom', 'bottom-end']

const message = useMessage()

const list: CustomDropdownOption[] = [
  {
    key: generatedId(),
    label: '系统管理',
    icon: useIconRenderer('i-mdi-cog'),
    children: [
      {
        key: generatedId(),
        label: '用户中心',
        children: [
          {
            key: generatedId(),
            label: '权限配置',
            handler: () => message.success('权限配置已打开'),
          },
          {
            key: generatedId(),
            label: '角色管理',
            handler: () => message.success('角色管理面板'),
          },
        ],
      },
      {
        key: generatedId(),
        label: '审计日志',
        handler: () => message.success('查看操作日志'),
      },
    ],
  },
  {
    key: generatedId(),
    label: '订单管理',
    icon: useIconRenderer('i-mdi-cart'),
    children: [
      {
        key: generatedId(),
        label: '交易处理',
        handler: () => message.success('进入交易系统'),
      },
      {
        key: generatedId(),
        label: '售后管理',
        handler: () => message.success('售后工单列表'),
      },
    ],
  },
  {
    key: generatedId(),
    label: '数据分析',
    type: 'divider',
    children: [
      {
        key: generatedId(),
        label: '业务报表',
        handler: () => message.success('生成业务报告'),
      },
      {
        key: generatedId(),
        label: '实时看板',
        handler: () => message.success('打开数据看板'),
      },
    ],
  },
  {
    key: generatedId(),
    label: '系统工具',
    children: [
      {
        key: generatedId(),
        label: 'API调试',
        handler: () => message.success('进入调试控制台'),
      },
      {
        key: generatedId(),
        label: '系统监控',
        handler: () => message.success('查看运行状态'),
      },
    ],
  },
]
</script>

<template>
  <FeatureDemo title="下拉菜单" content="良好的性能优化">
    <BSpace vertical>
      <NCard :bordered="false" title="自定义的下拉菜单">
        <div class="dropdown-content">
          <div v-for="item in placement" :key="item" class="wh-full">
            <template v-if="item">
              <BDropdown class="wh-full" :options="menuItems" :placement="item" trigger="click">
                <NButton class="w-full">
                  {{ item }}
                </NButton>
              </BDropdown>
            </template>
          </div>
        </div>
      </NCard>
      <NCard :bordered="false" title="来自naiveui的下拉菜单">
        <BSpace>
          <NDropdown :options="menuItems" trigger="click">
            <div class="btn">
              你好，我是下拉菜单
            </div>
          </NDropdown>
        </BSpace>
      </NCard>
      <NCard :bordered="false" title="不同的触发方式">
        <BSpace>
          <BDropdown :options="menuItems" trigger="click">
            <NButton>
              点击触发
            </NButton>
          </BDropdown>
          <BDropdown :options="menuItems" trigger="hover">
            <NButton>
              悬浮触发
            </NButton>
          </BDropdown>
        </BSpace>
      </NCard>
      <NCard :bordered="false" title="右键菜单功能">
        <BSpace>
          <BDropdown :options="list" trigger="manual" placement="bottom-start">
            <div
              class="h-[200px] w-[400px] flex items-center justify-center border rounded-md border-dashed bg-[var(--custom-card-color)] text-sm color-[var(--custom-text-color-1)]"
            >
              在这个区域鼠标右键
            </div>
          </BDropdown>
        </BSpace>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>

<style lang='scss' scoped>
.dropdown-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 12px;
}

.manual-box {
  width: 500px;
  height: 400px;
  border: 1px solid #000;
}
</style>
