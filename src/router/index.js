import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/extension/download',
    name: 'ExtensionDownload',
    component: () => import('../views/ExtensionDownload.vue')
  },
  {
    path: '/',
    component: () => import('../layout/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard')
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue')
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('../views/OrderList.vue')
      },
      {
        path: 'villainsSearch',
        name: 'VillainsSearch',
        component: () => import('../views/VillainsSearch.vue')
      },
      {
        path: 'riskSearch',
        name: 'RiskSearch',
        component: () => import('../views/RiskSearch.vue')
      },
      {
        path: 'reportManage',
        name: 'ReportManage',
        component: () => import('../views/ReportManage/index.vue')
      },
      {
        path: 'extension/manage',
        name: 'ExtensionManage',
        component: () => import('../views/ExtensionManage.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && to.path !== '/register' && to.path !== '/extension/download') {
    if (!token) {
      return next('/login')
    }
  }
  next()
})

export default router
