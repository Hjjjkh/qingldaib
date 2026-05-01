<template>
  <div class="login-page">
    <n-card class="login-card" title="💕 欢迎回来">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password-on="click"
            @keyup.enter="handleLogin"
          />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" block size="large" :loading="loading" @click="handleLogin">
            登录
          </n-button>
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
  password: '',
});

const rules = {
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur',
  },
};

const handleLogin = async () => {
  loading.value = true;
  try {
    await authStore.login(formData.password);
    message.success('登录成功');
    router.push('/');
  } catch (error: any) {
    message.error(error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f8 0%, #ffe4ec 100%);
}

.login-card {
  width: 400px;
  box-shadow: 0 4px 12px rgba(255, 107, 153, 0.15);
}

.login-card :deep(.n-card__header) {
  text-align: center;
  font-size: 24px;
}
</style>
