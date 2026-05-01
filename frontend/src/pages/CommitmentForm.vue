<template>
  <div class="commitment-form">
    <n-card :title="isEdit ? '编辑约定' : '添加新约定'">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item label="标题" path="title">
          <n-input v-model:value="formData.title" placeholder="请输入约定标题" />
        </n-form-item>
        
        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            placeholder="请输入约定描述"
            :rows="4"
          />
        </n-form-item>
        
        <n-form-item label="分类" path="category">
          <n-select v-model:value="formData.category" :options="categoryOptions" placeholder="请选择分类" />
        </n-form-item>
        
        <n-form-item>
          <n-space>
            <n-button type="primary" :loading="loading" @click="handleSubmit">
              {{ isEdit ? '保存修改' : '创建约定' }}
            </n-button>
            <n-button @click="$router.back()">
              取消
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useCommitmentStore } from '../stores/commitment';

const router = useRouter();
const route = useRoute();
const message = useMessage();
const store = useCommitmentStore();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);

const categoryOptions = [
  { label: '🍽️ 吃饭', value: 'eating' },
  { label: '🎬 看电影', value: 'movie' },
  { label: '✈️ 旅行', value: 'travel' },
  { label: '🛍️ 购物', value: 'shopping' },
  { label: '🎮 娱乐', value: 'entertainment' },
  { label: '📌 其他', value: 'other' },
];

const formData = reactive({
  title: '',
  description: '',
  category: '',
});

const rules = {
  title: {
    required: true,
    message: '请输入标题',
    trigger: 'blur',
  },
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (isEdit.value) {
      await store.updateCommitment(route.params.id as string, formData);
      message.success('更新成功');
    } else {
      await store.createCommitment(formData);
      message.success('创建成功');
    }
    router.push('/commitments');
  } catch (error: any) {
    message.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
};

// 编辑模式加载数据
if (isEdit.value) {
  store.fetchCommitment(route.params.id as string).then((data) => {
    formData.title = data.title;
    formData.description = data.description || '';
    formData.category = data.category || '';
  });
}
</script>

<style scoped>
.commitment-form {
  max-width: 600px;
}
</style>
