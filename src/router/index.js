import { createRouter, createWebHistory } from 'vue-router'
import ShortVideo from '../views/ShortVideo.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/',
    redirect: '/short-video'
  },
  {
    path: '/short-video',
    name: 'ShortVideo',
    component: ShortVideo
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  next()
})

export default router 