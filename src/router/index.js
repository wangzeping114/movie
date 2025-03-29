import { createRouter, createWebHistory } from 'vue-router'
import ShortVideo from '../views/ShortVideo.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import Publish from '../views/Publish.vue'
import Messages from '../views/Messages.vue'
import Live from '../views/Live.vue'

const routes = [
  {
    path: '/',
    redirect: '/short-video'
  },
  {
    path: '/short-video',
    name: 'ShortVideo',
    component: ShortVideo,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: Publish,
    meta: { requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages
  },
  {
    path: '/live',
    name: 'Live',
    component: Live
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (to.meta.requiresAuth && !user.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router 