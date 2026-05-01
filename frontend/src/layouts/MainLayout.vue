<template>
  <n-layout class="layout">
    <n-layout-header bordered class="header">
      <div class="header-content">
        <n-h1 style="margin: 0; font-size: 24px; color: #ff6b99;">💕 我们的约定</n-h1>
        <div class="nav">
          <n-button text @click="$router.push('/')">
            <template #icon><n-icon size="18">📊</n-icon></template>
            仪表盘
          </n-button>
          <n-button text @click="$router.push('/commitments')">
            <template #icon><n-icon size="18">📝</n-icon></template>
            约定清单
          </n-button>
          <n-button text @click="$router.push('/meetings')">
            <template #icon><n-icon size="18">📅</n-icon></template>
            见面记录
          </n-button>
          <n-dropdown :options="userMenuOptions">
            <n-button text>
              <template #icon><n-icon size="18">👤</n-icon></template>
            </n-button>
          </n-dropdown>
        </div>
      </div>
    </n-layout-header>
    <n-layout-content class="content">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { useRouter } from 'vue-router';
import { NIcon, useMessage, NButton } from 'naive-ui';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();

const userMenuOptions = [
  {
    label: '修改密码',
    key: 'password',
    icon: () => h(NIcon, null, { default: () => '🔒' }),
    onClick: () => router.push('/change-password'),
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => '🚪' }),
    onClick: async () => {
      try {
        await authStore.logout();
        message.success('已退出登录');
      } catch (error) {
        message.error('退出失败');
      }
    },
  },
];
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #ff6b99 0%, #ff8fb3 100%);
  color: white;
  padding: 0 24px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav .n-button {
  color: white;
}

.nav .n-button:hover {
  color: #ffe4ec;
}

.content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>
