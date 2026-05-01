<template>
  <div class="change-password">
    <n-card title="🔒 修改密码">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item label="当前密码" path="oldPassword">
          <n-input
            v-model:value="formData.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item label="新密码" path="newPassword">
          <n-input
            v-model:value="formData.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item label="确认新密码" path="confirmPassword">
          <n-input
            v-model:value="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" :loading="loading" @click="handleSubmit">
              确认修改
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();

const formRef = ref(null);
const loading = ref(false);

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const validateConfirmPassword = ({ value }: any) => {
  if (!value) {
    return new Error('请输入确认密码');
  } else if (value !== formData.newPassword) {
    return new Error('两次输入的密码不一致');
  }
};

const rules = {
  oldPassword: {
    required: true,
    message: '请输入当前密码',
    trigger: 'blur',
  },
  newPassword: {
    required: true,
    message: '请输入新密码',
    trigger: 'blur',
  },
  confirmPassword: {
    required: true,
    validator: validateConfirmPassword,
    trigger: 'blur',
  },
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    await authStore.changePassword(formData.oldPassword, formData.newPassword);
    message.success('密码修改成功');
    router.push('/');
  } catch (error: any) {
    message.error(error.message || '修改失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.change-password {
  max-width: 500px;
}
</style>
