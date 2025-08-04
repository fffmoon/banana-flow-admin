<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-28 10:21:23
 * @LastEditTime: 2025-03-28 16:00:53
-->
<script setup lang="ts">
import type { CustomContentMenuOption } from '@ui/BetterUI/ContentMenu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/ui/shadcn/ui/context-menu'

const message = useMessage()

const list: CustomContentMenuOption[] = [
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
            shortcut: '⌘+T',
            handler: () => message.success('权限配置已打开'),
          },
          {
            key: generatedId(),
            label: '角色管理',
            shortcut: '⌘+K',
            handler: () => message.success('角色管理面板'),
          },
        ],
      },
      {
        key: generatedId(),
        label: '审计日志',
        disabled: true,
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
    type: 'divider',
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

function handleSelect(key: string | number, item: CustomContentMenuOption) {
  console.log('选中了', key, item)
}
</script>

<template>
  <FeatureDemo title="右键菜单" content="从shadcn获得灵感，基于提供者的右键菜单。得益于无头组件的优势，支持右边对齐、无障碍等">
    <BSpace vertical>
      <NCard :bordered="false" title="自定义的右键菜单组件V2版本">
        <BSpace vertical>
          <NText class="text-sm">
            支持多种功能，包括分割线、子菜单、自定义事件、无障碍模式、键盘操作等
          </NText>
          <BContentMenu :options="list" @select="handleSelect">
            <div
              class="h-[150px] w-[300px] flex items-center justify-center border rounded-md border-dashed bg-[var(--custom-card-color)] text-sm color-[var(--custom-text-color-1)]"
            >
              在这个区域鼠标右键
            </div>
          </BContentMenu>
        </BSpace>
      </NCard>
      <NCard :bordered="false" title="来自shadcn的右键菜单组件">
        <ContextMenu>
          <ContextMenuTrigger
            class="h-[150px] w-[300px] flex items-center justify-center border rounded-md border-dashed text-sm"
          >
            在这个区域鼠标右键
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Profile</ContextMenuItem>
            <ContextMenuItem>Billing</ContextMenuItem>
            <ContextMenuItem>Team</ContextMenuItem>
            <ContextMenuItem>SubscriptionSubscriptionSubscription</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>
