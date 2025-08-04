<script lang='ts' setup>
import { useThemeStore } from '@/theme'
import { spacing } from '@/utils/style/cssVars'
import { flowTrendOption, pageViewOption, pieOption } from './data/options'

const themeStore = useThemeStore()
const userStore = useUserStore()

const flowTrendOptionComputed = computed(() => flowTrendOption)
const pageViewOptionComputed = computed(() => pageViewOption)
const techStackOptionComputed = computed(() => pieOption)

const { t } = useLocale()

// 动态数据源
const targets = [
  {
    title: '无障碍模式',
    icon: 'i-mdi-speedometer',
    desc: '所有组件支持无障碍模式，支持键盘操作，支持屏幕阅读器等辅助功能',
  },
  {
    title: '微前端架构',
    icon: 'i-mdi-application-braces',
    desc: '基于qiankun实现模块化子应用拆分',
  },
  {
    title: '权限治理',
    icon: 'i-mdi-shield-account',
    desc: '实现RBAC三级权限控制体系',
  },
  {
    title: 'Monorepo 架构',
    icon: 'i-mdi-warehouse ',
    desc: '利用单一仓库来管理多个packages',
  },
]

const title = computed(() => {
  return `🍌${t('app.title')} ${__APP_INFO__.pkg.version}`
})
</script>

<template>
  <div class="dashboard-container">
    <BSpace vertical size="medium">
      <NGrid cols="5" :x-gap="spacing.sm.get()" :y-gap="spacing.md.get()" item-responsive>
        <NGridItem span="5 400:5 600:2">
          <NCard title="" :bordered="false" class="h-full">
            <div class="h-full flex flex-col justify-between gap-y-[--space-sm]">
              <div class="flex items-center gap-x-[--space-md]">
                <NAvatar
                  round :size="68" :src="userStore.getDispalyUserInfo.avatar"
                  class="flex-shrink-0 border-2 border-white/20 shadow-sm"
                />
                <div class="min-w-0 flex-col">
                  <div class="max-w-[240px] text-truncate text-[17px] text-gray-800 font-medium dark:text-gray-200">
                    Hello, {{ userStore.getDispalyUserInfo.userName }}
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-[--space-md]">
                <div class="box">
                  角色权限
                </div>
                <NTag
                  v-for="(tag, idx) in userStore.getDispalyUserInfo.role" :key="idx" size="small"
                  :color="{ text: '#4b5563', border: '1px solid #e5e7eb' }" class="backdrop-blur-sm !h-6 !px-2"
                >
                  {{ tag }}
                </NTag>
              </div>

              <div class="">
                <p class="text-[15px] text-gray-500/90 leading-6 italic dark:text-gray-400">
                  🌟 成功不属于跑得最快的人，而是属于一直在奔跑的人。
                </p>
                <p class="mt-4 text-right text-sm text-gray-400/80 tracking-wide">
                  —— 查尔斯·史考伯
                </p>
              </div>
            </div>
          </NCard>
        </NGridItem>

        <NGridItem span="5 400:5 600:3">
          <NCard :title="title" :bordered="false" class="h-full">
            <template #header-extra>
              <a class="text-[15px] text-primary/90 transition-all hover:text-primary" href="https://github.com/fffmoon/banana-flow-admin" target="_blank">
                官方文档 →
              </a>
            </template>

            <div class="text-[15px] text-gray-600/90 leading-7 space-y-4 dark:text-gray-300">
              <div class="flex items-start gap-[--space-md]">
                <div class="i-ion:rocket mt-1 text-lg text-emerald-600/90" />
                <span>基于 Vue3 + NestJS 的全栈解决方案，零配置接入企业级开发规范</span>
              </div>
              <div class="flex items-start gap-[--space-md]">
                <div class="i-ion:layers mt-1 text-lg text-purple-600/90" />
                <span>模块化架构设计，支持可视化编排和动态扩展，满足多样化业务场景</span>
              </div>
              <div class="flex items-start gap-[--space-md]">
                <div class="i-ion:stats-chart mt-1 text-lg text-cyan-600/90" />
                <span>全链路监控体系，实时追踪系统健康状态，保障业务连续性</span>
              </div>
            </div>

            <footer class="mt-8 flex items-center justify-end gap-[--space-sm]">
              <NButton type="primary" ghost class="font-medium !h-9 !px-[--space-sm]" tag="a" href="https://github.com/fffmoon/banana-flow-admin" target="__blank">
                <template #icon>
                  <div class="i-mdi-document text-lg"></div>
                </template>
                开发指南
              </NButton>
              <NButton
                type="primary" class="font-medium shadow-sm !h-9 !px-[--space-sm]" tag="a" href="https://github.com/fffmoon/banana-flow-admin"
                target="__blank"
              >
                <template #icon>
                  <div class="i-mdi-github text-lg"></div>
                </template>
                源码仓库
              </NButton>
            </footer>
          </NCard>
        </NGridItem>
      </NGrid>

      <NGrid cols="5" :x-gap="spacing.sm.get()" :y-gap="spacing.md.get()" item-responsive>
        <NGridItem span="5 500:5 800:3">
          <NCard title="🎯 下一步目标方向" :bordered="false" class="h-full shadow-sm">
            <div
              class="h-full flex flex-col justify-around gap-y-[--space-md] text-[16px] text-gray-600/90 leading-7 dark:text-gray-300"
            >
              <div v-for="(item, index) in targets" :key="index" class="group flex items-start gap-[--space-md]">
                <div
                  class="mt-2 text-lg transition-transform group-hover:rotate-45" :class="`${item.icon}`"
                  :style="{ color: 'rgb(var(--primary-color))' }"
                >
                </div>
                <div class="flex-1">
                  <h4 class="mb-1 font-medium">
                    {{ item.title }}
                  </h4>
                  <p class="text-sm opacity-80">
                    {{ item.desc }}
                  </p>
                </div>
              </div>
            </div>
          </NCard>
        </NGridItem>

        <NGridItem span="5 500:5 800:2">
          <NCard title="🛠️ 技术栈分布" :bordered="false" class="h-full">
            <div class="h-full flex flex-col">
              <div class="h-[240px] sm:h-[280px]">
                <BetterEcharts
                  :theme="themeStore.getIsDarkTheme ? 'dark' : 'light'"
                  :option="techStackOptionComputed"
                />
              </div>
            </div>
          </NCard>
        </NGridItem>
      </NGrid>

      <NCard title="" :bordered="false">
        <NTabs type="line" default-value="flowTrend" animated>
          <NTabPane name="flowTrend">
            <template #tab>
              <div class="flex items-center gap-1">
                <div class="i-mdi-source-commit text-lg text-purple-500" />
                <span>代码活跃趋势</span>
              </div>
            </template>
            <div class="h-[280px] sm:h-[400px]">
              <BetterEcharts :theme="themeStore.getIsDarkTheme ? 'dark' : 'light'" :option="flowTrendOptionComputed" />
            </div>
          </NTabPane>
          <NTabPane name="pageView">
            <template #tab>
              <div class="flex items-center gap-1">
                <div class="i-mdi-chart-areaspline-variant text-lg text-blue-500" />
                <span>流量增长趋势</span>
              </div>
            </template>
            <div class="h-[280px] sm:h-[400px]">
              <BetterEcharts :theme="themeStore.getIsDarkTheme ? 'dark' : 'light'" :option="pageViewOptionComputed" />
            </div>
          </NTabPane>
        </NTabs>
      </NCard>
    </BSpace>
  </div>
</template>
