<template>
  <div class="dashboard">
    <n-grid :cols="2" :x-gap="24">
      <n-gi>
        <n-card title="📊 总览">
          <n-statistic label="总约定数" :value="stats.total_commitments" />
          <n-divider />
          <n-statistic label="已完成" :value="stats.completed_commitments" />
          <n-divider />
          <n-statistic label="完成率" :value="`${stats.completion_rate}%`" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="💫 本月打卡">
          <n-statistic label="本月打卡次数" :value="stats.monthly_checkins" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-divider />

    <n-card title="📈 打卡趋势">
      <div v-if="loading" style="text-align: center; padding: 40px;">
        <n-spin size="large" />
      </div>
      <div v-else class="chart-container" ref="chartRef"></div>
    </n-card>

    <n-divider />

    <n-card title="💡 快速开始">
      <n-space>
        <n-button type="primary" @click="$router.push('/commitments/create')">
          ➕ 添加新约定
        </n-button>
        <n-button @click="$router.push('/commitments')">
          📝 查看所有约定
        </n-button>
        <n-button @click="$router.push('/meetings')">
          📅 创建见面记录
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import axios from 'axios';

const stats = ref({
  total_commitments: 0,
  completed_commitments: 0,
  completion_rate: 0,
  monthly_checkins: 0,
});
const loading = ref(true);
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: ECharts | null = null;

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/statistics/overview');
    stats.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loading.value = false;
  }
};

const fetchMonthlyData = async () => {
  try {
    const response = await axios.get('/api/statistics/monthly');
    const data = response.data.data;
    
    if (chartRef.value) {
      chartInstance = echarts.init(chartRef.value);
      
      const option = {
        xAxis: {
          type: 'category',
          data: data.map((item: any) => item.month),
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: data.map((item: any) => item.count),
            type: 'line',
            smooth: true,
            itemStyle: { color: '#ff6b99' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 107, 153, 0.3)' },
                { offset: 1, color: 'rgba(255, 107, 153, 0.0)' },
              ]),
            },
          },
        ],
      };
      
      chartInstance.setOption(option);
    }
  } catch (error) {
    console.error('Failed to fetch monthly data:', error);
  }
};

onMounted(() => {
  fetchStats();
  fetchMonthlyData();
  
  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>
