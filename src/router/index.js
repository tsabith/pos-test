import { createRouter, createWebHistory } from 'vue-router';
import KasirView from '../views/KasirView.vue';
import { useAuthStore } from '../stores/authStore';

const routes = [
  {
    path: '/',    
    redirect: '/kasir'
  },
  {
    path: '/kasir',
    name: 'Kasir',
    component: KasirView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Untuk demo, auto-login sebagai admin
    authStore.login('admin', 'admin').then(() => {
      next();
    });
  } else {
    next();
  }
});

export default router;
