import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/layouts/Layout.vue'),
    redirect: '/design',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'design',
        name: 'Design',
        component: () => import('@/views/Design.vue'),
        props: (route) => ({ key: route.query.new }),
        meta: { requiresAuth: true }
      },
      {
        path: 'designs',
        name: 'DesignList',
        component: () => import('@/views/DesignList.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'fonts',
        name: 'Fonts',
        component: () => import('@/views/Fonts.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'FAQ',
        name: 'FAQ',
        component: () => import('@/views/FAQ.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 检查路由是否需要认证
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // 如果路由需要认证且用户未登录，重定向到登录页面
  if (requiresAuth && !authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 保存原目标路由，登录后可以跳回
    })
    return
  }

  // 如果用户已登录且访问登录页，重定向到首页
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router
