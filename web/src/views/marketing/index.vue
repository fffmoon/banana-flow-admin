<script lang="ts" setup>
import type { EChartsOption } from 'echarts'
import { useThemeStore } from '@/theme'
import { spacing } from '@/utils/style/cssVars'
import { ArrowDown, ArrowUp } from '@vicons/ionicons5'
import { computed, ref } from 'vue'

const themeStore = useThemeStore()

// 核心指标数据
const metrics = ref([
  { title: '总用户数', value: '152,380', trend: 12.5, icon: 'i-mdi-account-group' },
  { title: '转化率', value: '23.8%', trend: 8.2, icon: 'i-mdi-chart-arc' },
  { title: '收入增长', value: '¥2.8M', trend: 18.4, icon: 'i-mdi-finance' },
  { title: 'ROI', value: '326%', trend: 5.7, icon: 'i-mdi-trending-up' },
])

// 用户增长图表
const userGrowthOptions = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
  },
  yAxis: { type: 'value' },
  series: [{
    data: [820, 932, 901, 934, 1290, 1330, 1520],
    type: 'line',
    smooth: true,
    areaStyle: { color: 'rgba(79, 70, 229, 0.2)' },
    lineStyle: { color: '#4f46e5' },
  }],
}))

// 用户来源分布
const sourceOptions = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: [
      { value: 1048, name: '自然搜索' },
      { value: 735, name: '社交媒体' },
      { value: 580, name: '直接访问' },
      { value: 484, name: '邮件营销' },
    ],
    itemStyle: {
      borderRadius: 5,
      borderColor: themeStore.getIsDarkTheme ? '#1f2937' : '#fff',
      borderWidth: 2,
    },
  }],
}))

const realTimeData = ref([
  { label: '当前在线用户', value: '2,384', animate: true },
  { label: '今日订单量', value: '1,028', animate: true },
  { label: '客单价', value: '¥268' },
  { label: '支付成功率', value: '98.2%' },
])

const funnelSteps = ['曝光', '点击', '加购', '下单', '支付']
</script>

<template>
  <div class="marketing-dashboard">
    <BSpace vertical size="medium">
      <NGrid cols="1 500:2 1000:4" :x-gap="spacing.sm.get()" :y-gap="spacing.md.get()">
        <!-- 核心指标 -->
        <NGridItem v-for="(metric, index) in metrics" :key="index">
          <NCard class="base-ani hover:card-hover" :bordered="false">
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 flex items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <div :class="`${metric.icon} text-2xl text-indigo-600 dark:text-indigo-300`" />
              </div>
              <div>
                <div class="text-sm text-gray-500">
                  {{ metric.title }}
                </div>
                <div class="mt-1 text-2xl font-bold">
                  {{ metric.value }}
                </div>
                <div class="mt-1 text-sm" :class="metric.trend > 0 ? 'text-green-600' : 'text-red-600'">
                  <NIcon :component="metric.trend > 0 ? ArrowUp : ArrowDown" class="mr-1" />
                  {{ Math.abs(metric.trend) }}%
                </div>
              </div>
            </div>
          </NCard>
        </NGridItem>
      </NGrid>

      <NGrid cols="1 1000:2" :x-gap="spacing.sm.get()" :y-gap="spacing.md.get()">
        <!-- 用户增长图表 -->
        <NGridItem>
          <NCard title="📈 用户增长趋势" :bordered="false">
            <div class="h-80">
              <BetterEcharts :theme="themeStore.getIsDarkTheme ? 'dark' : 'light'" :option="userGrowthOptions" />
            </div>
          </NCard>
        </NGridItem>

        <!-- 用户来源 -->
        <NGridItem>
          <NCard title="🌍 用户来源" :bordered="false">
            <div class="h-80">
              <BetterEcharts :theme="themeStore.getIsDarkTheme ? 'dark' : 'light'" :option="sourceOptions" />
            </div>
          </NCard>
        </NGridItem>
      </NGrid>

      <NCard title="⏱️ 实时交易监控" :bordered="false">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div
            v-for="(item, index) in realTimeData" :key="index"
            class="real-time-item base-anis rounded-lg bg-gray-50 p-4 hover:card-hover dark:bg-gray-800"
          >
            <div class="text-sm text-gray-500">
              {{ item.label }}
            </div>
            <div class="mt-1 text-2xl font-bold" :class="{ 'animate-count-up': item.animate }">
              {{ item.value }}
            </div>
          </div>
        </div>
      </NCard>

      <NCard title="🔄 转化漏斗分析" :bordered="false">
        <div class="funnel-container">
          <div v-for="(step, index) in funnelSteps" :key="index" class="funnel-item">
            <div class="step-content">
              <div class="percentage text-indigo-600 dark:text-indigo-300">
                {{ 100 - index * 15 }}%
              </div>
              <div class="step-label bg-indigo-100 dark:bg-indigo-900">
                {{ step }}
              </div>
            </div>
            <div v-if="index < funnelSteps.length - 1" class="arrow">
              <div class="i-mdi-chevron-right text-2xl text-gray-400" />
            </div>
          </div>
        </div>
      </NCard>
    </BSpace>
  </div>
</template>

<style scoped lang="scss">
.funnel-container {
  --at-apply: flex items-center justify-center gap-4 overflow-x-auto py-4;

  .funnel-item {
    --at-apply: flex items-center gap-4;

    .step-content {
      --at-apply: flex flex-col items-center min-w-[80px];

      .percentage {
        --at-apply: mb-2 text-xl font-bold;
      }

      .step-label {
        --at-apply: h-8 w-full rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300;
      }
    }

    .arrow {
      --at-apply: text-gray-400 opacity-60;
    }

    &:hover {
      .step-label {
        --at-apply: bg-indigo-200 dark:bg-indigo-800 shadow-sm;
      }

      .arrow {
        --at-apply: opacity-100;
      }
    }

    @media (width <=640px) {
      --at-apply: gap-2;

      .step-content {
        --at-apply: min-w-[60px];

        .percentage {
          --at-apply: text-lg;
        }
      }

      .arrow {
        --at-apply: text-lg;
      }
    }
  }
}

.animate-count-up {
  animation: count-up 1s ease-out forwards;
}

@keyframes count-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
