<template>
  <div class="commitment-list">
    <div class="header-actions">
      <n-space>
        <n-select
          v-model:value="filterStatus"
          :options="statusOptions"
          placeholder="筛选状态"
          style="width: 150px"
          clearable
          @update:value="handleFilter"
        />
        <n-button type="primary" @click="$router.push('/commitments/create')">
          ➕ 添加约定
        </n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="columns"
      :data="store.commitments"
      :loading="store.loading"
      :pagination="pagination"
      striped
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue';
import { NTag, NButton } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useCommitmentStore, type Commitment } from '../stores/commitment';
import { useMessage } from 'naive-ui';

const router = useRouter();
const message = useMessage();
const store = useCommitmentStore();

const filterStatus = ref<string | null>(null);

const statusOptions = [
  { label: '未完成', value: 'pending' },
  { label: '已完成', value: 'completed' },
];

const handleFilter = () => {
  store.fetchCommitments({ status: filterStatus.value || undefined });
};

const columns = computed(() => [
  {
    title: '标题',
    key: 'title',
    ellipsis: { tooltip: true },
    render: (row: Commitment) =>
      h('div', { style: 'font-weight: 500' }, [row.title]),
  },
  {
    title: '分类',
    key: 'category',
    width: 120,
    render: (row: Commitment) => {
      const categoryMap: Record<string, string> = {
        eating: '🍽️ 吃饭',
        movie: '🎬 看电影',
        travel: '✈️ 旅行',
        shopping: '🛍️ 购物',
        entertainment: '🎮 娱乐',
        other: '📌 其他',
      };
      return categoryMap[row.category || 'other'] || '📌 其他';
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: Commitment) =>
      h(NTag, {
        type: row.status === 'completed' ? 'success' : 'warning',
        bordered: false,
      }, {
        default: () => row.status === 'completed' ? '✅ 已完成' : '⏳ 未完成',
      }),
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 180,
    render: (row: Commitment) =>
      new Date(row.created_at * 1000).toLocaleDateString('zh-CN'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row: Commitment) =>
      h('div', { style: 'display: flex; gap: 8px' }, [
        h(NButton, {
          size: 'small',
          onClick: () => router.push(`/commitments/${row.id}`),
        }, { default: () => '查看' }),
        h(NButton, {
          size: 'small',
          onClick: async () => {
            if (row.status === 'completed') {
              await store.cancelCheckin(row.id);
              message.success('已取消打卡');
            } else {
              await store.checkin(row.id);
              message.success('打卡成功');
            }
          },
        }, {
          default: () => row.status === 'completed' ? '取消打卡' : '打卡',
        }),
      ]),
  },
]);

const pagination = computed(() => ({
  page: store.pagination.page,
  pageSize: store.pagination.limit,
  itemCount: 0,
  onChange: (page: number) => {
    store.fetchCommitments({ page, status: filterStatus.value || undefined });
  },
}));

store.fetchCommitments();
</script>

<style scoped>
.commitment-list {
  max-width: 1200px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
