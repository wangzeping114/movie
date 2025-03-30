<template>
  <div class="followers-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="back-btn" @click="router.back()">
        <span class="material-icons">arrow_back</span>
      </div>
      <h1>{{ isCurrentUser ? '我的粉丝' : `${username}的粉丝` }}</h1>
      <div class="nav-actions"></div>
    </div>

    <!-- 粉丝列表 -->
    <div class="followers-list" v-if="followers.length > 0">
      <div class="follower-item" v-for="follower in followers" :key="follower.id">
        <div class="follower-avatar" @click="goToUserProfile(follower.id)">
          <img :src="follower.avatar" :alt="follower.username">
        </div>
        <div class="follower-info" @click="goToUserProfile(follower.id)">
          <div class="follower-name">{{ follower.username }}</div>
          <div class="follower-bio">{{ follower.bio }}</div>
        </div>
        <div class="follow-action">
          <button 
            class="follow-btn" 
            :class="{ 'followed': follower.isFollowed }" 
            @click="toggleFollow(follower)"
            v-if="!isCurrentUser || !follower.isCurrentUser"
          >
            {{ follower.isFollowed ? '已关注' : '关注' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <span class="material-icons">people_outline</span>
      <p>{{ isCurrentUser ? '还没有人关注你' : `还没有人关注${username}` }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userId = route.params.id
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isCurrentUser = computed(() => !userId || userId === user.id)
const username = ref('')
const followers = ref([])

// 获取用户名
onMounted(() => {
  // 在实际应用中，这里应该从API获取用户信息
  if (isCurrentUser.value) {
    username.value = user.username || '我'
  } else {
    username.value = '用户' + userId
  }
  
  // 获取粉丝列表
  fetchFollowers()
})

// 获取粉丝列表
const fetchFollowers = () => {
  // 这里应该从API获取粉丝列表
  // 模拟API返回数据
  const mockFollowers = Array.from({ length: 20 }, (_, index) => ({
    id: 'follower_' + (index + 1),
    username: '用户' + (index + 1),
    avatar: 'https://randomuser.me/api/portraits/' + (index % 2 ? 'women' : 'men') + '/' + (index + 1) + '.jpg',
    bio: '这是用户' + (index + 1) + '的个人简介',
    isFollowed: Math.random() > 0.5,
    isCurrentUser: index === 0 && isCurrentUser.value
  }))
  
  followers.value = mockFollowers
}

// 跳转到用户资料页
const goToUserProfile = (id) => {
  // 检查是否为当前用户
  if (id === user.id) {
    router.push('/profile')
  } else {
    router.push(`/user/${id}`)
  }
}

// 关注/取消关注用户
const toggleFollow = (follower) => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: route.fullPath }
    })
    return
  }
  
  // 更新关注状态
  follower.isFollowed = !follower.isFollowed
  
  // 这里应该调用API更新关注状态
  console.log(`${follower.isFollowed ? '关注' : '取消关注'}用户:`, follower.id)
}
</script>

<style scoped>
.followers-container {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  padding-bottom: 60px;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.back-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-bar h1 {
  font-size: 18px;
  font-weight: 600;
  color: #d4af37;
  margin: 0;
  flex-grow: 1;
  text-align: center;
}

.followers-list {
  padding: 72px 16px 16px;
}

.follower-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.follower-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  cursor: pointer;
}

.follower-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.follower-info {
  flex-grow: 1;
  overflow: hidden;
  cursor: pointer;
}

.follower-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #ffffff;
}

.follower-bio {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follow-btn {
  background: linear-gradient(135deg, #d4af37, #e5c158);
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  color: #000;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.follow-btn.followed {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.follow-btn:active {
  transform: scale(0.95);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state .material-icons {
  font-size: 64px;
  margin-bottom: 20px;
  color: rgba(212, 175, 55, 0.5);
}

.empty-state p {
  font-size: 16px;
}
</style> 