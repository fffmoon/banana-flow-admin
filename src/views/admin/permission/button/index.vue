<script lang='ts' setup>
import { permissionDirective } from '@/directive/vPermission/index'
import { NButton, NTag } from 'naive-ui'
import { h, withDirectives } from 'vue'

const userStore = useUserStore()
const message = useMessage()

const currentPerms = computed(() => userStore.getPerms)
const availablePermissions = ref(['按钮a', '按钮b', '按钮c', '按钮d', '按钮e', '按钮f', '按钮g', '按钮h', '按钮i', '按钮j'])

function togglePermission(perm: string) {
  if (userStore.handlePerms('find', perm)) {
    removePermission(perm)
  }
  else {
    handlePermissionInject(perm)
  }
}

function handlePermissionInject(perm: string) {
  message.success(`权限 ${perm} 已注入`)
  userStore.handlePerms('add', perm)
}

function removePermission(perm: string) {
  userStore.handlePerms('remove', perm)
  message.info(`权限 ${perm} 已移除`)
}

// 重构后的表格列定义
const permissionsColumns = ref([
  {
    title: '权限名称',
    key: 'name',
    render(row: { name: string }) {
      return h('div', `${row.name}`)
    },
  },
  {
    title: '当前状态',
    key: 'status',
    render(row: { name: string }) {
      return h(
        NTag,
        {
          type: currentPerms.value.includes(row.name) ? 'success' : 'error',
          bordered: false,
        },
        { default: () => currentPerms.value.includes(row.name) ? '有权限' : '无权限' },
      )
    },
  },
  {
    title: '受保护按钮',
    key: 'protectedButton',
    render(row: { name: string }) {
      return withDirectives(
        h(
          NButton,
          {
            type: 'primary',
          },
          { default: () => '权限保护按钮' },
        ),
        [[permissionDirective, row.name]],
      )
    },
  },
  {
    title: '权限操作',
    key: 'actions',
    render(row: { name: string }) {
      return h(
        NButton,
        {
          onClick: () => togglePermission(row.name),
        },
        {
          default: () => currentPerms.value.includes(row.name)
            ? `移除 ${row.name} 权限`
            : `添加 ${row.name} 权限`,
          type: () => currentPerms.value.includes(row.name) ? `info` : `info`,
        },
      )
    },
  },
])

// 生成权限表格数据
const permissionsData = computed(() =>
  availablePermissions.value.map(name => ({
    name,
    key: name,
  })),
)
</script>

<template>
  <FeatureDemo title="按钮权限" content="三大权限之一，按钮级别的权限控制" is-fixed-header>
    <BSpace vertical class="wh-full">
      <!-- 权限状态展示 -->
      <NCard title="当前用户权限" class="status-card">
        <div class="flex gap-2">
          <NTag
            v-for="perm in currentPerms" :key="perm" type="success" round size="small" closable
            @close="removePermission(perm)"
          >
            {{ perm }}
          </NTag>
        </div>
        <template #footer>
          共有 {{ currentPerms.length }} 个权限
        </template>
      </NCard>

      <NCard class="flex-1 overflow-hidden">
        <NDataTable
          :columns="permissionsColumns" :data="permissionsData" :bordered="false" :row-key="row => row.name"
          :pagination="false" :style="{ height: `100%` }" flex-height
        />
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>

<style lang="scss" scoped></style>
