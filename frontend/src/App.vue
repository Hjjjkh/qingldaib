<template>
  <n-config-provider :theme="theme">
    <router-view />
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider } from 'naive-ui';
import { GlobalTheme } from 'naive-ui';

const theme: GlobalTheme = {
  common: {
    primaryColor: '#ff6b99',
    primaryColorHover: '#ff8fb3',
    primaryColorPressed: '#ff4d80',
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #fff5f8 0%, #ffe4ec 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>
