import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<any>(null);

  const isAuthenticated = computed(() => !!token.value);

    const login = async (password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { password });
      const newToken = response.data.token;
      token.value = newToken;
      user.value = response.data.user;
      localStorage.setItem('token', newToken);
      
      // 设置 axios 默认 header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
      throw new Error('登录失败，请检查密码');
    }
  };

  const logout = async () => {
    try {
      if (token.value) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await axios.post('/api/auth/change-password', {
        oldPassword,
        newPassword,
      });
    } catch (error) {
      throw new Error('修改密码失败');
    }
  };

  // 初始化时设置 token
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    changePassword,
  };
});
