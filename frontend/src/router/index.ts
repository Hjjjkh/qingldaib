import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../pages/Dashboard.vue'),
      },
      {
        path: 'commitments',
        name: 'Commitments',
        component: () => import('../pages/CommitmentList.vue'),
      },
      {
        path: 'commitments/create',
        name: 'CreateCommitment',
        component: () => import('../pages/CommitmentForm.vue'),
      },
      {
        path: 'commitments/:id',
        name: 'CommitmentDetail',
        component: () => import('../pages/CommitmentDetail.vue'),
      },
      {
        path: 'commitments/:id/edit',
        name: 'EditCommitment',
        component: () => import('../pages/CommitmentForm.vue'),
      },
      {
        path: 'meetings',
        name: 'Meetings',
        component: () => import('../pages/MeetingList.vue'),
      },
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('../pages/ChangePassword.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.path !== '/login' && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
