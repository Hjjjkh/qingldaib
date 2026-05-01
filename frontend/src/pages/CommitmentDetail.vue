<template>
  <div class="commitment-detail" v-if="commitment">
    <n-card :title="commitment.title">
      <template #header-extra>
        <n-space>
          <n-button @click="$router.push(`/commitments/${commitment.id}/edit`)">
            ✏️ 编辑
          </n-button>
          <n-button
            :type="commitment.status === 'completed' ? 'success' : 'primary'"
            @click="handleCheckin"
          >
            {{ commitment.status === 'completed' ? '✅ 已打卡' : '🎉 打卡' }}
          </n-button>
          <n-button strong secondary circle @click="handleDelete">
            🗑️
          </n-button>
        </n-space>
      </template>
      
      <n-descriptions bordered :column="1">
        <n-descriptions-item label="分类">
          {{ getCategoryLabel(commitment.category) }}
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="commitment.status === 'completed' ? 'success' : 'warning'">
            {{ commitment.status === 'completed' ? '已完成' : '未完成' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="描述">
          {{ commitment.description || '无描述' }}
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">
          {{ new Date(commitment.created_at * 1000).toLocaleString('zh-CN') }}
        </n-descriptions-item>
        <n-descriptions-item v-if="commitment.completed_at" label="完成时间">
          {{ new Date(commitment.completed_at * 1000).toLocaleString('zh-CN') }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMessage, useDialog } from 'naive-ui';
import { useCommitmentStore } from '../stores/commitment';

const router = useRouter();
const route = useRoute();
const message = useMessage();
const dialog = useDialog();
const store = useCommitmentStore();

const commitment = ref<any>(null);
const loading = ref(false);

const getCategoryLabel = (category?: string) => {
  const map: Record<string, string> = {
    eating: '🍽️ 吃饭',
    movie: '🎬 看电影',
    travel: '✈️ 旅行',
    shopping: '🛍️ 购物',
    entertainment: '🎮 娱乐',
    other: '📌 其他',
  };
  return map[category || 'other'] || '📌 其他';
};

const handleCheckin = async () => {
  try {
    if (commitment.value?.status === 'completed') {
      await store.cancelCheckin(route.params.id as string);
      message.success('已取消打卡');
    } else {
      await store.checkin(route.params.id as string);
      message.success('打卡成功');
    }
    await loadCommitment();
  } catch (error: any) {
    message.error('操作失败');
  }
};

const handleDelete = () => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这个约定吗？此操作不可恢复。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await store.deleteCommitment(route.params.id as string);
        message.success('删除成功');
        router.push('/commitments');
      } catch (error: any) {
        message.error('删除失败');
      }
    },
  });
};

const loadCommitment = async () => {
  loading.value = true;
  commitment.value = await store.fetchCommitment(route.params.id as string);
  loading.value = false;
};

loadCommitment();
</script>

<style scoped>
.commitment-detail {
  max-width: 800px;
}
</style>
