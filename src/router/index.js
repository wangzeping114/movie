import { createRouter, createWebHistory } from 'vue-router'
import ShortVideo from '../views/ShortVideo.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import Publish from '../views/Publish.vue'
import Messages from '../views/Messages.vue'
import Live from '../views/Live.vue'
import LiveView from '../views/LiveView.vue'
import ChatView from '../views/ChatView.vue'
import Settings from '../views/Settings.vue'
import About from '../views/About.vue'
import FollowList from '../views/FollowList.vue'

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
    path: '/s/:id',
    name: 'SharedVideo',
    component: ShortVideo,
    props: true
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
    path: '/user/:id',
    name: 'UserProfile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/follow/:id?',
    name: 'FollowList',
    component: FollowList,
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
  },
  {
    path: '/live/:id',
    name: 'LiveView',
    component: LiveView
  },
  {
    path: '/chat/:id',
    name: 'chat',
    component: ChatView,
    meta: { noSwipe: true }
  },
  {
    path: '/chat/new',
    name: 'newChat',
    component: ChatView,
    meta: { isNewChat: true, noSwipe: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      requiresAuth: true
    }
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