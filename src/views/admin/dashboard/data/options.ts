import type { EChartsOption } from 'echarts'

export const flowTrendOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    formatter: '{b0}<br />{a0}: {c0}次',
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: {
      lineStyle: {
        color: '#9ca3af',
      },
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: '#e5e7eb',
      },
    },
  },
  series: [{
    name: '代码提交',
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 8,
    itemStyle: {
      color: '#6366f1',
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0,
          color: '#6366f1',
        }, {
          offset: 1,
          color: 'rgba(99, 102, 241, 0.1)',
        }],
      },
    },
    data: [45, 82, 68, 95, 130, 142, 118],
  }],
}

export const pageViewOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    formatter: '{b0}<br />访问量: {c0}',
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    axisLine: {
      lineStyle: {
        color: '#9ca3af',
      },
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: '#e5e7eb',
      },
    },
  },
  series: [{
    name: '访问量',
    type: 'bar',
    barWidth: '60%',
    itemStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0,
          color: '#3b82f6',
        }, {
          offset: 1,
          color: '#60a5fa',
        }],
      },
      borderRadius: [4, 4, 0, 0],
    },
    data: [4500, 5200, 6100, 7300, 8200, 9500],
  }],
}

export const pieOption: EChartsOption = {
  tooltip: {
    trigger: 'item',
    formatter({ name, value }) {
      return `${name} ${value}%`
    },
  },
  legend: {
    left: 'center',
  },
  series: [
    {
      top: '14%',
      type: 'pie',
      radius: ['35%', '80%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 36,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 38.5, name: 'Vue' },
        { value: 37.0, name: 'TypeScript' },
        { value: 6.5, name: 'CSS' },
        { value: 6.2, name: 'HTML' },
        { value: 1.8, name: 'Other' },
      ],
    },
  ],
}
