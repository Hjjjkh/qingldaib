<template>
  <div class="meeting-list">
    <div class="header-actions">
      <n-space>
        <n-button type="primary" @click="showModal = true">
          ➕ 添加见面记录
        </n-button>
      </n-space>
    </div>

    <n-timeline>
      <n-timeline-item
        v-for="meeting in meetings"
        :key="meeting.id"
        :title="meeting.date"
        :content="meeting.location || '未指定地点'"
        :description="meeting.notes"
        type="success"
      >
        <template #footer>
          <n-space>
            <n-button size="small" @click="handleEdit(meeting)">编辑</n-button>
            <n-button size="small" strong secondary type="error" @click="handleDelete(meeting.id)">删除</n-button>
          </n-space>
        </template>
      </n-timeline-item>
    </n-timeline>

    <n-modal v-model:show="showModal" :title="editingMeeting ? '编辑见面记录' : '添加见面记录'">
      <n-form ref="formRef" :model="formData" style="margin-top: 16px;">
        <n-form-item label="日期" required>
          <n-date-picker v-model:value="formData.date" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="地点">
          <n-input v-model:value="formData.location" placeholder="见面地点" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="formData.notes" type="textarea" placeholder="备注信息" :rows="3" />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" :loading="loading" @click="handleSubmit">
              {{ editingMeeting ? '保存修改' : '创建记录' }}
            </n-button>
            <n-button @click="showModal = false">取消</n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import axios from 'axios';

const message = useMessage();
const dialog = useDialog();

const meetings = ref<any[]>([]);
const showModal = ref(false);
const loading = ref(false);
const editingMeeting = ref<any>(null);

const formData = reactive({
  date: Date.now(),
  location: '',
  notes: '',
});

const fetchMeetings = async () => {
  try {
    const response = await axios.get('/api/meetings');
    meetings.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const data = {
      date: new Date(formData.date).toISOString().split('T')[0],
      location: formData.location,
      notes: formData.notes,
    };
    
    if (editingMeeting.value) {
      await axios.put(`/api/meetings/${editingMeeting.value.id}`, data);
      message.success('更新成功');
    } else {
      await axios.post('/api/meetings', data);
      message.success('创建成功');
    }
    
    showModal.value = false;
    fetchMeetings();
  } catch (error: any) {
    message.error('操作失败');
  } finally {
    loading.value = false;
  }
};

const handleEdit = (meeting: any) => {
  editingMeeting.value = meeting;
  formData.date = new Date(meeting.date).getTime();
  formData.location = meeting.location || '';
  formData.notes = meeting.notes || '';
  showModal.value = true;
};

const handleDelete = (id: string) => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条见面记录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await axios.delete(`/api/meetings/${id}`);
        message.success('删除成功');
        fetchMeetings();
      } catch (error) {
        message.error('删除失败');
      }
    },
  });
};

onMounted(() => {
  fetchMeetings();
});
</script>

<style scoped>
.meeting-list {
  max-width: 800px;
}

.header-actions {
  margin-bottom: 24px;
}
</style>
