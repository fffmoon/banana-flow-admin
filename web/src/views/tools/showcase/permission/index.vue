<script lang='ts' setup>

const userStore = useUserStore()
const message = useMessage()

// =======================
// 1. 用户切换逻辑
// =======================
const userList = [
  {
    title: '超级管理员',
    desc: '拥有所有权限 (Super Admin)',
    username: 'superAdmin',
    role: ['admin', 'editor'],
    avatar: 'S',
    color: '#d03050'
  },
  {
    title: '管理员',
    desc: '拥有大部分权限 (Admin)',
    username: 'admin',
    role: ['admin'],
    avatar: 'A',
    color: '#2080f0'
  },
  {
    title: '普通用户',
    desc: '仅查看权限 (User)',
    username: 'user',
    role: ['user'],
    avatar: 'U',
    color: '#18a058'
  }
]

const currentUser = computed(() => userStore.userInfo?.username || '未知')
const loadingLogin = ref<string>('')

async function handleSwitchUser(user: typeof userList[0]) {
  loadingLogin.value = user.username
  try {
    await userStore.logout()
    await userStore.login('accountName', { username: user.username, password: '123456' }, { redirect: '/showcase/permission' })

    message.success(`已切换为 ${user.title}，路由与菜单已更新`)

  } catch (error) {
    message.error('切换失败')
  } finally {
    loadingLogin.value = ''
  }
}

// =======================
// 2. 按钮权限逻辑 (v-perm)
// =======================
const testPermissionCode = 'system:btn:delete' // 演示用的权限码
const hasTestPerm = computed(() => userStore.getPerms.includes(testPermissionCode))

function toggleLocalPermission() {
  if (hasTestPerm.value) {
    userStore.handlePerms('remove', testPermissionCode)
    message.warning(`模拟后端：移除了 [${testPermissionCode}] 权限`)
  } else {
    userStore.handlePerms('add', testPermissionCode)
    message.success(`模拟后端：下发了 [${testPermissionCode}] 权限`)
  }
}

// =======================
// 3. 接口鉴权逻辑
// =======================
const apiLog = ref<string[]>([])
const apiLoading = ref(false)

async function testApiPermission() {
  apiLoading.value = true
  const time = new Date().toLocaleTimeString()
  try {
    // 调用实际接口
    // const res = await API.system.roles.getRoleList()

    // 模拟接口调用 (如果你的环境中 API 未定义，请解开上面的注释并注释下面的模拟代码)
    // 这里为了演示代码不报错，做了一个模拟检查
    if (typeof API !== 'undefined' && API.system && API.system.roles) {
      await API.system.roles.getRoleList()
      apiLog.value.unshift(`[${time}] 200 OK: 成功获取角色列表数据`)
      message.success('接口调用成功，拥有该接口权限')
    } else {
      // 模拟: 如果是 user，模拟失败，否则成功
      await new Promise(resolve => setTimeout(resolve, 500))
      if (currentUser.value === 'user') {
        throw new Error('403 Forbidden')
      }
      apiLog.value.unshift(`[${time}] 200 OK: 成功获取角色列表数据 (模拟)`)
      message.success('接口调用成功')
    }
  } catch (error: any) {
    apiLog.value.unshift(`[${time}] Error: ${error.message || '接口访问被拒绝'}`)
    // 注意：axios 拦截器通常会自动弹出 message，这里仅做日志展示
  } finally {
    apiLoading.value = false
  }
}

function clearLog() {
  apiLog.value = []
}
</script>

<template>
  <FeatureDemo title="权限管理体系" content="包含 路由权限、按钮权限、接口权限 的全方位控制展示">
    <BSpace vertical class="wh-full">
      <!-- 顶部：身份切换 (路由权限) -->
      <NCard title="1. 身份与路由权限 (Route Permission)" size="small" segmented>
        <template #header-extra>
          <NTag type="info" bordered>当前用户: {{ currentUser }}</NTag>
        </template>
        <div class="section-desc">
          <NAlert type="info" :show-icon="true" title="路由级控制">
            点击下方不同角色卡片进行登录切换。系统会根据后端返回的角色/路由表，动态生成侧边菜单和可访问的路由。
          </NAlert>
        </div>
        <NGrid x-gap="12" y-gap="12" cols="1 s:1 m:3" responsive="screen" class="mt-4">
          <NGi v-for="user in userList" :key="user.username">
            <div class="user-card" :class="{ active: currentUser === user.username }" @click="handleSwitchUser(user)">
              <div class="avatar-con" :style="{ backgroundColor: user.color }">{{ user.avatar }}</div>
              <div class="info">
                <div class="title">{{ user.title }}</div>
                <div class="desc">{{ user.desc }}</div>
                <div class="tags">
                  <NTag size="small" v-for="r in user.role" :key="r" round>{{ r }}</NTag>
                </div>
              </div>
              <NSpin v-if="loadingLogin === user.username" class="spinner" size="small" />
            </div>
          </NGi>
        </NGrid>
      </NCard>

      <NGrid x-gap="16" y-gap="16" cols="1 s:1 m:2" responsive="screen" class="mt-4">
        <!-- 左侧：按钮权限 -->
        <NGi>
          <NCard title="2. 按钮显隐控制 (Button Permission)" size="small" class="h-full" segmented>
            <div class="flex flex-col gap-4">
              <NAlert type="success" title="指令控制：v-perm">
                前端通过自定义指令控制 DOM 元素的渲染或移除。<br />
                核心代码：<code>&lt;NButton v-perm="'{{ testPermissionCode }}'" /&gt;</code>
              </NAlert>

              <div class="control-panel">
                <span class="label">模拟后台权限配置：</span>
                <NSwitch :value="hasTestPerm" @update:value="toggleLocalPermission">
                  <template #checked>已拥有 {{ testPermissionCode }}</template>
                  <template #unchecked>无权限</template>
                </NSwitch>
              </div>

              <NDivider style="margin: 0; font-size: 12px; color: #999;">实际效果演示区域</NDivider>

              <div class="demo-area">
                <!-- 重点：这里使用了 vPermission 指令 -->
                <!-- 如果你的指令是全局注册的，可以直接用 v-perm -->
                <!-- 如果是局部注册，请确保 imported directives 被正确应用 -->
                <NButton v-perm="testPermissionCode" type="error" dashed>
                  <template #icon>
                    <div class="i-carbon-trash-can" />
                  </template>
                  拥有删除权限可见按钮
                </NButton>

                <NButton type="primary" ghost v-if="!hasTestPerm">
                  无权限时的占位符 (普通按钮)
                </NButton>
              </div>

              <div class="text-xs text-gray-400">
                * 当开关关闭时，上方的红色删除按钮将直接从 DOM 中移除
              </div>
            </div>
          </NCard>
        </NGi>

        <!-- 右侧：接口权限 -->
        <NGi>
          <NCard title="3. 接口鉴权 (API Permission)" size="small" class="h-full" segmented>
            <template #header-extra>
              <NButton text type="primary" @click="clearLog" size="small">清空日志</NButton>
            </template>
            <div class="flex flex-col gap-4 h-full">
              <NAlert type="warning" title="后端网关拦截">
                即使前端隐藏了按钮，恶意用户仍可能通过 Postman 调用接口。后端必须进行鉴权。
              </NAlert>

              <div class="api-control">
                <NButton type="info" @click="testApiPermission" :loading="apiLoading" secondary>
                  发送请求: Get Role List
                </NButton>
                <div class="ml-2 text-xs text-gray-500 flex-1">
                  API: <code>system.roles.getRoleList</code>
                </div>
              </div>

              <div class="log-window">
                <div v-if="apiLog.length === 0" class="empty-log">暂无请求日志</div>
                <div v-else class="log-content">
                  <div v-for="(log, index) in apiLog" :key="index" class="log-item"
                    :class="{ 'error': log.includes('Error'), 'success': log.includes('200') }">
                    {{ log }}
                  </div>
                </div>
              </div>
            </div>
          </NCard>
        </NGi>

      </NGrid>
    </BSpace>
  </FeatureDemo>
</template>

<style lang="scss" scoped>
.section-desc {
  margin-bottom: 10px;
}

/* User Card Styles */
.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background-color: var(--n-card-color);

  &:hover {
    border-color: var(--n-primary-color);
    box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
  }

  &.active {
    border-color: var(--n-primary-color);
    background-color: rgb(var(--n-primary-color-rgb) 0.05);

    &::after {
      content: '当前';
      position: absolute;
      top: 0;
      right: 0;
      background: var(--n-primary-color);
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-bottom-left-radius: 6px;
    }
  }

  .avatar-con {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;

    .title {
      font-weight: 600;
      font-size: 16px;
    }

    .desc {
      font-size: 12px;
      color: var(--n-text-color-3);
      margin: 2px 0 6px;
    }

    .tags {
      display: flex;
      gap: 4px;
    }
  }

  .spinner {
    position: absolute;
    right: 10px;
    top: 10px;
  }
}

/* Button Demo Area */
.control-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: var(--n-color-modal);
  border-radius: 6px;
}

.demo-area {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  border: 2px dashed var(--n-border-color);
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    border-color: var(--n-primary-color);
  }
}

/* API Log Area */
.api-control {
  display: flex;
  align-items: center;
}

.log-window {
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 12px;
  height: 150px;
  overflow-y: auto;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;

  .empty-log {
    color: #666;
    text-align: center;
    margin-top: 40px;
  }

  .log-item {
    margin-bottom: 4px;
    word-break: break-all;

    &.success {
      color: #63e2b7;
    }

    &.error {
      color: #e88080;
    }
  }
}
</style>