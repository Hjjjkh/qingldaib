<template>
  <n-config-provider :theme="lightThemeOverrides">
    <router-view />
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, lightTheme } from 'naive-ui';
import type { GlobalTheme } from 'naive-ui';

const lightThemeOverrides: GlobalTheme = {
  ...lightTheme,
  common: {
    ...lightTheme.common,
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
